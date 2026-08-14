const { prisma } = require('../config/db');
const { recordAudit } = require('../utils/audit');
const { parseStatement } = require('../services/statementParser.service');
const { matchStatement, reconciliationSummary } = require('../services/reconciliation.service');
const { settlePayment } = require('./stripe.controller');

/**
 * Statement import and reconciliation.
 *
 * Settling a line moves real money in the ledger, so every settlement runs
 * through `settlePayment` — the same provider-agnostic path a Stripe webhook
 * uses. The money maths lives in exactly one place regardless of which rail
 * the payment came in on.
 */

/**
 * POST /api/v1/admin/statements
 *
 * Accepts the raw file as base64 in JSON, so no multipart middleware is needed
 * on this route and the payload is easy to replay when debugging a bad import.
 */
const importStatement = async (req, res, next) => {
    try {
        const { bankAccountId, filename, contentBase64, format } = req.body || {};

        if (!bankAccountId || !contentBase64) {
            return res.status(400).json({ error: 'bankAccountId and contentBase64 are required' });
        }

        const account = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } });
        if (!account) return res.status(404).json({ error: 'Bank account not found' });

        const buffer = Buffer.from(contentBase64, 'base64');
        if (buffer.length === 0) return res.status(400).json({ error: 'Statement file is empty' });

        let parsed;
        try {
            parsed = parseStatement(buffer, {
                filename: filename || 'statement',
                currency: account.currency,
                format,
            });
        } catch (error) {
            // A parse failure is the operator's problem to fix (wrong file,
            // wrong format), so it is a 400 with the reason, not a 500.
            return res.status(400).json({ error: `Could not read statement: ${error.message}` });
        }

        // Re-importing the same file must not duplicate its credits.
        const duplicate = await prisma.bankStatement.findUnique({
            where: { fileHash: parsed.fileHash },
            select: { id: true, filename: true, importedAt: true },
        });
        if (duplicate) {
            return res.status(409).json({
                error: `This exact file was already imported as "${duplicate.filename}" on ${duplicate.importedAt.toISOString().slice(0, 10)}.`,
                statementId: duplicate.id,
            });
        }

        const statement = await prisma.bankStatement.create({
            data: {
                bankAccountId,
                filename: filename || 'statement',
                format: parsed.format,
                periodStart: parsed.periodStart,
                periodEnd: parsed.periodEnd,
                importedById: req.user.id,
                lineCount: parsed.lines.length,
                fileHash: parsed.fileHash,
                lines: {
                    create: parsed.lines.map((l) => ({
                        amountMinor: l.amountMinor,
                        currency: l.currency,
                        valueDate: l.valueDate,
                        reference: l.reference,
                        description: l.description,
                        counterparty: l.counterparty,
                        lineHash: l.lineHash,
                    })),
                },
            },
        });

        // Classify immediately — an import that leaves everything unclassified
        // is just a file upload.
        const matchResult = await matchStatement(statement.id);

        recordAudit(req, {
            action: 'statement.import',
            targetType: 'statement',
            targetId: statement.id,
            targetLabel: statement.filename,
            metadata: {
                format: parsed.format,
                lines: parsed.lines.length,
                autoMatched: matchResult.auto.length,
                needsReview: matchResult.review.length,
                unattributed: matchResult.none.length,
            },
        });

        res.status(201).json({
            success: true,
            statement: { id: statement.id, format: parsed.format, lineCount: parsed.lines.length },
            match: {
                auto: matchResult.auto.length,
                review: matchResult.review.length,
                none: matchResult.none.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

/** GET /api/v1/admin/statements — import history. */
const listStatements = async (req, res, next) => {
    try {
        const statements = await prisma.bankStatement.findMany({
            orderBy: { importedAt: 'desc' },
            take: 50,
            include: {
                bankAccount: { select: { label: true, bankName: true, currency: true } },
                _count: { select: { lines: true } },
            },
        });
        res.status(200).json({ success: true, statements });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/admin/statement-lines?status=unmatched
 *
 * The break queue. Defaults to unmatched because that is the only bucket that
 * needs anyone's attention.
 */
const listStatementLines = async (req, res, next) => {
    try {
        const status = req.query.status;
        const where = {};
        if (status && ['unmatched', 'matched', 'ignored'].includes(status)) where.status = status;
        if (req.query.statementId) where.statementId = String(req.query.statementId);

        const [lines, summary] = await Promise.all([
            prisma.statementLine.findMany({
                where,
                orderBy: [{ valueDate: 'desc' }, { id: 'asc' }],
                take: 500,
                include: {
                    statement: {
                        select: {
                            filename: true,
                            format: true,
                            bankAccount: { select: { label: true, bankName: true } },
                        },
                    },
                },
            }),
            reconciliationSummary(),
        ]);

        // Suggested payments are resolved in one query rather than per line.
        const paymentIds = [...new Set(lines.map((l) => l.matchedPaymentId).filter(Boolean))];
        const payments = paymentIds.length
            ? await prisma.payment.findMany({
                  where: { id: { in: paymentIds } },
                  select: {
                      id: true,
                      providerRef: true,
                      amountMinor: true,
                      settledAmountMinor: true,
                      currency: true,
                      status: true,
                      user: { select: { name: true, email: true } },
                      project: { select: { title: true } },
                  },
              })
            : [];
        const byId = new Map(payments.map((p) => [p.id, p]));

        res.status(200).json({
            success: true,
            summary,
            lines: lines.map((l) => ({
                ...l,
                suggestedPayment: l.matchedPaymentId ? byId.get(l.matchedPaymentId) ?? null : null,
            })),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/admin/statement-lines/:id/settle
 *
 * Confirm a line against a payment and move the money.
 *
 * `paymentId` may be supplied to override the matcher's suggestion — an
 * operator investigating a break usually knows better than the rule did.
 */
const settleStatementLine = async (req, res, next) => {
    try {
        const line = await prisma.statementLine.findUnique({
            where: { id: req.params.id },
            include: { statement: { select: { filename: true } } },
        });
        if (!line) return res.status(404).json({ error: 'Statement line not found' });
        if (line.status === 'matched') {
            return res.status(409).json({ error: 'This line has already been matched.' });
        }
        if (line.amountMinor <= 0n) {
            return res.status(400).json({ error: 'Only credits can settle a payment.' });
        }

        const paymentId = req.body?.paymentId || line.matchedPaymentId;
        if (!paymentId) {
            return res.status(400).json({ error: 'No payment selected for this line.' });
        }

        const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        if (payment.currency !== line.currency) {
            return res.status(400).json({
                error: `Currency mismatch: line is ${line.currency}, payment is ${payment.currency}.`,
            });
        }

        const outstanding = payment.amountMinor - payment.settledAmountMinor;
        // A line that does not cover the balance leaves the payment partially
        // settled rather than pretending it is complete.
        const status = line.amountMinor >= outstanding ? 'succeeded' : 'partially_settled';

        // The same path a webhook takes: ledger entry, project funding,
        // investment activation. Keyed on the line id so re-settling is a no-op.
        await settlePayment({
            paymentId: payment.id,
            providerRef: payment.providerRef,
            status,
            eventId: `statement-line:${line.id}`,
            eventType: 'reconciliation.matched',
            settledAmountMinor: Number(line.amountMinor),
            methodType: null,
            raw: {
                statementLineId: line.id,
                statement: line.statement.filename,
                reference: line.reference,
                valueDate: line.valueDate,
            },
        });

        await prisma.statementLine.update({
            where: { id: line.id },
            data: {
                status: 'matched',
                matchedPaymentId: payment.id,
                matchedAt: new Date(),
                matchedById: req.user.id,
                matchNote: req.body?.paymentId ? 'Matched manually by an administrator' : line.matchNote,
            },
        });

        recordAudit(req, {
            action: 'statement.line.settle',
            targetType: 'statement_line',
            targetId: line.id,
            targetLabel: line.reference || line.description || 'Statement line',
            metadata: {
                paymentId: payment.id,
                amountMinor: String(line.amountMinor),
                currency: line.currency,
                resultingStatus: status,
                manual: Boolean(req.body?.paymentId),
            },
        });

        res.status(200).json({ success: true, status });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/admin/statement-lines/:id/ignore
 *
 * For lines that are genuinely not investor payments — bank charges, interest,
 * internal transfers. Ignoring is recorded, not deleted: an audit trail of what
 * an operator decided to disregard is exactly what a later investigation needs.
 */
const ignoreStatementLine = async (req, res, next) => {
    try {
        const line = await prisma.statementLine.findUnique({ where: { id: req.params.id } });
        if (!line) return res.status(404).json({ error: 'Statement line not found' });
        if (line.status === 'matched') {
            return res.status(409).json({ error: 'A matched line cannot be ignored.' });
        }

        const reason = String(req.body?.reason || '').trim();
        if (!reason) {
            return res.status(400).json({ error: 'A reason is required when ignoring a line.' });
        }

        await prisma.statementLine.update({
            where: { id: line.id },
            data: { status: 'ignored', matchNote: reason, matchedById: req.user.id, matchedAt: new Date() },
        });

        recordAudit(req, {
            action: 'statement.line.ignore',
            targetType: 'statement_line',
            targetId: line.id,
            targetLabel: line.reference || line.description || 'Statement line',
            metadata: { reason, amountMinor: String(line.amountMinor), currency: line.currency },
        });

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    importStatement,
    listStatements,
    listStatementLines,
    settleStatementLine,
    ignoreStatementLine,
};

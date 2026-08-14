const { prisma } = require('../config/db');
const { normaliseReference } = require('../payments/manualWire.adapter');

/**
 * Matching statement lines to payments.
 *
 * The rule that matters: **auto-match only on certainty**. A wrong automatic
 * match credits one investor with another's money, which is far worse than
 * leaving a line for a human to look at. So a line is matched automatically
 * only when the reference is unambiguous *and* the amount agrees exactly.
 * Everything else becomes a break for an operator to resolve.
 */

/** Payment states that can still receive money. */
const OPEN_STATUSES = ['awaiting_funds', 'partially_settled', 'pending'];

/**
 * Does this statement line quote the payment's reference?
 *
 * Banks bury the reference in whatever free text they feel like, and mangle
 * case and punctuation on the way, so both sides are normalised and the line's
 * text is searched for the payment's reference as a substring.
 */
function referenceMatches(line, providerRef) {
    const needle = normaliseReference(providerRef);
    if (!needle || needle.length < 6) return false;

    const haystack = normaliseReference(
        [line.reference, line.description, line.counterparty].filter(Boolean).join(' ')
    );
    return haystack.includes(needle);
}

/**
 * Classify one line against the open payments.
 *
 * Returns `{ decision, paymentId, note }` where decision is one of:
 *   auto     — reference unique and amount exact; safe to settle
 *   review   — a candidate exists but something disagrees; needs a human
 *   none     — nothing plausible; an unattributed credit
 */
function classifyLine(line, openPayments) {
    // Debits are money leaving our account. Investor payments are credits, so a
    // debit is never an incoming investment.
    if (line.amountMinor <= 0n) {
        return { decision: 'none', paymentId: null, note: 'Debit — not an incoming payment' };
    }

    const candidates = openPayments.filter((p) => referenceMatches(line, p.providerRef));

    if (candidates.length === 0) {
        return { decision: 'none', paymentId: null, note: 'No payment reference found in this line' };
    }

    // Two open payments quoting the same reference should be impossible, but if
    // it happens a human must decide — never guess between them.
    if (candidates.length > 1) {
        return {
            decision: 'review',
            paymentId: null,
            note: `Reference matches ${candidates.length} open payments — resolve manually`,
        };
    }

    const payment = candidates[0];

    if (payment.currency !== line.currency) {
        return {
            decision: 'review',
            paymentId: payment.id,
            note: `Currency mismatch: statement ${line.currency} vs payment ${payment.currency}`,
        };
    }

    const expected = payment.amountMinor - payment.settledAmountMinor;

    if (line.amountMinor === expected) {
        return { decision: 'auto', paymentId: payment.id, note: 'Reference and amount matched exactly' };
    }

    if (line.amountMinor < expected) {
        return {
            decision: 'review',
            paymentId: payment.id,
            note: `Short payment: received ${line.amountMinor} of ${expected} minor units`,
        };
    }

    return {
        decision: 'review',
        paymentId: payment.id,
        note: `Overpayment: received ${line.amountMinor}, expected ${expected} minor units`,
    };
}

/** Open payments that a statement line could plausibly settle. */
async function loadOpenPayments(tx) {
    const client = tx || prisma;
    return client.payment.findMany({
        where: { status: { in: OPEN_STATUSES }, providerRef: { not: null } },
        select: {
            id: true,
            providerRef: true,
            amountMinor: true,
            settledAmountMinor: true,
            currency: true,
            status: true,
            provider: true,
        },
    });
}

/**
 * Run the matcher across a statement's unmatched lines.
 *
 * Does not settle anything — it records the decision. Settlement is a separate,
 * explicit step so an operator can see what the matcher intends before money
 * moves, and so a bad rule change cannot silently credit a run of accounts.
 */
async function matchStatement(statementId) {
    const lines = await prisma.statementLine.findMany({
        where: { statementId, status: 'unmatched' },
    });
    const openPayments = await loadOpenPayments();

    const result = { auto: [], review: [], none: [] };

    for (const line of lines) {
        const { decision, paymentId, note } = classifyLine(line, openPayments);
        result[decision].push({ lineId: line.id, paymentId, note });

        await prisma.statementLine.update({
            where: { id: line.id },
            data: {
                matchedPaymentId: decision === 'none' ? null : paymentId,
                matchNote: note,
            },
        });

        // Remove a payment from the candidate pool once something claims it, so
        // two lines cannot both auto-match the same payment in one run.
        if (decision === 'auto') {
            const index = openPayments.findIndex((p) => p.id === paymentId);
            if (index !== -1) openPayments.splice(index, 1);
        }
    }

    return result;
}

/** Counts for the admin break queue. */
async function reconciliationSummary() {
    const [unmatched, matched, ignored, credits] = await Promise.all([
        prisma.statementLine.count({ where: { status: 'unmatched' } }),
        prisma.statementLine.count({ where: { status: 'matched' } }),
        prisma.statementLine.count({ where: { status: 'ignored' } }),
        prisma.statementLine.aggregate({
            where: { status: 'unmatched', amountMinor: { gt: 0 } },
            _sum: { amountMinor: true },
            _count: true,
        }),
    ]);

    return {
        unmatched,
        matched,
        ignored,
        // Money that arrived and has not been attributed to anyone. This is the
        // number an operator should care about most.
        unattributedCredits: credits._count,
        unattributedAmountMinor: credits._sum.amountMinor ?? 0n,
    };
}

module.exports = {
    classifyLine,
    referenceMatches,
    matchStatement,
    loadOpenPayments,
    reconciliationSummary,
    OPEN_STATUSES,
};

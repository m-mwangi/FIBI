const { prisma } = require('../config/db');
const { recordAudit, changedFields } = require('../utils/audit');
const { normaliseCurrency } = require('../utils/money');

/**
 * Bank account administration.
 *
 * These rows are what wire instructions quote, so a mistake here sends investor
 * money to the wrong account. Validation is therefore strict and every change
 * is audited.
 */

const INSTITUTIONS = new Set([
    'SBM',
    'ABSA',
    'STANCHART',
    'MORGAN_STANLEY',
    'BANK_OF_SINGAPORE',
    'OTHER',
]);

const PURPOSES = new Set(['COLLECTION', 'CUSTODY']);

// Morgan Stanley (a brokerage) and Bank of Singapore (a private bank) do not
// sell merchant acceptance — see PAYMENTS.md §2. Letting an operator mark one
// as a COLLECTION account would put an account on wire instructions that cannot
// actually receive investor payments that way.
const CUSTODY_ONLY = new Set(['MORGAN_STANLEY', 'BANK_OF_SINGAPORE']);

function validate(body, { partial = false } = {}) {
    const data = {};
    const required = (name, value) => {
        if (value === undefined || value === null || String(value).trim() === '') {
            if (partial) return undefined;
            throw new Error(`FIELD_REQUIRED:${name}`);
        }
        return String(value).trim();
    };

    const label = required('label', body.label);
    if (label !== undefined) data.label = label;

    if (body.institution !== undefined || !partial) {
        const institution = String(body.institution || '').trim().toUpperCase();
        if (!INSTITUTIONS.has(institution)) {
            throw new Error(`INVALID_INSTITUTION:${[...INSTITUTIONS].join(', ')}`);
        }
        data.institution = institution;
    }

    if (body.purpose !== undefined || !partial) {
        const purpose = String(body.purpose || 'COLLECTION').trim().toUpperCase();
        if (!PURPOSES.has(purpose)) {
            throw new Error(`INVALID_PURPOSE:${[...PURPOSES].join(', ')}`);
        }
        data.purpose = purpose;
    }

    const institution = data.institution;
    const purpose = data.purpose;
    if (institution && purpose === 'COLLECTION' && CUSTODY_ONLY.has(institution)) {
        throw new Error(`CUSTODY_ONLY:${institution}`);
    }

    const bankName = required('bankName', body.bankName);
    if (bankName !== undefined) data.bankName = bankName;

    const accountName = required('accountName', body.accountName);
    if (accountName !== undefined) data.accountName = accountName;

    const accountNumber = required('accountNumber', body.accountNumber);
    if (accountNumber !== undefined) data.accountNumber = accountNumber;

    if (body.currency !== undefined || !partial) {
        // Throws on a malformed code rather than storing something that can
        // never match an investor's currency.
        data.currency = normaliseCurrency(body.currency);
    }

    if (body.swiftCode !== undefined) {
        const swift = String(body.swiftCode || '').trim().toUpperCase();
        data.swiftCode = swift || null;
    }
    if (body.branch !== undefined) data.branch = String(body.branch || '').trim() || null;
    if (body.instructions !== undefined) {
        data.instructions = String(body.instructions || '').trim() || null;
    }
    if (body.active !== undefined) data.active = Boolean(body.active);

    return data;
}

function handleValidationError(error, res) {
    const [code, detail] = String(error.message).split(':');
    switch (code) {
        case 'FIELD_REQUIRED':
            return res.status(400).json({ error: `${detail} is required` });
        case 'INVALID_INSTITUTION':
            return res.status(400).json({ error: `Institution must be one of: ${detail}` });
        case 'INVALID_PURPOSE':
            return res.status(400).json({ error: `Purpose must be one of: ${detail}` });
        case 'CUSTODY_ONLY':
            return res.status(400).json({
                error:
                    `${detail} is a custody institution and cannot be a collection account. ` +
                    `It holds funds but does not accept investor payments.`,
            });
        default:
            return null;
    }
}

/** Postgres unique-violation on the one-active-collection-per-currency index. */
function handleDuplicateCollection(error, res, currency) {
    if (error.code === 'P2002') {
        return res.status(409).json({
            error:
                `There is already an active collection account for ${currency || 'this currency'}. ` +
                `Deactivate it first — wire instructions must never be ambiguous about where to send money.`,
        });
    }
    return null;
}

const listBankAccounts = async (req, res, next) => {
    try {
        const accounts = await prisma.bankAccount.findMany({
            orderBy: [{ purpose: 'asc' }, { currency: 'asc' }, { createdAt: 'asc' }],
        });
        res.status(200).json({ success: true, count: accounts.length, accounts });
    } catch (error) {
        next(error);
    }
};

const createBankAccount = async (req, res, next) => {
    let data;
    try {
        data = validate(req.body || {});
    } catch (error) {
        const handled = handleValidationError(error, res);
        if (handled) return handled;
        return res.status(400).json({ error: error.message });
    }

    try {
        const account = await prisma.bankAccount.create({ data });

        recordAudit(req, {
            action: 'bank_account.create',
            targetType: 'bank_account',
            targetId: account.id,
            targetLabel: account.label,
            metadata: {
                institution: account.institution,
                purpose: account.purpose,
                currency: account.currency,
            },
        });

        res.status(201).json({ success: true, account });
    } catch (error) {
        const handled = handleDuplicateCollection(error, res, data.currency);
        if (handled) return handled;
        next(error);
    }
};

const updateBankAccount = async (req, res, next) => {
    let data;
    try {
        data = validate(req.body || {}, { partial: true });
    } catch (error) {
        const handled = handleValidationError(error, res);
        if (handled) return handled;
        return res.status(400).json({ error: error.message });
    }

    try {
        const before = await prisma.bankAccount.findUnique({ where: { id: req.params.id } });
        if (!before) return res.status(404).json({ error: 'Bank account not found' });

        // A partial update can still create an invalid combination — flipping an
        // existing custody account to COLLECTION, for instance.
        const institution = data.institution || before.institution;
        const purpose = data.purpose || before.purpose;
        if (purpose === 'COLLECTION' && CUSTODY_ONLY.has(institution)) {
            return handleValidationError(new Error(`CUSTODY_ONLY:${institution}`), res);
        }

        const account = await prisma.bankAccount.update({ where: { id: req.params.id }, data });

        const changes = changedFields(before, account);
        if (changes) {
            recordAudit(req, {
                action: 'bank_account.update',
                targetType: 'bank_account',
                targetId: account.id,
                targetLabel: account.label,
                metadata: { changes },
            });
        }

        res.status(200).json({ success: true, account });
    } catch (error) {
        const handled = handleDuplicateCollection(error, res, data.currency);
        if (handled) return handled;
        next(error);
    }
};

const deleteBankAccount = async (req, res, next) => {
    try {
        const target = await prisma.bankAccount.findUnique({ where: { id: req.params.id } });
        if (!target) return res.status(404).json({ error: 'Bank account not found' });

        await prisma.bankAccount.delete({ where: { id: req.params.id } });

        recordAudit(req, {
            action: 'bank_account.delete',
            targetType: 'bank_account',
            targetId: target.id,
            targetLabel: target.label,
            metadata: {
                institution: target.institution,
                purpose: target.purpose,
                currency: target.currency,
            },
        });

        res.status(200).json({ success: true, message: 'Bank account deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    INSTITUTIONS,
    PURPOSES,
    CUSTODY_ONLY,
};

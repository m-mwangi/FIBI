const { prisma } = require('../config/db');

/**
 * The double-entry ledger.
 *
 * This is the source of truth for money. `Project.currentFundingMinor` and the
 * `Transaction` rows are projections of it — convenient to read, but the ledger
 * is what they must agree with.
 *
 * Two rules, enforced here rather than by convention:
 *
 *  1. Every entry balances. Postings within a journal entry sum to zero per
 *     currency, so money is always moved between accounts and never created or
 *     destroyed by a typo.
 *  2. Nothing is ever updated or deleted. A correction is a reversing entry.
 *     The database enforces this too (see the `ledger_posting_no_update`
 *     trigger), so this module is the polite guard and the trigger is the hard
 *     one.
 *
 * Amounts are BigInt integer minor units throughout — see utils/money.js.
 */

/** Debits are positive, credits negative. Naming them keeps call sites readable. */
const debit = (accountId, amount, currency) => ({ accountId, amount: BigInt(amount), currency });
const credit = (accountId, amount, currency) => ({ accountId, amount: -BigInt(amount), currency });

/**
 * Find or create the account for a (type, owner, currency) triple.
 *
 * The schema has a unique constraint on that triple, so a race between two
 * concurrent payments for the same project cannot produce two escrow accounts
 * that split the balance — the loser of the race falls back to a read.
 */
async function getOrCreateAccount(tx, { type, currency, ownerId = null, externalRef = null }) {
    const client = tx || prisma;
    const where = { type_ownerId_currency: { type, ownerId, currency } };

    const existing = await client.ledgerAccount.findUnique({ where });
    if (existing) return existing;

    try {
        return await client.ledgerAccount.create({
            data: { type, currency, ownerId, externalRef },
        });
    } catch (error) {
        // P2002 = unique violation: another transaction created it first.
        if (error.code === 'P2002') {
            return client.ledgerAccount.findUnique({ where });
        }
        throw error;
    }
}

/**
 * Assert that postings balance, per currency.
 *
 * Grouped by currency rather than summed globally: a KES leg and a USD leg that
 * happen to cancel numerically do not balance in any meaningful sense, and
 * treating them as if they did would let an FX error vanish silently.
 */
function assertBalanced(postings) {
    if (!Array.isArray(postings) || postings.length < 2) {
        throw new Error('A journal entry needs at least two postings');
    }

    const totals = new Map();
    for (const posting of postings) {
        if (!posting.accountId) throw new Error('Posting is missing an accountId');
        if (typeof posting.currency !== 'string' || !posting.currency) {
            throw new Error('Posting is missing a currency');
        }
        const amount = BigInt(posting.amount);
        if (amount === 0n) throw new Error('Posting amount cannot be zero');
        totals.set(posting.currency, (totals.get(posting.currency) ?? 0n) + amount);
    }

    for (const [currency, total] of totals) {
        if (total !== 0n) {
            throw new Error(
                `Journal entry does not balance in ${currency}: net ${total} minor units. ` +
                    `Every entry must sum to zero per currency.`
            );
        }
    }
}

/**
 * Write one balanced journal entry.
 *
 * `idempotencyKey` is the natural key of the source event — a Stripe event id, a
 * statement line hash. It is unique in the schema, so replaying a webhook is a
 * no-op rather than a double credit. A duplicate returns the existing entry
 * instead of throwing, because the caller's intent ("make sure this is
 * recorded") is already satisfied.
 *
 * Runs inside the caller's transaction when given one, so the ledger write and
 * the state change it describes commit or roll back together.
 */
async function postEntry(tx, { idempotencyKey, description, occurredAt, paymentId, postings }) {
    const client = tx || prisma;
    assertBalanced(postings);

    const existing = await client.journalEntry.findUnique({
        where: { idempotencyKey },
        include: { postings: true },
    });
    if (existing) return { entry: existing, created: false };

    try {
        const entry = await client.journalEntry.create({
            data: {
                idempotencyKey,
                description,
                occurredAt: occurredAt || new Date(),
                paymentId: paymentId || null,
                postings: {
                    create: postings.map((p) => ({
                        accountId: p.accountId,
                        amount: BigInt(p.amount),
                        currency: p.currency,
                    })),
                },
            },
            include: { postings: true },
        });
        return { entry, created: true };
    } catch (error) {
        if (error.code === 'P2002') {
            // Lost a race against a concurrent replay of the same event.
            const winner = await client.journalEntry.findUnique({
                where: { idempotencyKey },
                include: { postings: true },
            });
            if (winner) return { entry: winner, created: false };
        }
        throw error;
    }
}

/**
 * Record a settled investment: money leaves the investor's wallet and lands in
 * the project's escrow account.
 *
 * Escrow rather than a platform account because investor funds are client
 * money — segregating them here is what makes the ledger match the trust
 * account it is supposed to mirror.
 */
async function recordInvestmentSettled(tx, { idempotencyKey, userId, projectId, amountMinor, currency, paymentId, occurredAt }) {
    const wallet = await getOrCreateAccount(tx, {
        type: 'INVESTOR_WALLET',
        currency,
        ownerId: userId,
    });
    const escrow = await getOrCreateAccount(tx, {
        type: 'PROJECT_ESCROW',
        currency,
        ownerId: projectId,
    });

    return postEntry(tx, {
        idempotencyKey,
        description: 'Investment settled',
        occurredAt,
        paymentId,
        postings: [
            credit(wallet.id, amountMinor, currency),
            debit(escrow.id, amountMinor, currency),
        ],
    });
}

/** Current balance of an account, derived from its postings. */
async function balanceOf(accountId) {
    const result = await prisma.ledgerPosting.aggregate({
        where: { accountId },
        _sum: { amount: true },
    });
    return result._sum.amount ?? 0n;
}

/**
 * Whole-ledger integrity check: every entry must still balance.
 *
 * Cheap enough to run in a test or an admin health check, and the one assertion
 * that proves nothing has corrupted the books.
 */
async function findUnbalancedEntries() {
    const entries = await prisma.journalEntry.findMany({ include: { postings: true } });
    return entries
        .map((entry) => {
            const totals = new Map();
            for (const p of entry.postings) {
                totals.set(p.currency, (totals.get(p.currency) ?? 0n) + p.amount);
            }
            const offending = [...totals.entries()].filter(([, total]) => total !== 0n);
            return offending.length > 0 ? { id: entry.id, offending } : null;
        })
        .filter(Boolean);
}

module.exports = {
    debit,
    credit,
    assertBalanced,
    getOrCreateAccount,
    postEntry,
    recordInvestmentSettled,
    balanceOf,
    findUnbalancedEntries,
};

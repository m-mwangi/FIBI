const crypto = require('crypto');
const { prisma } = require('../config/db');
const { UnsupportedOperation } = require('./adapter');

/**
 * Bank transfer with manual reconciliation.
 *
 * This is the adapter that makes SBM, ABSA and Standard Chartered usable on day
 * one, with no API access and no bank onboarding: we show the investor where to
 * send money and a reference to quote, and the payment sits in `awaiting_funds`
 * until a bank statement is reconciled against it (Phase 3).
 *
 * It is also the fallback when an API-backed rail is down. A wire always works.
 */

/**
 * Human-transcribable payment reference.
 *
 * The investor types this into their banking app, so it avoids characters that
 * are misread or mistyped: no 0/O, no 1/I/L. Case-insensitive on the way back
 * in. Random rather than sequential — a sequential reference would leak the
 * platform's payment volume to anyone who made two payments.
 */
const REFERENCE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function generateReference(length = 8) {
    const bytes = crypto.randomBytes(length);
    let out = '';
    for (let i = 0; i < length; i++) {
        out += REFERENCE_ALPHABET[bytes[i] % REFERENCE_ALPHABET.length];
    }
    return `FIBI-${out}`;
}

/** Normalise a reference seen on a bank statement for comparison. */
function normaliseReference(raw) {
    return String(raw || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
}

/**
 * The active collection account for a currency.
 *
 * Currency-matched on purpose: quoting a USD account to an investor paying KES
 * invites a conversion nobody agreed on, at a rate nobody chose.
 */
async function findCollectionAccount(currency) {
    return prisma.bankAccount.findFirst({
        where: { currency: currency.toUpperCase(), purpose: 'COLLECTION', active: true },
    });
}

const manualWireAdapter = {
    provider: 'MANUAL_WIRE',

    isConfigured() {
        // Usable as soon as an operator has added one collection account.
        return true;
    },

    /**
     * Issue wire instructions.
     *
     * Returns `awaiting_funds`, not `pending`: nothing is in flight with a
     * provider, we are simply waiting for a human to move money. The
     * distinction matters to the admin console, which should show these
     * separately from a card payment stuck mid-authorisation.
     */
    async initiate({ payment }) {
        const account = await findCollectionAccount(payment.currency);
        if (!account) {
            throw new Error(
                `No active collection account configured for ${payment.currency}. ` +
                    `Add one in the admin console before enabling bank transfers.`
            );
        }

        const reference = generateReference();

        return {
            providerRef: reference,
            status: 'awaiting_funds',
            providerMeta: {
                reference,
                bankAccountId: account.id,
                institution: account.institution,
                issuedAt: new Date().toISOString(),
            },
            nextAction: {
                type: 'bank_transfer',
                reference,
                account: {
                    bankName: account.bankName,
                    accountName: account.accountName,
                    accountNumber: account.accountNumber,
                    swiftCode: account.swiftCode,
                    branch: account.branch,
                    currency: account.currency,
                },
                instructions:
                    account.instructions ||
                    `Quote reference ${reference} exactly. Funds are credited once the transfer ` +
                        `appears on our bank statement, usually within 1-3 business days.`,
            },
        };
    },

    /**
     * There is nothing to poll — no provider holds this payment's state.
     *
     * It advances only when a statement line is matched to it, so the honest
     * answer is whatever we already recorded.
     */
    async status(providerRef) {
        const payment = await prisma.payment.findFirst({
            where: { provider: 'MANUAL_WIRE', providerRef },
            select: { status: true, settledAmountMinor: true },
        });
        if (!payment) return { status: 'pending', settledAmountMinor: 0, raw: null };
        return {
            status: payment.status,
            settledAmountMinor: Number(payment.settledAmountMinor),
            raw: { note: 'Manual wire state advances via statement reconciliation only.' },
        };
    },

    /** No bank calls us back. Reconciliation drives this rail. */
    async handleCallback() {
        return null;
    },

    async refund() {
        // A wire is refunded by sending money back, which is an outbound payment
        // needing maker/checker approval and sanctions screening (Phase 6).
        throw new UnsupportedOperation('MANUAL_WIRE', 'refund');
    },
};

module.exports = {
    manualWireAdapter,
    generateReference,
    normaliseReference,
    findCollectionAccount,
    REFERENCE_ALPHABET,
};

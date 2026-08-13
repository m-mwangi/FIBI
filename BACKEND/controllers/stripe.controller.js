const { prisma } = require('../config/db');
const { getAdapter } = require('../payments');
const { recordInvestmentSettled } = require('../services/ledger.service');

/**
 * Payment callbacks.
 *
 * The route is Stripe-specific because Stripe needs a raw body for signature
 * verification, but everything below `adapter.handleCallback` is provider
 * neutral: `settlePayment` is what any future rail's callback — or Phase 3's
 * reconciliation engine — calls once money is confirmed.
 */

async function upsertPaymentResponse({ tx, paymentId, provider, providerEventId, eventType, eventData }) {
    // providerEventId is the provider's own event id, and is unique in the
    // schema — this is what makes a redelivered webhook a no-op.
    await tx.paymentResponse.upsert({
        where: { providerEventId },
        create: { paymentId, provider, providerEventId, response: eventData, status: eventType },
        update: { response: eventData, status: eventType },
    });
}

async function ensurePaymentMethod({ tx, userId, provider, methodType }) {
    const existing = await tx.paymentMethod.findFirst({ where: { userId, provider, methodType } });
    if (existing) return existing;

    return tx.paymentMethod.create({
        data: { userId, provider, methodType, label: methodType === 'card' ? 'Card' : methodType, details: { methodType } },
    });
}

/**
 * Apply a confirmed payment outcome.
 *
 * Provider-agnostic on purpose: a bank statement match in Phase 3 settles a
 * wire through exactly this path, so the money maths lives in one place rather
 * than once per rail.
 *
 * Everything runs in one transaction, and the ledger entry is part of it — the
 * books and the projections they describe commit together or not at all.
 */
async function settlePayment(event) {
    const { paymentId, providerRef, status, eventId, eventType, methodType, raw } = event;

    await prisma.$transaction(async (tx) => {
        const payment = paymentId
            ? await tx.payment.findUnique({ where: { id: paymentId } })
            : await tx.payment.findFirst({ where: { providerRef } });

        if (!payment) return;

        // Idempotency, second line of defence: an already-resolved payment is
        // never reprocessed even if the same event arrives twice.
        const OPEN = new Set(['pending', 'awaiting_funds', 'partially_settled']);
        if (!OPEN.has(payment.status)) return;

        await upsertPaymentResponse({
            tx,
            paymentId: payment.id,
            provider: payment.provider,
            providerEventId: eventId,
            eventType,
            eventData: raw,
        });

        const settledMinor =
            event.settledAmountMinor === null || event.settledAmountMinor === undefined
                ? payment.amountMinor
                : BigInt(event.settledAmountMinor);

        await tx.payment.updateMany({
            where: { id: payment.id, status: { in: [...OPEN] } },
            data: {
                status,
                providerRef: providerRef || payment.providerRef,
                settledAmountMinor: status === 'succeeded' ? settledMinor : payment.settledAmountMinor,
            },
        });

        if (status !== 'succeeded') return;

        const investmentId = payment.investmentId;
        if (!investmentId) return;

        const updated = await tx.investment.updateMany({
            where: { id: investmentId, status: 'pending' },
            data: { status: 'active', currentValueMinor: payment.amountMinor },
        });
        // Another delivery of the same event won the race; it did the work.
        if (updated.count !== 1) return;

        const investment = await tx.investment.findUnique({ where: { id: investmentId } });
        if (!investment) return;

        const project = await tx.project.findUnique({ where: { id: investment.projectId } });
        if (!project) return;

        // BigInt arithmetic — the funding total cannot drift from the sum of
        // its investments.
        const nextFunding = project.currentFundingMinor + investment.amountInvestedMinor;
        const nextStatus = nextFunding >= project.totalFundingMinor ? 'funded' : project.status;

        const alreadyInvested = await tx.investment.findFirst({
            where: {
                userId: investment.userId,
                projectId: investment.projectId,
                status: { in: ['active', 'completed'] },
                id: { not: investment.id },
            },
            select: { id: true },
        });

        if (methodType) {
            const pm = await ensurePaymentMethod({
                tx,
                userId: investment.userId,
                provider: payment.provider,
                methodType,
            });
            await tx.payment.update({ where: { id: payment.id }, data: { paymentMethodId: pm.id } });
        }

        await tx.project.update({
            where: { id: investment.projectId },
            data: {
                currentFundingMinor: { increment: investment.amountInvestedMinor },
                investorsCount: alreadyInvested ? project.investorsCount : { increment: 1 },
                status: nextStatus,
            },
        });

        await tx.transaction.create({
            data: {
                userId: investment.userId,
                amountMinor: investment.amountInvestedMinor,
                currency: investment.currency,
                type: 'INVESTMENT',
                status: 'completed',
                paymentId: payment.id,
            },
        });

        // The books. Keyed on the provider event id, so a replay cannot double
        // post even if every guard above were removed.
        await recordInvestmentSettled(tx, {
            idempotencyKey: `investment-settled:${eventId}`,
            userId: investment.userId,
            projectId: investment.projectId,
            amountMinor: investment.amountInvestedMinor,
            currency: investment.currency,
            paymentId: payment.id,
            occurredAt: new Date(),
        });
    });
}

/**
 * Stripe webhook.
 *
 * `index.js` mounts this with `express.raw()` — the signature is computed over
 * the raw bytes, so parsing the body first would invalidate it.
 */
const stripeWebhook = async (req, res) => {
    try {
        const adapter = getAdapter('STRIPE');
        const event = await adapter.handleCallback(req);

        // A valid but uninteresting event type. Acknowledge it, or Stripe
        // retries forever.
        if (!event) return res.status(200).json({ received: true, ignored: true });

        if (!event.paymentId && !event.providerRef) {
            return res.status(400).json({ error: 'Callback has no payment reference.' });
        }

        await settlePayment(event);
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error?.message || error);
        res.status(400).json({ error: 'Invalid Stripe webhook payload' });
    }
};

module.exports = {
    stripeWebhook,
    settlePayment,
};

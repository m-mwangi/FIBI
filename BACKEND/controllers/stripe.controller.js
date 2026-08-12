const { prisma } = require('../config/db');
const config = require('../config/env');
const Stripe = require('stripe');

// Create Stripe client once (small app / dev).
const stripe = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }) : null;

function getStripeOrThrow() {
    if (!stripe) {
        const err = new Error('Stripe is not configured (missing STRIPE_SECRET_KEY).');
        err.statusCode = 500;
        throw err;
    }
    return stripe;
}

async function upsertPaymentResponse({ tx, paymentId, providerEventId, eventType, eventData }) {
    // providerEventId is always an idempotency key from Stripe webhook.
    await tx.paymentResponse.upsert({
        where: { providerEventId },
        create: {
            paymentId,
            provider: 'STRIPE',
            providerEventId,
            response: eventData,
            status: eventType,
        },
        update: {
            response: eventData,
            status: eventType,
        },
    });
}

async function ensurePaymentMethod({ tx, userId, methodType }) {
    const existing = await tx.paymentMethod.findFirst({
        where: { userId, provider: 'STRIPE', methodType },
    });
    if (existing) return existing;

    return tx.paymentMethod.create({
        data: {
            userId,
            provider: 'STRIPE',
            methodType,
            label: 'Card',
            details: { methodType },
        },
    });
}

/**
 * Create Stripe checkout session for an investment.
 * @returns {Promise<{ url: string, id: string }>}
 */
const createInvestmentCheckoutSession = async ({
    userId,
    projectId,
    investmentId,
    paymentId,
    amount,
    currency,
    projectTitle,
}) => {
    const s = getStripeOrThrow();

    const unitAmount = Math.round(amount * 100); // USD-like: 2 decimal places expected
    const frontendBase = (config.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

    const session = await s.checkout.sessions.create({
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency,
                    unit_amount: unitAmount,
                    product_data: {
                        name: `Investment in ${projectTitle}`,
                    },
                },
                quantity: 1,
            },
        ],
        success_url: `${frontendBase}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendBase}/dashboard?payment=cancel`,
        metadata: {
            investmentId,
            projectId,
            userId,
            paymentId,
        },
    });

    return { url: session.url, id: session.id };
};

/**
 * Stripe webhook handler for investment payments.
 * Note: `index.js` registers this route with `express.raw()` so `req.body` is a Buffer.
 */
const stripeWebhook = async (req, res) => {
    try {
        const s = getStripeOrThrow();
        if (!config.STRIPE_WEBHOOK_SECRET) {
            return res.status(500).json({ error: 'Stripe webhook secret is missing (STRIPE_WEBHOOK_SECRET).' });
        }

        const signatureHeader = req.headers['stripe-signature'];
        const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
        if (!signature) {
            return res.status(400).json({ error: 'Missing stripe-signature header.' });
        }

        const event = s.webhooks.constructEvent(req.body, signature, config.STRIPE_WEBHOOK_SECRET);

        const allowedTypes = new Set([
            'checkout.session.completed',
            'checkout.session.async_payment_failed',
            'checkout.session.expired',
        ]);

        if (!allowedTypes.has(event.type)) {
            return res.status(200).json({ received: true, type: event.type });
        }

        const session = event.data.object;
        const paymentId = session?.metadata?.paymentId;
        const investmentIdFromMeta = session?.metadata?.investmentId;

        if (!paymentId) {
            return res.status(400).json({ error: 'Missing paymentId in Stripe session metadata.' });
        }

        await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
            });
            if (!payment) return;

            // Idempotency: only process if still pending.
            if (payment.status !== 'pending') return;

            const providerEventId = event.id;
            await upsertPaymentResponse({
                tx,
                paymentId,
                providerEventId,
                eventType: event.type,
                eventData: event.data,
            });

            const sessionPaymentStatus = session?.payment_status;
            const methodType = Array.isArray(session?.payment_method_types) && session.payment_method_types.length > 0
                ? session.payment_method_types[0]
                : 'card';

            const nextPaymentStatus =
                event.type === 'checkout.session.completed' && sessionPaymentStatus === 'paid'
                    ? 'succeeded'
                    : 'failed';

            // Update payment first; finalization below only happens on success.
            await tx.payment.updateMany({
                where: { id: paymentId, status: 'pending' },
                data: {
                    status: nextPaymentStatus,
                    stripeCheckoutSessionId: session.id,
                },
            });

            if (nextPaymentStatus !== 'succeeded') return;

            const investmentId = payment.investmentId || investmentIdFromMeta;
            if (!investmentId) return;

            const updatedInvestmentCount = await tx.investment.updateMany({
                where: { id: investmentId, status: 'pending' },
                data: {
                    status: 'active',
                    currentValue: payment.amount,
                },
            });

            if (updatedInvestmentCount.count !== 1) return;

            const pendingInvestment = await tx.investment.findUnique({ where: { id: investmentId } });
            if (!pendingInvestment) return;

            const projectRecord = await tx.project.findUnique({ where: { id: pendingInvestment.projectId } });
            if (!projectRecord) return;

            const nextFunding = projectRecord.currentFunding + pendingInvestment.amountInvested;
            const nextStatus = nextFunding >= projectRecord.totalFunding ? 'funded' : projectRecord.status;

            const existingFinalizedInvestor = await tx.investment.findFirst({
                where: {
                    userId: pendingInvestment.userId,
                    projectId: pendingInvestment.projectId,
                    status: { in: ['active', 'completed'] },
                    // Exclude the investment we are currently finalizing.
                    id: { not: pendingInvestment.id },
                },
                select: { id: true },
            });

            const pm = await ensurePaymentMethod({ tx, userId: pendingInvestment.userId, methodType });
            await tx.payment.update({
                where: { id: paymentId },
                data: { paymentMethodId: pm.id },
            });

            await tx.project.update({
                where: { id: pendingInvestment.projectId },
                data: {
                    currentFunding: { increment: pendingInvestment.amountInvested },
                    investorsCount: existingFinalizedInvestor ? projectRecord.investorsCount : { increment: 1 },
                    status: nextStatus,
                },
            });

            await tx.transaction.create({
                data: {
                    userId: pendingInvestment.userId,
                    amount: pendingInvestment.amountInvested,
                    type: 'INVESTMENT',
                    status: 'completed',
                    paymentId: paymentId,
                },
            });
        });

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error?.message || error);
        res.status(400).json({ error: 'Invalid Stripe webhook payload' });
    }
};

module.exports = {
    createInvestmentCheckoutSession,
    stripeWebhook,
};


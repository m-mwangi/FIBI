const Stripe = require('stripe');
const config = require('../config/env');
const { UnsupportedOperation } = require('./adapter');
const { money, toMinorNumber } = require('../utils/money');

/**
 * Stripe Checkout, behind the shared adapter interface.
 *
 * Cards stay on Stripe deliberately: a hosted redirect means card numbers never
 * touch our servers, which keeps the platform out of PCI-DSS scope. See
 * PAYMENTS.md §7.
 */

let client = null;
function getStripeOrThrow() {
    if (!config.STRIPE_SECRET_KEY) {
        throw new Error('Stripe is not configured (STRIPE_SECRET_KEY is missing).');
    }
    if (!client) client = new Stripe(config.STRIPE_SECRET_KEY);
    return client;
}

/** Map Stripe's vocabulary onto ours. */
function mapStatus(eventType, session) {
    if (eventType === 'checkout.session.completed') {
        return session?.payment_status === 'paid' ? 'succeeded' : 'failed';
    }
    if (eventType === 'checkout.session.async_payment_succeeded') return 'succeeded';
    return 'failed';
}

const stripeAdapter = {
    provider: 'STRIPE',

    isConfigured() {
        return Boolean(config.STRIPE_SECRET_KEY);
    },

    /**
     * Create a Checkout session.
     *
     * `unit_amount` is a straight pass-through: Stripe works in minor units and
     * so do we now, so nothing is multiplied or divided on the way out.
     */
    async initiate({ payment, projectTitle }) {
        const s = getStripeOrThrow();
        const frontendBase = (config.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

        const session = await s.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: payment.currency.toLowerCase(),
                        unit_amount: toMinorNumber(money(payment.amountMinor, payment.currency)),
                        product_data: { name: `Investment in ${projectTitle}` },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${frontendBase}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendBase}/dashboard?payment=cancel`,
            metadata: {
                paymentId: payment.id,
                investmentId: payment.investmentId || '',
                projectId: payment.projectId || '',
                userId: payment.userId,
            },
        });

        return {
            providerRef: session.id,
            status: 'pending',
            providerMeta: { stripeCheckoutSessionId: session.id },
            nextAction: { type: 'redirect', url: session.url },
        };
    },

    async status(providerRef) {
        const s = getStripeOrThrow();
        const session = await s.checkout.sessions.retrieve(providerRef);
        return {
            status: session.payment_status === 'paid' ? 'succeeded' : 'pending',
            settledAmountMinor: session.amount_total ?? 0,
            raw: session,
        };
    },

    /**
     * Verify and normalise a webhook.
     *
     * The signature check is the security boundary — without it anyone who
     * learns the endpoint can mark payments as settled. `req.body` is a raw
     * Buffer here because index.js mounts this route with `express.raw()`;
     * parsing it first would break the signature.
     */
    async handleCallback(req) {
        const s = getStripeOrThrow();
        if (!config.STRIPE_WEBHOOK_SECRET) {
            throw new Error('Stripe webhook secret is missing (STRIPE_WEBHOOK_SECRET).');
        }

        const header = req.headers['stripe-signature'];
        const signature = Array.isArray(header) ? header[0] : header;
        if (!signature) throw new Error('Missing stripe-signature header.');

        const event = s.webhooks.constructEvent(req.body, signature, config.STRIPE_WEBHOOK_SECRET);

        const handled = new Set([
            'checkout.session.completed',
            'checkout.session.async_payment_succeeded',
            'checkout.session.async_payment_failed',
            'checkout.session.expired',
        ]);
        // Not an error — Stripe sends many event types and we subscribe broadly.
        if (!handled.has(event.type)) return null;

        const session = event.data.object;
        return {
            eventId: event.id,
            eventType: event.type,
            paymentId: session?.metadata?.paymentId || null,
            providerRef: session?.id || null,
            status: mapStatus(event.type, session),
            settledAmountMinor: session?.amount_total ?? null,
            methodType:
                Array.isArray(session?.payment_method_types) && session.payment_method_types.length > 0
                    ? session.payment_method_types[0]
                    : 'card',
            raw: event.data,
        };
    },

    async refund() {
        // Deliberately not implemented rather than half-implemented: refunding
        // an investment has ledger and regulatory consequences (Phase 6) that a
        // bare Stripe refund call would skip.
        throw new UnsupportedOperation('STRIPE', 'refund');
    },
};

module.exports = { stripeAdapter, getStripeOrThrow };

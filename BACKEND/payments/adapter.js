/**
 * The payment adapter contract.
 *
 * Everything above this line — the investment flow, the admin console — knows
 * only this interface. It never knows which bank or processor is behind it.
 * That is the whole point: adding ABSA or M-Pesa should be a new file in this
 * directory, not a change to the investment controller.
 *
 * An adapter implements:
 *
 *   provider                        PaymentProvider enum member
 *   initiate({ payment, ... })      -> { providerRef, status, nextAction }
 *   status(providerRef)             -> { status, settledAmountMinor?, raw }
 *   handleCallback(req)             -> NormalisedEvent | null
 *   refund(payment, amountMinor)    -> { ok } | throws UnsupportedOperation
 *
 * ## `nextAction` and slow rails
 *
 * `initiate` must not assume the payment resolves in seconds. A card checkout
 * returns a redirect; a wire returns *instructions and a reference*, and then
 * nothing happens for days until a bank statement is reconciled. Both are
 * first-class:
 *
 *   { type: 'redirect',      url }
 *   { type: 'bank_transfer', reference, account, instructions }
 *   { type: 'none' }
 *
 * A rail that cannot confirm synchronously returns status `awaiting_funds`, and
 * the payment is completed later by a callback (Phase 2) or by statement
 * reconciliation (Phase 3).
 *
 * ## Normalised events
 *
 * `handleCallback` verifies the provider's signature itself — only the adapter
 * knows how — and returns the provider-neutral shape below, or null for events
 * that are valid but uninteresting:
 *
 *   {
 *     eventId,              // provider's own id; the idempotency key
 *     paymentId,            // our Payment.id, if the provider echoes it back
 *     providerRef,          // the provider's handle for the payment
 *     status,               // a PaymentStatus member
 *     settledAmountMinor,   // what actually arrived; may be < amountMinor
 *     raw,                  // full payload, stored for audit
 *   }
 */

/** Thrown by adapters for operations a rail genuinely cannot perform. */
class UnsupportedOperation extends Error {
    constructor(provider, operation) {
        super(`${provider} does not support ${operation}`);
        this.name = 'UnsupportedOperation';
        this.code = 'UNSUPPORTED_OPERATION';
    }
}

const REQUIRED_METHODS = ['initiate', 'status', 'handleCallback', 'refund'];

const registry = new Map();

/**
 * Register an adapter.
 *
 * The shape check runs at startup rather than at first payment: a typo'd method
 * name should break the boot, not the first investor who tries to pay.
 */
function register(adapter) {
    if (!adapter || typeof adapter.provider !== 'string') {
        throw new Error('A payment adapter needs a `provider` string');
    }
    for (const method of REQUIRED_METHODS) {
        if (typeof adapter[method] !== 'function') {
            throw new Error(`Payment adapter ${adapter.provider} is missing ${method}()`);
        }
    }
    registry.set(adapter.provider, adapter);
    return adapter;
}

function getAdapter(provider) {
    const adapter = registry.get(provider);
    if (!adapter) {
        throw new Error(
            `No payment adapter registered for "${provider}". ` +
                `Available: ${[...registry.keys()].join(', ') || '(none)'}`
        );
    }
    return adapter;
}

/** Providers currently wired up — used to validate a requested payment method. */
function availableProviders() {
    return [...registry.keys()];
}

/**
 * Is this provider usable right now?
 *
 * Registration means the code exists; `isConfigured` means the credentials do.
 * Stripe with no API key is registered but unusable, and the caller should get
 * a clear error rather than a 500 from deep inside the SDK.
 */
function usableProviders() {
    return [...registry.entries()]
        .filter(([, adapter]) => (adapter.isConfigured ? adapter.isConfigured() : true))
        .map(([name]) => name);
}

module.exports = {
    register,
    getAdapter,
    availableProviders,
    usableProviders,
    UnsupportedOperation,
    REQUIRED_METHODS,
};

const { register, getAdapter, availableProviders, usableProviders, UnsupportedOperation } = require('./adapter');
const { stripeAdapter } = require('./stripe.adapter');
const { manualWireAdapter } = require('./manualWire.adapter');

/**
 * Adapter registration.
 *
 * Registering at module load means a malformed adapter breaks the boot rather
 * than the first payment. Adding ABSA, SBM, Standard Chartered or M-Pesa is a
 * new file plus one line here — nothing above the adapter layer changes.
 */
register(stripeAdapter);
register(manualWireAdapter);

module.exports = {
    getAdapter,
    availableProviders,
    usableProviders,
    UnsupportedOperation,
};

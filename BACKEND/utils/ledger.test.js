const test = require('node:test');
const assert = require('node:assert/strict');

const { assertBalanced, debit, credit } = require('../services/ledger.service');
const { generateReference, normaliseReference, REFERENCE_ALPHABET } = require('../payments/manualWire.adapter');
const { register, getAdapter, UnsupportedOperation, REQUIRED_METHODS } = require('../payments/adapter');

/**
 * Pure unit tests — no database. The DB-level guarantees (append-only trigger,
 * unique idempotency key) are verified against a real Postgres separately.
 */

test('ledger entries must balance', async (t) => {
    await t.test('a matched debit and credit balances', () => {
        assert.doesNotThrow(() =>
            assertBalanced([credit('wallet', 50_000n, 'USD'), debit('escrow', 50_000n, 'USD')])
        );
    });

    await t.test('an unbalanced entry is refused', () => {
        assert.throws(
            () => assertBalanced([credit('wallet', 50_000n, 'USD'), debit('escrow', 49_999n, 'USD')]),
            /does not balance in USD: net -1/
        );
    });

    await t.test('balancing is per currency, not across currencies', () => {
        // These net to zero if you ignore currency — which is exactly the FX
        // error the per-currency rule exists to catch.
        assert.throws(
            () => assertBalanced([credit('walletKES', 50_000n, 'KES'), debit('escrowUSD', 50_000n, 'USD')]),
            /does not balance/
        );
    });

    await t.test('a multi-leg entry balances (investment split with a fee)', () => {
        assert.doesNotThrow(() =>
            assertBalanced([
                credit('wallet', 100_000n, 'USD'),
                debit('escrow', 98_000n, 'USD'),
                debit('platformFee', 2_000n, 'USD'),
            ])
        );
    });

    await t.test('a single posting is not an entry', () => {
        assert.throws(() => assertBalanced([debit('escrow', 1n, 'USD')]), /at least two postings/);
    });

    await t.test('zero-amount postings are refused', () => {
        assert.throws(
            () => assertBalanced([debit('escrow', 0n, 'USD'), credit('wallet', 0n, 'USD')]),
            /cannot be zero/
        );
    });

    await t.test('a posting without a currency is refused', () => {
        assert.throws(
            () => assertBalanced([{ accountId: 'a', amount: 1n }, { accountId: 'b', amount: -1n }]),
            /missing a currency/
        );
    });

    await t.test('debit and credit have opposite signs', () => {
        assert.equal(debit('a', 100n, 'USD').amount, 100n);
        assert.equal(credit('a', 100n, 'USD').amount, -100n);
    });
});

test('manual wire references', async (t) => {
    await t.test('avoid characters humans mistype', () => {
        // The investor retypes this into a banking app; 0/O and 1/I/L are the
        // classic transcription failures.
        for (const forbidden of ['0', 'O', '1', 'I', 'L']) {
            assert.ok(!REFERENCE_ALPHABET.includes(forbidden), `alphabet must exclude ${forbidden}`);
        }
    });

    await t.test('are prefixed and well-formed', () => {
        const ref = generateReference();
        assert.match(ref, /^FIBI-[A-Z0-9]{8}$/);
    });

    await t.test('do not collide across many draws', () => {
        const seen = new Set();
        for (let i = 0; i < 5_000; i++) seen.add(generateReference());
        assert.equal(seen.size, 5_000, 'references must be unique');
    });

    await t.test('normalise for statement matching', () => {
        // Banks mangle references: lower case, stripped punctuation, added spaces.
        assert.equal(normaliseReference('fibi-ab23cd45'), 'FIBIAB23CD45');
        assert.equal(normaliseReference('FIBI AB23CD45'), 'FIBIAB23CD45');
        assert.equal(normaliseReference('  FIBI-AB23CD45  '), 'FIBIAB23CD45');
        assert.equal(normaliseReference(null), '');
    });
});

test('adapter registry', async (t) => {
    await t.test('registered adapters are retrievable', () => {
        require('../payments'); // registers Stripe + manual wire
        assert.equal(getAdapter('STRIPE').provider, 'STRIPE');
        assert.equal(getAdapter('MANUAL_WIRE').provider, 'MANUAL_WIRE');
    });

    await t.test('an unknown provider fails loudly', () => {
        assert.throws(() => getAdapter('BANK_OF_SINGAPORE'), /No payment adapter registered/);
    });

    await t.test('an adapter missing a method is rejected at registration', () => {
        // Catching this at boot rather than at the first payment is the point.
        assert.throws(() => register({ provider: 'BROKEN' }), /missing initiate\(\)/);
        assert.throws(
            () => register({ provider: 'BROKEN', initiate() {}, status() {}, handleCallback() {} }),
            /missing refund\(\)/
        );
    });

    await t.test('the contract is the four documented methods', () => {
        assert.deepEqual(REQUIRED_METHODS, ['initiate', 'status', 'handleCallback', 'refund']);
    });

    await t.test('unsupported operations throw a typed error', async () => {
        await assert.rejects(() => getAdapter('MANUAL_WIRE').refund(), (err) => {
            assert.ok(err instanceof UnsupportedOperation);
            assert.equal(err.code, 'UNSUPPORTED_OPERATION');
            return true;
        });
    });
});

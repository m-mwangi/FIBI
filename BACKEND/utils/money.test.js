const test = require('node:test');
const assert = require('node:assert/strict');

const {
  money,
  fromMajor,
  toMajorString,
  toMinorNumber,
  add,
  subtract,
  sum,
  multiply,
  applyRate,
  compare,
  isZero,
  isNegative,
  exponentFor,
} = require('./money');

/**
 * Run with: npm test
 *
 * The cases below are chosen to be exactly the ones the old `Float` columns got
 * wrong. If this file passes, the drift that made `currentFunding` disagree
 * with the sum of its investments cannot recur.
 */

test('the float bugs this module exists to prevent', async (t) => {
  await t.test('0.1 + 0.2 is exactly 0.3', () => {
    // The canonical float failure: 0.1 + 0.2 === 0.30000000000000004
    assert.notEqual(0.1 + 0.2, 0.3);

    const result = add(fromMajor('0.10', 'USD'), fromMajor('0.20', 'USD'));
    assert.equal(result.amount, 30n);
    assert.equal(toMajorString(result), '0.30');
  });

  await t.test('ten thousand additions do not drift', () => {
    // Float: accumulating 0.01 ten thousand times lands near 100 but not on it.
    let float = 0;
    for (let i = 0; i < 10_000; i++) float += 0.01;
    assert.notEqual(float, 100);

    let exact = money(0n, 'USD');
    const cent = fromMajor('0.01', 'USD');
    for (let i = 0; i < 10_000; i++) exact = add(exact, cent);
    // 10,000 x $0.01 = $100.00 = 10,000 cents, exactly.
    assert.equal(exact.amount, 10_000n);
    assert.equal(toMajorString(exact), '100.00');
  });

  await t.test('a sum equals its parts — the currentFunding invariant', () => {
    const investments = ['1000.10', '2500.55', '99.35', '0.01', '750.99'].map((v) =>
      fromMajor(v, 'USD')
    );
    const total = sum(investments);
    // 1000.10 + 2500.55 + 99.35 + 0.01 + 750.99 = 4351.00
    assert.equal(toMajorString(total), '4351.00');
    assert.equal(total.amount, 435_100n);
  });
});

test('currency is never implicit', async (t) => {
  await t.test('mixing currencies throws rather than coercing', () => {
    const usd = fromMajor('100.00', 'USD');
    const kes = fromMajor('100.00', 'KES');
    assert.throws(() => add(usd, kes), /Currency mismatch/);
    assert.throws(() => subtract(usd, kes), /Currency mismatch/);
    assert.throws(() => compare(usd, kes), /Currency mismatch/);
  });

  await t.test('codes are normalised to upper case', () => {
    assert.equal(fromMajor('1.00', 'usd').currency, 'USD');
    assert.equal(money(100n, ' kes ').currency, 'KES');
  });

  await t.test('an invalid code is rejected', () => {
    assert.throws(() => money(1n, 'DOLLARS'), /Invalid currency/);
    assert.throws(() => money(1n, ''), /Invalid currency/);
    assert.throws(() => money(1n, null), /Invalid currency/);
  });

  await t.test('summing an empty list requires an explicit currency', () => {
    assert.throws(() => sum([]), /explicit currency/);
    assert.equal(sum([], 'KES').amount, 0n);
  });
});

test('minor units are integers', async (t) => {
  await t.test('a major-unit value passed as minor units is refused', () => {
    // This is the mistake the *Minor column rename is designed to surface.
    assert.throws(() => money(12.34, 'USD'), /integer minor units/);
  });

  await t.test('integers and numeric strings are accepted', () => {
    assert.equal(money(1234, 'USD').amount, 1234n);
    assert.equal(money('1234', 'USD').amount, 1234n);
    assert.equal(money(1234n, 'USD').amount, 1234n);
  });

  await t.test('values are frozen', () => {
    const value = money(100n, 'USD');
    assert.throws(() => {
      'use strict';
      value.amount = 999n;
    });
  });
});

test('parsing major units', async (t) => {
  await t.test('decimal strings never pass through a float', () => {
    assert.equal(fromMajor('1234.56', 'USD').amount, 123_456n);
    assert.equal(fromMajor('0.01', 'USD').amount, 1n);
    assert.equal(fromMajor('1000000.99', 'USD').amount, 100_000_099n);
  });

  await t.test('missing and short fractions are padded', () => {
    assert.equal(fromMajor('10', 'USD').amount, 1000n);
    assert.equal(fromMajor('10.5', 'USD').amount, 1050n);
    assert.equal(fromMajor('.5', 'USD').amount, 50n);
  });

  await t.test('over-long fractions are truncated, not rounded up', () => {
    // Truncating is the safe direction: it can never invent money.
    assert.equal(fromMajor('1.999', 'USD').amount, 199n);
  });

  await t.test('negatives round-trip', () => {
    const value = fromMajor('-42.50', 'USD');
    assert.equal(value.amount, -4250n);
    assert.equal(toMajorString(value), '-42.50');
    assert.ok(isNegative(value));
  });

  await t.test('thousands separators are tolerated', () => {
    assert.equal(fromMajor('1,234.56', 'USD').amount, 123_456n);
  });

  await t.test('garbage is rejected', () => {
    assert.throws(() => fromMajor('abc', 'USD'), /Cannot parse/);
    assert.throws(() => fromMajor('', 'USD'), /Cannot parse/);
    assert.throws(() => fromMajor(Infinity, 'USD'), /Cannot convert/);
  });
});

test('zero-decimal currencies', async (t) => {
  await t.test('JPY has no minor unit', () => {
    assert.equal(exponentFor('JPY'), 0);
    const value = fromMajor('1500', 'JPY');
    assert.equal(value.amount, 1500n);
    assert.equal(toMajorString(value), '1500');
  });

  await t.test('treating JPY as 2-decimal would inflate it 100x', () => {
    assert.notEqual(fromMajor('1500', 'JPY').amount, fromMajor('1500', 'USD').amount);
  });
});

test('rates and rounding', async (t) => {
  await t.test('a 2% platform fee', () => {
    const raised = fromMajor('1735000.00', 'USD');
    assert.equal(toMajorString(applyRate(raised, 2)), '34700.00');
  });

  await t.test('fractional rates round half away from zero', () => {
    // 1.5% of 10.10 = 0.1515 -> 15.15 cents -> 15 cents
    assert.equal(applyRate(fromMajor('10.10', 'USD'), 1.5).amount, 15n);
    // 2.5% of 0.10 = 0.0025 -> 0.25 cents -> rounds to 0
    assert.equal(applyRate(fromMajor('0.10', 'USD'), 2.5).amount, 0n);
    // 50% of 0.01 = 0.005 -> half a cent -> rounds away from zero to 1
    assert.equal(applyRate(fromMajor('0.01', 'USD'), 50).amount, 1n);
  });

  await t.test('negative amounts round away from zero too', () => {
    assert.equal(applyRate(fromMajor('-0.01', 'USD'), 50).amount, -1n);
  });

  await t.test('rate results stay exact integers', () => {
    const result = applyRate(fromMajor('99.99', 'USD'), 3.33);
    assert.equal(typeof result.amount, 'bigint');
  });

  await t.test('multiply refuses fractional factors', () => {
    assert.throws(() => multiply(fromMajor('1.00', 'USD'), 1.5), /integer factor/);
    assert.equal(multiply(fromMajor('1.50', 'USD'), 3).amount, 450n);
  });
});

test('JSON transport', async (t) => {
  await t.test('minor units serialise as a safe integer', () => {
    assert.equal(toMinorNumber(fromMajor('1234.56', 'USD')), 123456);
  });

  await t.test('an unsafe magnitude throws rather than silently rounding', () => {
    const huge = money(BigInt(Number.MAX_SAFE_INTEGER) + 10n, 'USD');
    assert.throws(() => toMinorNumber(huge), /safe integer range/);
  });
});

test('comparison helpers', async (t) => {
  await t.test('compare orders correctly', () => {
    const a = fromMajor('10.00', 'USD');
    const b = fromMajor('20.00', 'USD');
    assert.equal(compare(a, b), -1);
    assert.equal(compare(b, a), 1);
    assert.equal(compare(a, fromMajor('10.00', 'USD')), 0);
  });

  await t.test('isZero', () => {
    assert.ok(isZero(money(0n, 'USD')));
    assert.ok(!isZero(money(1n, 'USD')));
  });
});

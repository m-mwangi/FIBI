/**
 * Money.
 *
 * Every monetary value in this system is an integer number of **minor units**
 * (cents for USD, cents for KES) paired with an ISO-4217 currency code. Amounts
 * are `BigInt` in JS and `BigInt` in Postgres.
 *
 * Why not floats: `0.1 + 0.2 !== 0.3` in binary floating point. Money columns
 * used to be `Float`, so sums drifted from their parts — a project's
 * `currentFunding` could disagree with the sum of its investments, and a
 * reconciliation engine comparing our balance to a bank statement would throw
 * false breaks forever. Integers cannot drift.
 *
 * Why minor units rather than `Decimal`: it is what payment providers use on
 * the wire. Stripe amounts are already in cents, so the old code was converting
 * *away* from an exact representation and back again.
 *
 * Currency is never implicit. There is no global default here on purpose —
 * adding a KES amount to a USD amount is a bug, and this module makes it throw
 * rather than silently produce a meaningless number.
 */

/**
 * Minor units per major unit, by currency.
 *
 * Most currencies are 2. The zero-decimal ones matter because treating JPY as
 * having cents inflates every amount 100×. Extend this table rather than
 * assuming 2 anywhere.
 */
const CURRENCY_EXPONENT = {
  USD: 2,
  KES: 2,
  EUR: 2,
  GBP: 2,
  SGD: 2,
  ZAR: 2,
  // Zero-decimal currencies — no minor unit exists.
  JPY: 0,
  KRW: 0,
  UGX: 0,
  RWF: 0,
};

const DEFAULT_EXPONENT = 2;

/** Currency codes are stored and compared upper-case, always. */
function normaliseCurrency(currency) {
  if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency.trim())) {
    throw new TypeError(`Invalid currency code: ${JSON.stringify(currency)}`);
  }
  return currency.trim().toUpperCase();
}

function exponentFor(currency) {
  const code = normaliseCurrency(currency);
  return Object.prototype.hasOwnProperty.call(CURRENCY_EXPONENT, code)
    ? CURRENCY_EXPONENT[code]
    : DEFAULT_EXPONENT;
}

/** 10^exponent as a BigInt — the multiplier between major and minor units. */
function scaleFor(currency) {
  return 10n ** BigInt(exponentFor(currency));
}

/**
 * A money value: `{ amount: BigInt (minor units), currency: 'USD' }`.
 *
 * Frozen so a value cannot be mutated in place after being handed to a caller.
 */
function money(amount, currency) {
  const code = normaliseCurrency(currency);
  let minor;

  if (typeof amount === 'bigint') {
    minor = amount;
  } else if (typeof amount === 'number') {
    if (!Number.isInteger(amount)) {
      // A non-integer here means someone passed major units (12.34) where minor
      // units were expected. Silently truncating would lose money, so refuse.
      throw new TypeError(
        `Money amounts are integer minor units; got ${amount}. ` +
          `Use fromMajor(${amount}, '${code}') if that was a major-unit value.`
      );
    }
    if (!Number.isSafeInteger(amount)) {
      throw new RangeError(`Amount ${amount} exceeds safe integer range`);
    }
    minor = BigInt(amount);
  } else if (typeof amount === 'string' && /^-?\d+$/.test(amount.trim())) {
    minor = BigInt(amount.trim());
  } else {
    throw new TypeError(`Cannot build money from ${JSON.stringify(amount)}`);
  }

  return Object.freeze({ amount: minor, currency: code });
}

/** Guard: two values must share a currency before they can be combined. */
function assertSameCurrency(a, b) {
  if (a.currency !== b.currency) {
    throw new TypeError(
      `Currency mismatch: cannot combine ${a.currency} with ${b.currency}. ` +
        `Convert explicitly and post the difference to an FX account.`
    );
  }
}

function add(a, b) {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

function subtract(a, b) {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

/**
 * Sum a list. The currency is taken from the values, so an empty list needs one
 * supplied — there is no such thing as a currency-less zero.
 */
function sum(values, currency) {
  if (values.length === 0) {
    if (!currency) throw new TypeError('sum() of an empty list needs an explicit currency');
    return money(0n, currency);
  }
  return values.reduce((acc, v) => add(acc, v));
}

/**
 * Multiply by an integer count (e.g. 3 units at this price).
 *
 * Deliberately does not accept fractions: percentage maths belongs in
 * `applyRate`, which is explicit about rounding.
 */
function multiply(value, factor) {
  if (!Number.isInteger(factor) && typeof factor !== 'bigint') {
    throw new TypeError(`multiply() takes an integer factor; use applyRate() for percentages`);
  }
  return money(value.amount * BigInt(factor), value.currency);
}

/**
 * Apply a percentage rate (platform fee, transaction fee) with explicit
 * rounding.
 *
 * Rates are genuinely fractional (2.5%), so this is where a float legitimately
 * enters — but only as the *rate*, never as an accumulated balance, and the
 * result is rounded back to an exact integer immediately. Rounds half away from
 * zero, which is what finance conventionally expects and what `Math.round`
 * does not do for negatives.
 */
function applyRate(value, ratePercent) {
  if (!Number.isFinite(ratePercent)) {
    throw new TypeError(`Rate must be a finite number; got ${ratePercent}`);
  }
  // Scale the rate to an integer per-million to keep the multiplication exact,
  // then divide once. 2.5% -> 25000 per million.
  const PER_MILLION = 1_000_000n;
  const scaledRate = BigInt(Math.round(ratePercent * 10_000));
  const product = value.amount * scaledRate;

  const negative = product < 0n;
  const magnitude = negative ? -product : product;
  // Round half away from zero: add half the divisor before truncating.
  const rounded = (magnitude + PER_MILLION / 2n) / PER_MILLION;

  return money(negative ? -rounded : rounded, value.currency);
}

function isZero(value) {
  return value.amount === 0n;
}

function isNegative(value) {
  return value.amount < 0n;
}

function compare(a, b) {
  assertSameCurrency(a, b);
  if (a.amount < b.amount) return -1;
  if (a.amount > b.amount) return 1;
  return 0;
}

/**
 * Build from a major-unit value ("12.34" or 12.34).
 *
 * Only for parsing input at a boundary — user forms, a bank statement in
 * decimal, a legacy Float column. Strings are parsed digit-by-digit so the
 * value never passes through a float at all. Numbers are accepted for
 * convenience but are rounded, since by the time a value is a JS number the
 * precision loss has already happened.
 */
function fromMajor(value, currency) {
  const code = normaliseCurrency(currency);
  const exponent = exponentFor(code);
  const scale = scaleFor(code);

  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/,/g, '');
    const match = /^(-)?(\d*)(?:\.(\d*))?$/.exec(trimmed);
    if (!match || (match[2] === '' && (match[3] ?? '') === '')) {
      throw new TypeError(`Cannot parse major-unit amount: ${JSON.stringify(value)}`);
    }
    const [, sign, whole = '0', fraction = ''] = match;
    // Pad or truncate the fraction to the currency's exponent.
    const padded = (fraction + '0'.repeat(exponent)).slice(0, exponent);
    const minor = BigInt(whole || '0') * scale + BigInt(padded || '0');
    return money(sign ? -minor : minor, code);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`Cannot convert ${value} to money`);
    // Round at the minor unit — this is the one place a float is unavoidable,
    // and it is exactly where the legacy Float columns get converted.
    return money(BigInt(Math.round(value * Number(scale))), code);
  }

  if (typeof value === 'bigint') {
    return money(value * scale, code);
  }

  throw new TypeError(`Cannot convert ${JSON.stringify(value)} to money`);
}

/**
 * Decimal string in major units — "1234.50".
 *
 * This is a *presentation* conversion. Never feed the result back into
 * arithmetic; that is what re-introduces float drift.
 */
function toMajorString(value) {
  const exponent = exponentFor(value.currency);
  const scale = scaleFor(value.currency);
  const negative = value.amount < 0n;
  const magnitude = negative ? -value.amount : value.amount;

  const whole = magnitude / scale;
  const fraction = magnitude % scale;

  const body =
    exponent === 0 ? `${whole}` : `${whole}.${fraction.toString().padStart(exponent, '0')}`;

  return negative ? `-${body}` : body;
}

/**
 * Minor units as a JS number, for JSON responses.
 *
 * Money is transported as minor units so the client never does decimal
 * arithmetic. Safe because JS integers are exact to 2^53 — about 90 trillion
 * dollars in cents — but the guard is here because a silently-rounded balance
 * is the exact class of bug this module exists to prevent.
 */
function toMinorNumber(value) {
  const asNumber = Number(value.amount);
  if (!Number.isSafeInteger(asNumber)) {
    throw new RangeError(
      `Money value ${value.amount} ${value.currency} exceeds safe integer range for JSON`
    );
  }
  return asNumber;
}

/** Human-readable, for logs and emails. Not for arithmetic. */
function format(value, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: exponentFor(value.currency),
  }).format(Number(toMajorString(value)));
}

module.exports = {
  money,
  fromMajor,
  toMajorString,
  toMinorNumber,
  format,
  add,
  subtract,
  sum,
  multiply,
  applyRate,
  compare,
  isZero,
  isNegative,
  assertSameCurrency,
  normaliseCurrency,
  exponentFor,
  CURRENCY_EXPONENT,
};

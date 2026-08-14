/**
 * Money display.
 *
 * The API sends money as integer MINOR units (cents) so no decimal arithmetic
 * happens on the wire or in the client. These helpers exist purely to render
 * that integer, and are the single place the currency exponent table lives —
 * mirroring BACKEND/utils/money.js.
 */

const CURRENCY_EXPONENT: Record<string, number> = {
  USD: 2, KES: 2, EUR: 2, GBP: 2, SGD: 2, ZAR: 2,
  JPY: 0, KRW: 0, UGX: 0, RWF: 0,
};

export function exponentFor(currency = "USD"): number {
  return CURRENCY_EXPONENT[currency.toUpperCase()] ?? 2;
}

/** Integer minor units to a major-unit number, for display only. */
export function minorToMajor(minorUnits: number, currency = "USD"): number {
  return (Number.isFinite(minorUnits) ? minorUnits : 0) / 10 ** exponentFor(currency);
}

/** A major-unit form input ("59", "12.34") to integer minor units. */
export function majorToMinor(value: string | number, currency = "USD"): number {
  const major = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(major)) return 0;
  return Math.round(major * 10 ** exponentFor(currency));
}

/**
 * Format integer minor units as currency.
 *
 * Fractional units are shown only when there are any: a $59.00 plan reads
 * better as "$59", but $19.50 must not silently round to "$20".
 */
export function formatMoney(minorUnits: number, currency = "USD"): string {
  const major = minorToMajor(minorUnits, currency);
  const hasFraction = Math.abs(major % 1) > Number.EPSILON;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(major);
}

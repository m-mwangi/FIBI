/** Shared formatters so every admin surface renders numbers and dates identically. */

/**
 * Minor units per major unit. Mirrors BACKEND/utils/money.js — the two must
 * agree, or a JPY amount renders 100x wrong on one side of the wire.
 */
const CURRENCY_EXPONENT: Record<string, number> = {
  USD: 2, KES: 2, EUR: 2, GBP: 2, SGD: 2, ZAR: 2,
  JPY: 0, KRW: 0, UGX: 0, RWF: 0,
};

/**
 * Convert integer minor units to a major-unit number for display only.
 *
 * The API sends money as integer minor units (cents) so the client never does
 * decimal arithmetic. Sum first, divide last: dividing early puts every
 * subtotal back into floating point, which is the drift this whole change
 * removes.
 */
export function minorToMajor(minorUnits: number, currency = 'USD'): number {
  const exponent = CURRENCY_EXPONENT[currency.toUpperCase()] ?? 2;
  return (Number.isFinite(minorUnits) ? minorUnits : 0) / 10 ** exponent;
}

/**
 * Convert a major-unit form input ("500", "12.34") to integer minor units.
 *
 * The inverse of `minorToMajor`, used only where an operator types an amount.
 * Rounds, so a stray extra decimal cannot produce a fractional cent that the
 * backend would then reject.
 */
export function majorToMinor(value: string | number, currency = 'USD'): number {
  const exponent = CURRENCY_EXPONENT[currency.toUpperCase()] ?? 2;
  const major = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(major)) return 0;
  return Math.round(major * 10 ** exponent);
}

/** Format integer MINOR units as currency — e.g. 173500000 -> "$1,735,000". */
export function formatCurrency(minorUnits: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(minorToMajor(minorUnits, currency));
}

/** Compact form for chart axes, where "$1.8M" fits and "$1,800,000" does not. */
export function formatCompact(minorUnits: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(minorToMajor(minorUnits, currency));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "3 days ago" — used in the activity feed where exact timestamps add noise. */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';

  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (Math.abs(mins) < 1) return 'just now';
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return formatDate(value);
}

export function fundingPercent(current: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
}

/** Brand-aligned categorical palette for charts (emerald-led, distinguishable in both themes). */
export const CHART_COLORS = [
  '#059669', // emerald-600
  '#0891b2', // cyan-600
  '#7c3aed', // violet-600
  '#d97706', // amber-600
  '#e11d48', // rose-600
  '#0d9488', // teal-600
  '#4f46e5', // indigo-600
];

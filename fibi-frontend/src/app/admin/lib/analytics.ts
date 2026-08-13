/**
 * Derives chart series from real record timestamps.
 *
 * This replaces the hardcoded arrays the old dashboard shipped (a
 * "trend illustration" synthesized from one number, and an investment curve
 * where five of six points were literals). Everything here is computed from
 * `createdAt` on records the admin endpoints already return, so a chart either
 * shows the truth or shows an empty state — it never invents a trend.
 */

export type MonthPoint = { month: string; value: number };

/** Inclusive list of the last `count` months, oldest first. */
export function lastMonths(count: number, now = new Date()) {
  const out: { label: string; end: Date }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // End of that month, so a record created on the 31st still lands inside it.
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    out.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      end,
    });
  }
  return out;
}

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Running total of records that existed at the end of each month — the honest
 * shape for "total users over time", where the line should never fall.
 */
export function cumulativeCountByMonth<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  months = 6,
  now = new Date()
): MonthPoint[] {
  const times = items.map(getDate).map(toTime).filter((t): t is number => t !== null);
  return lastMonths(months, now).map(({ label, end }) => ({
    month: label,
    value: times.filter((t) => t <= end.getTime()).length,
  }));
}

/** Running total of an amount field at the end of each month. */
export function cumulativeSumByMonth<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getAmount: (item: T) => number,
  months = 6,
  now = new Date()
): MonthPoint[] {
  const rows = items
    .map((item) => ({ t: toTime(getDate(item)), amount: getAmount(item) || 0 }))
    .filter((r): r is { t: number; amount: number } => r.t !== null);

  return lastMonths(months, now).map(({ label, end }) => ({
    month: label,
    value: rows.reduce((sum, r) => (r.t <= end.getTime() ? sum + r.amount : sum), 0),
  }));
}

/** Per-month (non-cumulative) totals — for bar charts of activity in a period. */
export function sumPerMonth<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getAmount: (item: T) => number,
  months = 6,
  now = new Date()
): MonthPoint[] {
  const buckets = lastMonths(months, now);
  const rows = items
    .map((item) => ({ t: toTime(getDate(item)), amount: getAmount(item) || 0 }))
    .filter((r): r is { t: number; amount: number } => r.t !== null);

  return buckets.map(({ label, end }, i) => {
    const start = i === 0 ? -Infinity : buckets[i - 1]!.end.getTime();
    return {
      month: label,
      value: rows.reduce(
        (sum, r) => (r.t > start && r.t <= end.getTime() ? sum + r.amount : sum),
        0
      ),
    };
  });
}

/**
 * Percentage change between the last two points, or null when there is no
 * meaningful baseline. Returning null (rather than 0% or 100%) keeps the UI
 * from implying a trend that a single month of data cannot support.
 */
export function trendDelta(series: MonthPoint[]): number | null {
  if (series.length < 2) return null;
  const prev = series[series.length - 2]!.value;
  const curr = series[series.length - 1]!.value;
  if (prev === 0) return curr === 0 ? null : null;
  return ((curr - prev) / prev) * 100;
}

/** True when every point is zero — the signal to render an empty state instead of a flat line. */
export function isEmptySeries(series: MonthPoint[]): boolean {
  return series.every((p) => p.value === 0);
}

/** Group by an arbitrary key and sum a numeric field. Used for category / project breakdowns. */
export function sumByKey<T>(
  items: T[],
  getKey: (item: T) => string,
  getAmount: (item: T) => number
): { name: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item) || 'Uncategorised';
    totals.set(key, (totals.get(key) ?? 0) + (getAmount(item) || 0));
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

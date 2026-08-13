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

/**
 * Per-month (non-cumulative) record counts — the shape a KPI sparkline wants.
 *
 * A cumulative series can only ever slope up, so it makes every tile look
 * healthy. Counting arrivals per month shows when growth actually stalled.
 */
export function countPerMonth<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  months = 6,
  now = new Date()
): MonthPoint[] {
  const buckets = lastMonths(months, now);
  const times = items.map(getDate).map(toTime).filter((t): t is number => t !== null);

  return buckets.map(({ label, end }, i) => {
    const start = i === 0 ? -Infinity : buckets[i - 1]!.end.getTime();
    return {
      month: label,
      value: times.filter((t) => t > start && t <= end.getTime()).length,
    };
  });
}

/**
 * Net cash movement per month: deposits in, withdrawals out.
 *
 * `getDirection` returns +1, -1 or 0 so the caller decides which transaction
 * types count as inflow without this module knowing the type enum.
 */
export function netFlowPerMonth<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getAmount: (item: T) => number,
  getDirection: (item: T) => number,
  months = 6,
  now = new Date()
): { month: string; inflow: number; outflow: number; net: number }[] {
  const buckets = lastMonths(months, now);
  const rows = items
    .map((item) => ({
      t: toTime(getDate(item)),
      amount: Math.abs(getAmount(item) || 0),
      dir: getDirection(item),
    }))
    .filter((r): r is { t: number; amount: number; dir: number } => r.t !== null);

  return buckets.map(({ label, end }, i) => {
    const start = i === 0 ? -Infinity : buckets[i - 1]!.end.getTime();
    const inWindow = rows.filter((r) => r.t > start && r.t <= end.getTime());
    const inflow = inWindow.filter((r) => r.dir > 0).reduce((sum, r) => sum + r.amount, 0);
    const outflow = inWindow.filter((r) => r.dir < 0).reduce((sum, r) => sum + r.amount, 0);
    return { month: label, inflow, outflow, net: inflow - outflow };
  });
}

/**
 * Leaderboard: group, sum, and keep the biggest few.
 *
 * `count` rides along because a leaderboard row almost always wants both the
 * total and how many records produced it ("$42k across 7 investments").
 */
export function topByAmount<T>(
  items: T[],
  getKey: (item: T) => string,
  getLabel: (item: T) => string,
  getAmount: (item: T) => number,
  limit = 5
): { key: string; label: string; value: number; count: number }[] {
  const totals = new Map<string, { label: string; value: number; count: number }>();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    const existing = totals.get(key);
    const amount = getAmount(item) || 0;
    if (existing) {
      existing.value += amount;
      existing.count += 1;
    } else {
      totals.set(key, { label: getLabel(item), value: amount, count: 1 });
    }
  }
  return [...totals.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
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

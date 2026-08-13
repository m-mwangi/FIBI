import { useMemo, useState } from 'react';
import { Activity, CircleDollarSign, Repeat, UserCheck, Users as UsersIcon } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminData } from '../lib/AdminDataContext';
import {
  countPerMonth,
  cumulativeCountByMonth,
  cumulativeSumByMonth,
  isEmptySeries,
  sumByKey,
  sumPerMonth,
  trendDelta,
} from '../lib/analytics';
import { CHART_COLORS, formatCompact, formatCurrency, formatNumber } from '../lib/format';
import {
  EmptyChart,
  FundingBar,
  PageHeader,
  Panel,
  Segmented,
  Skeleton,
  StatCard,
} from '../components/primitives';

const RANGES = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 24, label: '24 months' },
];

/** Shared axis/tooltip config so every chart reads the same way. */
const axisTick = { fontSize: 12, fill: '#94a3b8' };
const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e4e8ee',
  fontSize: 13,
  boxShadow: '0 8px 24px rgb(15 23 42 / 0.10)',
};

export default function Analytics() {
  const { users, projects, transactions, investments } = useAdminData();
  const [months, setMonths] = useState(6);

  const userGrowth = useMemo(
    () => cumulativeCountByMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );

  const signups = useMemo(
    () => countPerMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );

  /**
   * Real capital curve: cumulative completed INVESTMENT transactions.
   * The old chart hardcoded five of its six points.
   */
  const completedInvestments = useMemo(
    () => transactions.data.filter((t) => t.type === 'INVESTMENT' && t.status === 'completed'),
    [transactions.data]
  );

  const capitalGrowth = useMemo(
    () =>
      cumulativeSumByMonth(
        completedInvestments,
        (t) => t.createdAt,
        (t) => t.amountMinor,
        months
      ),
    [completedInvestments, months]
  );

  /** Per-month capital, which shows when momentum actually changed. */
  const velocity = useMemo(
    () =>
      sumPerMonth(
        completedInvestments,
        (t) => t.createdAt,
        (t) => t.amountMinor,
        months
      ),
    [completedInvestments, months]
  );

  const byProject = useMemo(
    () =>
      [...projects.data]
        .filter((p) => p.currentFundingMinor > 0)
        .sort((a, b) => b.currentFundingMinor - a.currentFundingMinor)
        .slice(0, 8),
    [projects.data]
  );

  const byCategory = useMemo(
    () =>
      sumByKey(
        projects.data,
        (p) => p.category,
        (p) => p.currentFundingMinor
      ).filter((d) => d.value > 0),
    [projects.data]
  );

  const categoryTotal = byCategory.reduce((sum, c) => sum + c.value, 0);

  /**
   * Conversion funnel from accounts to repeat backers.
   *
   * Counted from distinct investor ids in the investments list rather than from
   * a role flag: holding the `investor` role only means the account was created
   * that way, not that anyone actually invested.
   */
  const funnel = useMemo(() => {
    const counts = new Map<string, number>();
    for (const inv of investments.data) {
      counts.set(inv.userId, (counts.get(inv.userId) ?? 0) + 1);
    }
    const invested = counts.size;
    const repeat = [...counts.values()].filter((n) => n > 1).length;
    return [
      { label: 'Registered accounts', value: users.data.length, tone: CHART_COLORS[0]! },
      { label: 'Made an investment', value: invested, tone: CHART_COLORS[1]! },
      { label: 'Invested more than once', value: repeat, tone: CHART_COLORS[2]! },
    ];
  }, [users.data, investments.data]);

  const totalRaised = projects.data.reduce((sum, p) => sum + p.currentFundingMinor, 0);
  const avgInvestment =
    investments.data.length > 0
      ? investments.data.reduce((sum, i) => sum + (i.amountInvestedMinor || 0), 0) /
        investments.data.length
      : 0;

  const loading = users.loading || projects.loading || transactions.loading;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Every series below is derived from record timestamps — nothing here is illustrative."
        actions={<Segmented size="sm" options={RANGES} value={months} onChange={setMonths} />}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Accounts"
          value={formatNumber(users.data.length)}
          icon={UsersIcon}
          series={signups.map((p) => p.value)}
          delta={trendDelta(signups)}
          hint="Total registered"
          loading={users.loading}
        />
        <StatCard
          label="Capital raised"
          value={formatCurrency(totalRaised)}
          icon={CircleDollarSign}
          tone="sky"
          series={capitalGrowth.map((p) => p.value)}
          hint="Across all projects"
          loading={projects.loading}
        />
        <StatCard
          label="Investing accounts"
          value={formatNumber(funnel[1]!.value)}
          icon={UserCheck}
          tone="violet"
          hint={`${funnel[2]!.value} invested more than once`}
          loading={investments.loading}
        />
        <StatCard
          label="Average investment"
          value={formatCurrency(avgInvestment)}
          icon={Activity}
          tone="amber"
          hint={`${formatNumber(investments.data.length)} positions`}
          loading={investments.loading}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Account growth" description="Total registered accounts at each month end">
          {loading ? (
            <Skeleton className="h-[280px]" />
          ) : isEmptySeries(userGrowth) ? (
            <EmptyChart message="No accounts have been created yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={userGrowth} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="anAccounts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.26} />
                    <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e4e8ee' }} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatNumber(v), 'Accounts']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2.5}
                  fill="url(#anAccounts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Capital invested" description="Cumulative completed investment transactions">
          {loading ? (
            <Skeleton className="h-[280px]" />
          ) : isEmptySeries(capitalGrowth) ? (
            <EmptyChart message="No completed investment transactions have been recorded yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={capitalGrowth} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="anCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[1]} stopOpacity={0.26} />
                    <stop offset="100%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e4e8ee' }} />
                {/* Compact ticks plus explicit width: the old chart clipped the
                    leading digit off every label ("1800000" rendered "800000"). */}
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={68}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Invested']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2.5}
                  fill="url(#anCapital)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <Panel
        title="Funding velocity"
        description="Capital invested within each month, rather than the running total"
        className="mt-5"
      >
        {loading ? (
          <Skeleton className="h-[260px]" />
        ) : isEmptySeries(velocity) ? (
          <EmptyChart message="No completed investments to break down by month." height={260} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={velocity} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e4e8ee' }} />
              <YAxis
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={68}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: '#f8fafc' }}
                formatter={(v: number) => [formatCurrency(v), 'Invested this month']}
              />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Funding by project" description="Capital raised per project, highest first">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : byProject.length === 0 ? (
            <EmptyChart message="No project has received funding yet." height={240} />
          ) : (
            // A table with inline bars rather than a bar chart: project titles
            // are long, and as axis labels they either collided or were
            // truncated past the point of being identifiable.
            <ul className="divide-y divide-slate-50">
              {byProject.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-800">{p.title}</span>
                    <span className="adm-num shrink-0 text-sm font-semibold text-slate-900">
                      {formatCompact(p.currentFundingMinor)}
                    </span>
                  </div>
                  <FundingBar current={p.currentFundingMinor} total={p.totalFundingMinor} showLabel={false} />
                  <p className="adm-num mt-1 text-xs text-slate-400">
                    of {formatCompact(p.totalFundingMinor)} target · {p.location}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Funding by category" description="Where capital is concentrated">
          {loading ? (
            <Skeleton className="h-[280px]" />
          ) : byCategory.length === 0 ? (
            <EmptyChart message="No funded projects to break down by category." />
          ) : (
            <div className="grid items-center gap-4 sm:grid-cols-2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {byCategory.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>

              {/* A readable table beside the donut — labels on slices were unreadable. */}
              <ul className="divide-y divide-slate-50">
                {byCategory.map((c, i) => {
                  const pct = categoryTotal > 0 ? (c.value / categoryTotal) * 100 : 0;
                  return (
                    <li key={c.name} className="flex items-center gap-2.5 py-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="flex-1 truncate text-sm capitalize text-slate-700">
                        {c.name.replace(/-/g, ' ')}
                      </span>
                      <span className="adm-num text-sm font-semibold text-slate-900">
                        {formatCompact(c.value)}
                      </span>
                      <span className="adm-num w-10 text-right text-xs text-slate-400">
                        {pct.toFixed(0)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Investor conversion"
        description="How far accounts travel from sign-up to repeat investment"
        className="mt-5"
      >
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : funnel[0]!.value === 0 ? (
          <EmptyChart message="No accounts have registered yet." height={200} />
        ) : (
          <ul className="space-y-4">
            {funnel.map((stage, i) => {
              const base = funnel[0]!.value;
              const pct = base > 0 ? (stage.value / base) * 100 : 0;
              const previous = i === 0 ? null : funnel[i - 1]!.value;
              const stepPct = previous && previous > 0 ? (stage.value / previous) * 100 : null;
              return (
                <li key={stage.label}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      {i === 2 && <Repeat className="h-3.5 w-3.5 text-slate-400" />}
                      {stage.label}
                    </span>
                    <span className="adm-num text-sm text-slate-500">
                      <span className="font-semibold text-slate-900">{formatNumber(stage.value)}</span>
                      {stepPct !== null && (
                        <span className="ml-2 text-xs text-slate-400">
                          {stepPct.toFixed(0)}% of previous step
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(pct, stage.value > 0 ? 2 : 0)}%`, background: stage.tone }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}

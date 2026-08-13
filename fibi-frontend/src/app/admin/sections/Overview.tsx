import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  FolderOpen,
  TrendingUp,
  Trophy,
  Users as UsersIcon,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../lib/AdminDataContext';
import {
  countPerMonth,
  cumulativeCountByMonth,
  cumulativeSumByMonth,
  isEmptySeries,
  sumByKey,
  topByAmount,
  trendDelta,
} from '../lib/analytics';
import { buildQueue, type QueueItem } from '../lib/queue';
import { CHART_COLORS, formatCompact, formatCurrency, formatNumber, formatRelative } from '../lib/format';
import {
  Avatar,
  EmptyChart,
  EmptyState,
  PageHeader,
  Panel,
  Ring,
  Segmented,
  Skeleton,
  StatCard,
  StatusPill,
} from '../components/primitives';
import { AuditFeed } from '../components/AuditFeed';

const RANGES = [
  { value: 3, label: '3M' },
  { value: 6, label: '6M' },
  { value: 12, label: '12M' },
];

const QUEUE_STYLE: Record<QueueItem['kind'], { icon: typeof Wallet; chip: string }> = {
  'project-overdue': { icon: CalendarClock, chip: 'bg-amber-50 text-amber-600' },
  'transaction-pending': { icon: Wallet, chip: 'bg-sky-50 text-sky-600' },
  'application-pending': { icon: BadgeCheck, chip: 'bg-violet-50 text-violet-600' },
};

/** Money in vs money out, for the activity feed's amount colouring. */
const INFLOW_TYPES = new Set(['DEPOSIT', 'PAYOUT']);

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e4e8ee',
  fontSize: 13,
  boxShadow: '0 8px 24px rgb(15 23 42 / 0.10)',
};

export default function Overview() {
  const { user } = useAuth();
  const { users, projects, transactions, investments, applications, audit, lastSyncedAt } =
    useAdminData();
  const [months, setMonths] = useState(6);

  const now = useMemo(() => new Date(), []);

  /* ------------------------------------------------------------- headline */

  const totalRaised = projects.data.reduce((sum, p) => sum + p.currentFunding, 0);
  const openProjects = projects.data.filter((p) => p.status === 'open').length;
  const investorCount = users.data.filter((u) => u.role === 'investor').length;

  // Real series from account creation timestamps — not a curve fitted to a total.
  const userGrowth = useMemo(
    () => cumulativeCountByMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );
  const signupsPerMonth = useMemo(
    () => countPerMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );
  const userDelta = trendDelta(signupsPerMonth);

  const capitalGrowth = useMemo(
    () =>
      cumulativeSumByMonth(
        transactions.data.filter((t) => t.type === 'INVESTMENT' && t.status === 'completed'),
        (t) => t.createdAt,
        (t) => t.amount,
        months
      ),
    [transactions.data, months]
  );

  /** Both series on one axis pair, so growth and capital can be read together. */
  const combined = useMemo(
    () =>
      userGrowth.map((point, i) => ({
        month: point.month,
        accounts: point.value,
        capital: capitalGrowth[i]?.value ?? 0,
      })),
    [userGrowth, capitalGrowth]
  );

  /* ---------------------------------------------------------------- queue */

  const queue = useMemo(
    () =>
      buildQueue({
        projects: projects.data,
        transactions: transactions.data,
        applications: applications.data,
        now: now.getTime(),
      }),
    [projects.data, transactions.data, applications.data, now]
  );

  /* ----------------------------------------------------------- panel data */

  const recentActivity = useMemo(
    () =>
      [...transactions.data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [transactions.data]
  );

  const nearlyFunded = useMemo(
    () =>
      [...projects.data]
        .filter((p) => p.totalFunding > 0 && p.status === 'open')
        .sort((a, b) => b.currentFunding / b.totalFunding - a.currentFunding / a.totalFunding)
        .slice(0, 5),
    [projects.data]
  );

  const topInvestors = useMemo(
    () =>
      topByAmount(
        investments.data,
        (i) => i.userId,
        (i) => i.user?.name ?? 'Unknown investor',
        (i) => i.amountInvested,
        5
      ),
    [investments.data]
  );

  const categoryMix = useMemo(() => {
    const rows = sumByKey(
      projects.data,
      (p) => p.category,
      (p) => p.currentFunding
    ).filter((d) => d.value > 0);
    const total = rows.reduce((sum, r) => sum + r.value, 0);
    return { rows: rows.slice(0, 6), total };
  }, [projects.data]);

  const chartsLoading = users.loading || transactions.loading;

  return (
    <>
      <PageHeader
        eyebrow={lastSyncedAt ? `Synced ${formatRelative(lastSyncedAt.toISOString())}` : 'Loading…'}
        title={`${greeting(now.getHours())}, ${user?.name?.split(' ')[0] ?? 'Admin'}`}
        description={now.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        actions={
          <Link
            to="/admin/analytics"
            className="adm-focus inline-flex items-center gap-1.5 rounded-xl border border-[var(--adm-line)] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300"
          >
            Full analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* KPI row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={formatNumber(users.data.length)}
          icon={UsersIcon}
          delta={userDelta}
          series={signupsPerMonth.map((p) => p.value)}
          hint={`${formatNumber(investorCount)} investors`}
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
          label="Open projects"
          value={formatNumber(openProjects)}
          icon={FolderOpen}
          tone="violet"
          hint={`of ${formatNumber(projects.data.length)} total`}
          loading={projects.loading}
        />
        <StatCard
          label="Platform revenue"
          value={formatCurrency(totalRaised * 0.02)}
          icon={TrendingUp}
          tone="amber"
          hint="2% of capital raised"
          loading={projects.loading}
        />
      </div>

      {/* Chart + action queue */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          title="Platform growth"
          description="Accounts registered and capital invested, at each month end"
          className="lg:col-span-2"
          actions={
            <Segmented
              size="sm"
              options={RANGES}
              value={months}
              onChange={setMonths}
            />
          }
        >
          {chartsLoading ? (
            <Skeleton className="h-[300px]" />
          ) : isEmptySeries(userGrowth) && isEmptySeries(capitalGrowth) ? (
            <EmptyChart message="No accounts or completed investments have been recorded yet." height={300} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combined} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="ovAccounts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ovCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[1]} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e4e8ee' }}
                />
                {/* Two axes: accounts are counts and capital is currency, and
                    plotting them on one scale would flatten whichever is
                    smaller into the baseline. */}
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={40}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={62}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) =>
                    name === 'capital'
                      ? [formatCurrency(value), 'Capital invested']
                      : [formatNumber(value), 'Accounts']
                  }
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="accounts"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2.5}
                  fill="url(#ovAccounts)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="capital"
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2.5}
                  fill="url(#ovCapital)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[0] }} />
              Accounts
            </span>
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[1] }} />
              Capital invested
            </span>
          </div>
        </Panel>

        {/* The action queue: the one panel that says what to do next. */}
        <Panel
          title="Needs attention"
          description={queue.length === 0 ? 'Nothing is waiting on you' : `${queue.length} open item${queue.length === 1 ? '' : 's'}`}
          padded={false}
        >
          {queue.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <CheckCircle2 className="mb-3 h-9 w-9 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700">All clear</p>
              <p className="mt-1 max-w-[16rem] text-sm text-slate-500">
                No overdue projects, no pending money, no waiting applications.
              </p>
            </div>
          ) : (
            <ul className="max-h-[356px] divide-y divide-slate-50 overflow-y-auto">
              {queue.slice(0, 10).map((item) => {
                const style = QUEUE_STYLE[item.kind];
                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className="group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.chip}`}>
                        <style.icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">{item.label}</span>
                        <span className="block truncate text-xs capitalize text-slate-500">{item.detail}</span>
                      </span>
                      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Money movement + funding progress */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Recent money movement"
          description="The latest transactions across the platform"
          actions={
            <Link
              to="/admin/transactions"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {transactions.loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              body={transactions.error || 'Money movement will appear here once investors start transacting.'}
              icon={Coins}
            />
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentActivity.map((t) => {
                const inflow = INFLOW_TYPES.has(t.type);
                return (
                  <li key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        inflow ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {inflow ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {t.user?.name ?? 'Unknown user'}
                      </p>
                      <p className="truncate text-xs capitalize text-slate-500">
                        {t.type.toLowerCase()} · {formatRelative(t.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`adm-num text-sm font-semibold ${
                          inflow ? 'text-emerald-600' : 'text-slate-700'
                        }`}
                      >
                        {inflow ? '+' : '−'}
                        {formatCurrency(t.amount)}
                      </span>
                      <StatusPill status={t.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Closest to funding"
          description="Open projects ranked by share of target raised"
          actions={
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {projects.loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : nearlyFunded.length === 0 ? (
            <EmptyState
              title="No open projects"
              body={projects.error || 'Projects open for investment will be ranked here.'}
              icon={FolderOpen}
            />
          ) : (
            <ul className="divide-y divide-slate-50">
              {nearlyFunded.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0">
                  <Ring current={p.currentFunding} total={p.totalFunding} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{p.title}</p>
                    <p className="adm-num truncate text-xs text-slate-500">
                      {formatCompact(p.currentFunding)} of {formatCompact(p.totalFunding)} · {p.location}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Leaderboard + category mix */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Top investors" description="By total capital committed">
          {investments.loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : topInvestors.length === 0 ? (
            <EmptyState
              title="No investments yet"
              body={investments.error || 'The biggest backers will be listed here once investments are recorded.'}
              icon={Trophy}
            />
          ) : (
            <ul className="divide-y divide-slate-50">
              {topInvestors.map((row, i) => (
                <li key={row.key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="adm-num w-4 shrink-0 text-sm font-bold text-slate-300">{i + 1}</span>
                  <Avatar name={row.label} seed={row.key} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="adm-num text-xs text-slate-500">
                      {row.count} investment{row.count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="adm-num shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(row.value)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Where capital sits" description="Funding raised by project category">
          {projects.loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : categoryMix.rows.length === 0 ? (
            <EmptyState
              title="No funded projects"
              body="Once projects take funding, the category split appears here."
              icon={CircleDollarSign}
            />
          ) : (
            <ul className="space-y-3.5">
              {categoryMix.rows.map((row, i) => {
                const pct = categoryMix.total > 0 ? (row.value / categoryMix.total) * 100 : 0;
                return (
                  <li key={row.name}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium capitalize text-slate-700">
                        {row.name.replace(/-/g, ' ')}
                      </span>
                      <span className="adm-num shrink-0 text-sm text-slate-500">
                        {formatCompact(row.value)}
                        <span className="ml-2 text-xs text-slate-400">{pct.toFixed(0)}%</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Audit trail */}
      <Panel
        title="Recent admin activity"
        description="Every change made through this console"
        className="mt-5"
        actions={
          <Link
            to="/admin/settings#activity"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Full log
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <AuditFeed
          entries={audit.data}
          loading={audit.loading}
          error={audit.error}
          limit={6}
        />
      </Panel>
    </>
  );
}

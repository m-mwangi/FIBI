import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  Activity,
  ArrowRight,
  CircleDollarSign,
  FolderOpen,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminData } from '../lib/AdminDataContext';
import {
  cumulativeCountByMonth,
  isEmptySeries,
  trendDelta,
} from '../lib/analytics';
import { formatCompact, formatCurrency, formatNumber, formatRelative } from '../lib/format';
import { EmptyChart, FundingBar, PageHeader, Panel, StatCard, StatusPill } from '../components/primitives';

export default function Overview() {
  const { users, projects, transactions } = useAdminData();

  const totalRaised = projects.data.reduce((sum, p) => sum + p.currentFunding, 0);
  const openProjects = projects.data.filter((p) => p.status === 'open').length;
  const investorCount = users.data.filter((u) => u.role === 'investor').length;

  // Real series from account creation timestamps — not a curve fitted to a total.
  const userGrowth = useMemo(
    () => cumulativeCountByMonth(users.data, (u) => u.createdAt, 6),
    [users.data]
  );
  const userDelta = trendDelta(userGrowth);

  // Projects at risk: still open but past their funding deadline.
  const overdue = useMemo(
    () =>
      projects.data.filter(
        (p) => p.status === 'open' && new Date(p.fundingDeadline).getTime() < Date.now()
      ),
    [projects.data]
  );

  const pendingTransactions = useMemo(
    () => transactions.data.filter((t) => t.status === 'pending'),
    [transactions.data]
  );

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

  return (
    <>
      <PageHeader
        title="Overview"
        description="Live platform state across accounts, projects and money movement."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={formatNumber(users.data.length)}
          icon={UsersIcon}
          delta={userDelta}
          hint={`${formatNumber(investorCount)} investors`}
          loading={users.loading}
        />
        <StatCard
          label="Capital raised"
          value={formatCurrency(totalRaised)}
          icon={CircleDollarSign}
          hint="Across all projects"
          loading={projects.loading}
        />
        <StatCard
          label="Open projects"
          value={formatNumber(openProjects)}
          icon={FolderOpen}
          hint={`of ${formatNumber(projects.data.length)} total`}
          loading={projects.loading}
        />
        <StatCard
          label="Platform revenue"
          value={formatCurrency(totalRaised * 0.02)}
          icon={TrendingUp}
          hint="2% of capital raised"
          loading={projects.loading}
        />
      </div>

      {/* Things an admin has to act on, surfaced instead of buried in a tab. */}
      {(overdue.length > 0 || pendingTransactions.length > 0) && (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {overdue.length > 0 && (
            <Link
              to="/admin/projects"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 transition-colors hover:bg-amber-100/70"
            >
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {overdue.length} project{overdue.length === 1 ? '' : 's'} past deadline
                </p>
                <p className="mt-0.5 text-sm text-amber-700">
                  Still open but the funding deadline has passed.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-amber-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          {pendingTransactions.length > 0 && (
            <Link
              to="/admin/transactions"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 transition-colors hover:bg-sky-100/70"
            >
              <div>
                <p className="text-sm font-semibold text-sky-900">
                  {pendingTransactions.length} transaction
                  {pendingTransactions.length === 1 ? '' : 's'} pending
                </p>
                <p className="mt-0.5 text-sm text-sky-700">Awaiting settlement or review.</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-sky-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Account growth"
          description="Total registered accounts at each month end"
          className="lg:col-span-2"
        >
          {users.loading ? (
            <div className="h-[280px] animate-pulse rounded-xl bg-slate-100" />
          ) : isEmptySeries(userGrowth) ? (
            <EmptyChart message="No accounts have been created yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowth} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    boxShadow: '0 4px 16px rgb(15 23 42 / 0.08)',
                  }}
                  formatter={(v: number) => [formatNumber(v), 'Accounts']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#059669' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Recent activity" description="Latest money movement">
          {transactions.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {transactions.error || 'No transactions recorded yet.'}
            </p>
          ) : (
            <ul className="space-y-1">
              {recentActivity.map((t) => (
                <li key={t.id} className="flex items-start gap-3 rounded-lg px-1 py-2">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Activity className="h-4 w-4 text-slate-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {t.user?.name ?? 'Unknown user'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.type.toLowerCase()} · {formatCurrency(t.amount)} ·{' '}
                      {formatRelative(t.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Closest to funding"
        description="Open projects ranked by how much of their target is raised"
        className="mt-6"
        actions={
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            All projects
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {projects.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : nearlyFunded.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {projects.error || 'No open projects.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {nearlyFunded.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{p.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {formatCompact(p.currentFunding)} of {formatCompact(p.totalFunding)} ·{' '}
                    {p.location}
                  </p>
                </div>
                <div className="w-32 shrink-0">
                  <FundingBar current={p.currentFunding} total={p.totalFunding} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

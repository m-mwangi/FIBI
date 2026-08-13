import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminData } from '../lib/AdminDataContext';
import {
  cumulativeCountByMonth,
  cumulativeSumByMonth,
  isEmptySeries,
  sumByKey,
} from '../lib/analytics';
import { CHART_COLORS, formatCompact, formatCurrency, formatNumber } from '../lib/format';
import { EmptyChart, PageHeader, Panel } from '../components/primitives';

const RANGES = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 24, label: '24 months' },
];

/** Shared axis/tooltip config so every chart reads the same way. */
const axisTick = { fontSize: 12, fill: '#64748b' };
const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  fontSize: 13,
  boxShadow: '0 4px 16px rgb(15 23 42 / 0.08)',
};

export default function Analytics() {
  const { users, projects, transactions } = useAdminData();
  const [months, setMonths] = useState(6);

  const userGrowth = useMemo(
    () => cumulativeCountByMonth(users.data, (u) => u.createdAt, months),
    [users.data, months]
  );

  /**
   * Real capital curve: cumulative completed INVESTMENT transactions.
   * The old chart hardcoded five of its six points.
   */
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

  const byProject = useMemo(
    () =>
      sumByKey(
        projects.data,
        (p) => p.title,
        (p) => p.currentFunding
      )
        .filter((d) => d.value > 0)
        .slice(0, 8),
    [projects.data]
  );

  const byCategory = useMemo(
    () =>
      sumByKey(
        projects.data,
        (p) => p.category,
        (p) => p.currentFunding
      ).filter((d) => d.value > 0),
    [projects.data]
  );

  const loading = users.loading || projects.loading || transactions.loading;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Derived from record timestamps — every series below is real platform data."
        actions={
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setMonths(r.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  months === r.value
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Account growth" description="Total registered accounts at each month end">
          {loading ? (
            <div className="h-[280px] animate-pulse rounded-xl bg-slate-100" />
          ) : isEmptySeries(userGrowth) ? (
            <EmptyChart message="No accounts have been created yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowth} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatNumber(v), 'Accounts']} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: CHART_COLORS[0] }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Capital invested" description="Cumulative completed investment transactions">
          {loading ? (
            <div className="h-[280px] animate-pulse rounded-xl bg-slate-100" />
          ) : isEmptySeries(capitalGrowth) ? (
            <EmptyChart message="No completed investment transactions have been recorded yet." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={capitalGrowth} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                {/* Compact ticks plus explicit width: the old chart clipped the
                    leading digit off every label ("1800000" rendered "800000"). */}
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [formatCurrency(v), 'Invested']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: CHART_COLORS[1] }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <Panel
        title="Funding by project"
        description="Capital raised per project, highest first"
        className="mt-6"
      >
        {loading ? (
          <div className="h-[320px] animate-pulse rounded-xl bg-slate-100" />
        ) : byProject.length === 0 ? (
          <EmptyChart message="No project has received funding yet." />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(280, byProject.length * 44)}>
            {/* Horizontal layout: project titles are long and collided badly as
                x-axis labels in the old vertical bar chart. */}
            <BarChart
              data={byProject}
              layout="vertical"
              margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={axisTick}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ ...axisTick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={150}
                tickFormatter={(v: string) => (v.length > 22 ? `${v.slice(0, 21)}…` : v)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatCurrency(v), 'Raised']}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel
        title="Funding by category"
        description="Where capital is concentrated across project types"
        className="mt-6"
      >
        {loading ? (
          <div className="h-[300px] animate-pulse rounded-xl bg-slate-100" />
        ) : byCategory.length === 0 ? (
          <EmptyChart message="No funded projects to break down by category." />
        ) : (
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={104}
                  paddingAngle={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* A readable table beside the donut — labels on slices were unreadable. */}
            <ul className="divide-y divide-slate-100">
              {byCategory.map((c, i) => {
                const total = byCategory.reduce((sum, x) => sum + x.value, 0);
                const pct = total > 0 ? (c.value / total) * 100 : 0;
                return (
                  <li key={c.name} className="flex items-center gap-3 py-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="flex-1 truncate text-sm capitalize text-slate-700">
                      {c.name.replace(/-/g, ' ')}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCompact(c.value)}
                    </span>
                    <span className="w-12 text-right text-xs text-slate-400">{pct.toFixed(0)}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Panel>
    </>
  );
}

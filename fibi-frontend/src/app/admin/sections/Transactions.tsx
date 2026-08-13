import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Download,
  Scale,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdminData } from '../lib/AdminDataContext';
import { useTableState } from '../lib/useTableState';
import { DataTable, type Column } from '../components/DataTable';
import {
  Avatar,
  EmptyChart,
  PageHeader,
  Panel,
  Segmented,
  Skeleton,
  StatCard,
  StatusPill,
} from '../components/primitives';
import { netFlowPerMonth } from '../lib/analytics';
import { formatCompact, formatCurrency, formatDateTime } from '../lib/format';
import type { AdminTransaction } from '../lib/types';
import { Button } from '../../components/ui/button';

const TYPES = ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PAYOUT'] as const;

const TYPE_META: Record<string, { icon: typeof Coins; chip: string; inflow: boolean }> = {
  DEPOSIT: { icon: ArrowDownLeft, chip: 'bg-emerald-50 text-emerald-600', inflow: true },
  WITHDRAWAL: { icon: ArrowUpRight, chip: 'bg-rose-50 text-rose-600', inflow: false },
  INVESTMENT: { icon: Coins, chip: 'bg-sky-50 text-sky-600', inflow: false },
  PAYOUT: { icon: Wallet, chip: 'bg-violet-50 text-violet-600', inflow: true },
};

const STATUSES = ['all', 'completed', 'pending', 'failed'] as const;

function csvEscape(value: unknown): string {
  const s = String(value ?? '');
  // Quote when the value contains a delimiter, quote or newline; double inner quotes.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e4e8ee',
  fontSize: 13,
  boxShadow: '0 8px 24px rgb(15 23 42 / 0.10)',
};

export default function Transactions() {
  const { transactions } = useAdminData();
  const [state, set] = useTableState();
  const [params, setParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const typeFilter = state.filter;

  const filtered = useMemo(() => {
    let rows = transactions.data;
    // "pending" survives as a type-chip value for the deep links the action
    // queue and the old bookmarks produce.
    if (typeFilter === 'pending') rows = rows.filter((t) => t.status === 'pending');
    else if (typeFilter !== 'all') rows = rows.filter((t) => t.type === typeFilter);
    if (statusFilter !== 'all') rows = rows.filter((t) => t.status === statusFilter);
    return rows;
  }, [transactions.data, typeFilter, statusFilter]);

  const totals = useMemo(() => {
    const completed = transactions.data.filter((t) => t.status === 'completed');
    const sum = (type: string) =>
      completed.filter((t) => t.type === type).reduce((acc, t) => acc + (t.amountMinor || 0), 0);
    const deposits = sum('DEPOSIT');
    const withdrawals = sum('WITHDRAWAL');
    return {
      deposits,
      withdrawals,
      invested: sum('INVESTMENT'),
      payouts: sum('PAYOUT'),
      net: deposits - withdrawals,
      pending: transactions.data.filter((t) => t.status === 'pending').length,
    };
  }, [transactions.data]);

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      all: transactions.data.length,
      pending: transactions.data.filter((t) => t.status === 'pending').length,
    };
    for (const t of TYPES) base[t] = transactions.data.filter((x) => x.type === t).length;
    return base;
  }, [transactions.data]);

  const statusCounts = useMemo(
    () => ({
      all: transactions.data.length,
      completed: transactions.data.filter((t) => t.status === 'completed').length,
      pending: transactions.data.filter((t) => t.status === 'pending').length,
      failed: transactions.data.filter((t) => t.status === 'failed').length,
    }),
    [transactions.data]
  );

  /** Cash in vs cash out per month — the shape a treasury view needs. */
  const flow = useMemo(
    () =>
      netFlowPerMonth(
        transactions.data.filter((t) => t.status === 'completed'),
        (t) => t.createdAt,
        (t) => t.amountMinor,
        (t) => (TYPE_META[t.type]?.inflow ? 1 : -1),
        6
      ),
    [transactions.data]
  );

  const flowIsEmpty = flow.every((f) => f.inflow === 0 && f.outflow === 0);

  /** Client-side export of whatever rows are passed in. */
  const exportCsv = (rows: AdminTransaction[]) => {
    const header = ['Date', 'Name', 'Email', 'Type', 'Amount', 'Status'];
    const lines = rows.map((t) =>
      [
        new Date(t.createdAt).toISOString(),
        t.user?.name ?? '',
        t.user?.email ?? '',
        t.type,
        t.amountMinor,
        t.status,
      ]
        .map(csvEscape)
        .join(',')
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fibi-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    // Revoking immediately would race the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // The command palette's "Export transactions" lands here with ?export=1.
  useEffect(() => {
    if (params.get('export') !== '1') return;
    const next = new URLSearchParams(params);
    next.delete('export');
    setParams(next, { replace: true });
    if (filtered.length > 0) exportCsv(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const columns: Column<AdminTransaction>[] = [
    {
      key: 'user',
      header: 'Investor',
      sortValue: (t) => (t.user?.name ?? '').toLowerCase(),
      cell: (t) => (
        <div className="flex items-center gap-3">
          <Avatar name={t.user?.name ?? 'Unknown'} seed={t.userId} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{t.user?.name ?? 'Unknown'}</p>
            <p className="truncate text-xs text-slate-500">{t.user?.email ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortValue: (t) => t.type,
      cell: (t) => {
        const meta = TYPE_META[t.type] ?? { icon: Coins, chip: 'bg-slate-100 text-slate-500' };
        return (
          <span className="inline-flex items-center gap-2 text-sm capitalize text-slate-700">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.chip}`}>
              <meta.icon className="h-3.5 w-3.5" />
            </span>
            {t.type.toLowerCase()}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (t) => t.amountMinor,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (t) => {
        const inflow = TYPE_META[t.type]?.inflow ?? false;
        return (
          <span
            className={`adm-num text-sm font-semibold ${
              inflow ? 'text-emerald-600' : 'text-slate-800'
            }`}
          >
            {inflow ? '+' : '−'}
            {formatCurrency(t.amountMinor)}
          </span>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      sortValue: (t) => new Date(t.createdAt).getTime(),
      className: 'adm-num text-slate-600 hidden md:table-cell',
      headerClassName: 'hidden md:table-cell',
      cell: (t) => formatDateTime(t.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (t) => t.status,
      cell: (t) => <StatusPill status={t.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every deposit, withdrawal, investment and payout on the platform."
        actions={
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Deposits in"
          value={formatCurrency(totals.deposits)}
          icon={ArrowDownLeft}
          hint="Completed only"
          loading={transactions.loading}
        />
        <StatCard
          label="Withdrawals out"
          value={formatCurrency(totals.withdrawals)}
          icon={ArrowUpRight}
          tone="neutral"
          hint="Completed only"
          loading={transactions.loading}
        />
        <StatCard
          label="Net position"
          value={formatCurrency(totals.net)}
          icon={Scale}
          tone={totals.net >= 0 ? 'sky' : 'amber'}
          hint="Deposits less withdrawals"
          loading={transactions.loading}
        />
        <StatCard
          label="Pending"
          value={totals.pending}
          icon={Wallet}
          tone="amber"
          hint="Awaiting settlement"
          loading={transactions.loading}
        />
      </div>

      <Panel
        title="Monthly cash flow"
        description="Completed money in and out, by month"
        className="mb-5"
      >
        {transactions.loading ? (
          <Skeleton className="h-[260px]" />
        ) : flowIsEmpty ? (
          <EmptyChart message="No completed transactions have been recorded yet." height={260} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={flow} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e4e8ee' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={62}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: '#f8fafc' }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'inflow' ? 'Money in' : 'Money out',
                ]}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(value: string) => (value === 'inflow' ? 'Money in' : 'Money out')}
              />
              <Bar dataKey="inflow" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="outflow" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(t) => t.id}
        loading={transactions.loading}
        error={transactions.error}
        searchable={(t) => `${t.user?.name ?? ''} ${t.user?.email ?? ''} ${t.type} ${t.status}`}
        searchPlaceholder="Search investor, type or status…"
        filters={{
          value: typeFilter,
          onChange: set.setFilter,
          options: [
            { value: 'all', label: 'All', count: counts.all },
            ...TYPES.map((t) => ({
              value: t,
              label: t[0]! + t.slice(1).toLowerCase(),
              count: counts[t],
            })),
          ],
        }}
        // Status is its own control: it is orthogonal to type, and fusing the
        // two into one chip row made "pending" look like a fifth type.
        toolbarExtra={
          <Segmented
            size="sm"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUSES.map((s) => ({
              value: s,
              label: s === 'all' ? 'Any status' : s[0]!.toUpperCase() + s.slice(1),
              count: statusCounts[s],
            }))}
          />
        }
        bulkActions={[
          {
            label: 'Export selected',
            icon: <Download className="h-3.5 w-3.5" />,
            onClick: exportCsv,
          },
        ]}
        emptyTitle="No transactions"
        emptyBody="Money movement will appear here once investors start transacting."
      />
    </>
  );
}

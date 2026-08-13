import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Coins, Download, Wallet } from 'lucide-react';
import { useAdminData } from '../lib/AdminDataContext';
import { DataTable, type Column } from '../components/DataTable';
import { PageHeader, StatCard, StatusPill } from '../components/primitives';
import { formatCurrency, formatDateTime } from '../lib/format';
import type { AdminTransaction } from '../lib/types';
import { Button } from '../../components/ui/button';

const TYPES = ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PAYOUT'] as const;

const TYPE_ICON: Record<string, typeof Coins> = {
  DEPOSIT: ArrowDownLeft,
  WITHDRAWAL: ArrowUpRight,
  INVESTMENT: Coins,
  PAYOUT: Wallet,
};

function csvEscape(value: unknown): string {
  const s = String(value ?? '');
  // Quote when the value contains a delimiter, quote or newline; double inner quotes.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Transactions() {
  const { transactions } = useAdminData();
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(
    () =>
      typeFilter === 'all'
        ? transactions.data
        : typeFilter === 'pending'
          ? transactions.data.filter((t) => t.status === 'pending')
          : transactions.data.filter((t) => t.type === typeFilter),
    [transactions.data, typeFilter]
  );

  const totals = useMemo(() => {
    const completed = transactions.data.filter((t) => t.status === 'completed');
    const sum = (type: string) =>
      completed.filter((t) => t.type === type).reduce((acc, t) => acc + (t.amount || 0), 0);
    return {
      deposits: sum('DEPOSIT'),
      withdrawals: sum('WITHDRAWAL'),
      invested: sum('INVESTMENT'),
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

  /** Client-side export of the currently filtered rows. */
  const exportCsv = () => {
    const header = ['Date', 'Name', 'Email', 'Type', 'Amount', 'Status'];
    const lines = filtered.map((t) =>
      [
        new Date(t.createdAt).toISOString(),
        t.user?.name ?? '',
        t.user?.email ?? '',
        t.type,
        t.amount,
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

  const columns: Column<AdminTransaction>[] = [
    {
      key: 'user',
      header: 'Investor',
      sortValue: (t) => (t.user?.name ?? '').toLowerCase(),
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{t.user?.name ?? 'Unknown'}</p>
          <p className="truncate text-xs text-slate-500">{t.user?.email ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortValue: (t) => t.type,
      cell: (t) => {
        const Icon = TYPE_ICON[t.type] ?? Coins;
        return (
          <span className="inline-flex items-center gap-2 text-sm capitalize text-slate-700">
            <Icon className="h-4 w-4 text-slate-400" />
            {t.type.toLowerCase()}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (t) => t.amount,
      className: 'font-semibold text-slate-800',
      cell: (t) => formatCurrency(t.amount),
    },
    {
      key: 'date',
      header: 'Date',
      sortValue: (t) => new Date(t.createdAt).getTime(),
      className: 'text-slate-600',
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
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Deposits"
          value={formatCurrency(totals.deposits)}
          icon={ArrowDownLeft}
          hint="Completed only"
          loading={transactions.loading}
        />
        <StatCard
          label="Withdrawals"
          value={formatCurrency(totals.withdrawals)}
          icon={ArrowUpRight}
          hint="Completed only"
          loading={transactions.loading}
        />
        <StatCard
          label="Invested"
          value={formatCurrency(totals.invested)}
          icon={Coins}
          hint="Completed only"
          loading={transactions.loading}
        />
        <StatCard
          label="Pending"
          value={totals.pending}
          icon={Wallet}
          hint="Awaiting settlement"
          loading={transactions.loading}
        />
      </div>

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
          onChange: setTypeFilter,
          options: [
            { value: 'all', label: 'All', count: counts.all },
            { value: 'pending', label: 'Pending', count: counts.pending },
            ...TYPES.map((t) => ({
              value: t,
              label: t[0]! + t.slice(1).toLowerCase(),
              count: counts[t],
            })),
          ],
        }}
        toolbarAction={
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={exportCsv}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
        emptyTitle="No transactions"
        emptyBody="Money movement will appear here once investors start transacting."
      />
    </>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';
import { getJson, MEMBERSHIP_PREFIX } from '@/lib/api';
import { tierLabel } from '@/lib/membership';
import { formatMoney } from '@/lib/money';
import type { MembershipInvoiceRow } from '../../lib/types';
import { Avatar, EmptyState, Panel, StatusPill } from '../../components/primitives';
import { DataTable, type Column } from '../../components/DataTable';
import { formatDate } from '../../lib/format';

/**
 * Membership revenue, invoice by invoice.
 *
 * Pending rows are the ones that matter operationally: a wire that never lands
 * leaves a member approved but inactive, and this is where that shows up.
 */
export function InvoicesPanel() {
  const [invoices, setInvoices] = useState<MembershipInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getJson<{ success: boolean; invoices: MembershipInvoiceRow[] }>(
      `${MEMBERSHIP_PREFIX}/admin/invoices`
    );
    setLoading(false);
    if (res.ok) setInvoices(res.data.invoices ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid');
    // Grouped by currency: summing USD and KES into one number would be a lie.
    const byCurrency = new Map<string, number>();
    for (const inv of paid) {
      byCurrency.set(inv.currency, (byCurrency.get(inv.currency) ?? 0) + inv.amountMinor);
    }
    return {
      collected: [...byCurrency.entries()],
      pending: invoices.filter((i) => i.status === 'pending').length,
    };
  }, [invoices]);

  const columns: Column<MembershipInvoiceRow>[] = [
    {
      key: 'member',
      header: 'Member',
      sortValue: (i) => (i.user?.name ?? '').toLowerCase(),
      cell: (i) => (
        <div className="flex items-center gap-3">
          <Avatar name={i.user?.name ?? 'Unknown'} seed={i.user?.id ?? i.id} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{i.user?.name ?? 'Unknown'}</p>
            <p className="truncate text-xs text-slate-500">{i.user?.email ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tier',
      header: 'Tier',
      sortValue: (i) => i.tier,
      cell: (i) => <StatusPill status={i.tier} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (i) => i.amountMinor,
      className: 'adm-num text-right font-medium text-slate-800',
      headerClassName: 'text-right',
      cell: (i) => formatMoney(i.amountMinor, i.currency),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (i) => i.status,
      cell: (i) => <StatusPill status={i.status} />,
    },
    {
      key: 'period',
      header: 'Period',
      sortValue: (i) => new Date(i.periodStart).getTime(),
      className: 'text-slate-600 hidden md:table-cell',
      headerClassName: 'hidden md:table-cell',
      cell: (i) => `${formatDate(i.periodStart)} – ${formatDate(i.periodEnd)}`,
    },
    {
      key: 'provider',
      header: 'Via',
      sortValue: (i) => i.payment?.provider ?? '',
      className: 'text-slate-500 hidden lg:table-cell',
      headerClassName: 'hidden lg:table-cell',
      cell: (i) => i.payment?.provider ?? '—',
    },
  ];

  return (
    <Panel
      title="Membership invoices"
      description={
        totals.collected.length > 0
          ? `Collected: ${totals.collected
              .map(([currency, minor]) => formatMoney(minor, currency))
              .join(' · ')}${totals.pending > 0 ? ` · ${totals.pending} awaiting payment` : ''}`
          : 'Every membership charge, settled or in flight.'
      }
      padded={false}
    >
      {!loading && invoices.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="No membership invoices"
            body="Invoices appear here when an approved member starts checkout."
            icon={Receipt}
          />
        </div>
      ) : (
        <div className="p-5 pt-0">
          <DataTable
            rows={invoices}
            columns={columns}
            rowKey={(i) => i.id}
            loading={loading}
            searchable={(i) => `${i.user?.name ?? ''} ${i.user?.email ?? ''} ${i.tier} ${i.status}`}
            searchPlaceholder="Search invoices…"
            emptyTitle="No invoices"
            emptyBody="Nothing matches that search."
          />
        </div>
      )}
    </Panel>
  );
}

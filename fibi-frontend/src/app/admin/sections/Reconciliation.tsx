import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Ban,
  Check,
  CircleHelp,
  FileUp,
  Landmark,
  Scale,
  TriangleAlert,
  Upload,
} from 'lucide-react';
import { getJson, postJson } from '@/lib/api';
import { useAdminData } from '../lib/AdminDataContext';
import { useTableState } from '../lib/useTableState';
import { DataTable, type Column } from '../components/DataTable';
import {
  EmptyState,
  Flash,
  PageHeader,
  Panel,
  StatCard,
  StatusPill,
} from '../components/primitives';
import {
  BANK_ACCOUNTS_API,
  STATEMENTS_API,
  STATEMENT_LINES_API,
  type BankAccountRow,
  type BankAccountsResponse,
  type StatementLineRow,
  type StatementLinesResponse,
  type ReconciliationSummary,
} from '../lib/types';
import { formatCurrency, formatDate } from '../lib/format';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

/**
 * The reconciliation break queue.
 *
 * Money arrives that no API announces — a mistyped reference, a correspondent
 * wire, a branch deposit. This screen is where an operator attributes it, and
 * the unattributed-credit figure is the number that matters most: it is money
 * sitting in the bank that no investor has been credited with.
 */

const EMPTY_SUMMARY: ReconciliationSummary = {
  unmatched: 0,
  matched: 0,
  ignored: 0,
  unattributedCredits: 0,
  unattributedAmountMinor: 0,
};

export default function Reconciliation() {
  const { refreshAudit } = useAdminData();
  const [state, set] = useTableState();

  const [lines, setLines] = useState<StatementLineRow[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary>(EMPTY_SUMMARY);
  const [accounts, setAccounts] = useState<BankAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importAccount, setImportAccount] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [settling, setSettling] = useState<StatementLineRow | null>(null);
  const [ignoring, setIgnoring] = useState<StatementLineRow | null>(null);
  const [ignoreReason, setIgnoreReason] = useState('');

  const statusFilter = state.filter === 'all' ? 'unmatched' : state.filter;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [linesRes, accountsRes] = await Promise.all([
      getJson<StatementLinesResponse>(`${STATEMENT_LINES_API}?status=${statusFilter}`),
      getJson<BankAccountsResponse>(BANK_ACCOUNTS_API),
    ]);
    setLoading(false);

    if (!linesRes.ok) {
      setError(linesRes.error || 'Failed to load statement lines.');
      return;
    }
    setLines(linesRes.data.lines ?? []);
    setSummary(linesRes.data.summary ?? EMPTY_SUMMARY);
    if (accountsRes.ok) setAccounts(accountsRes.data.accounts ?? []);
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const collectionAccounts = useMemo(
    () => accounts.filter((a) => a.purpose === 'COLLECTION'),
    [accounts]
  );

  const handleImport = async () => {
    setImportError('');
    if (!importAccount) {
      setImportError('Choose the account this statement belongs to.');
      return;
    }
    if (!importFile) {
      setImportError('Choose a statement file.');
      return;
    }

    setBusy(true);
    // Base64 rather than multipart: the route takes JSON, and the payload is
    // trivially replayable when debugging a bad import.
    const buffer = await importFile.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const contentBase64 = btoa(binary);

    const res = await postJson<{
      match: { auto: number; review: number; none: number };
      statement: { lineCount: number; format: string };
    }>(STATEMENTS_API, {
      bankAccountId: importAccount,
      filename: importFile.name,
      contentBase64,
    });
    setBusy(false);

    if (!res.ok) {
      setImportError(res.error);
      return;
    }

    const { match, statement } = res.data;
    setFlash({
      type: 'ok',
      text: `Imported ${statement.lineCount} ${statement.format} lines — ${match.auto} matched automatically, ${match.review} need review, ${match.none} unattributed.`,
    });
    setImportOpen(false);
    setImportFile(null);
    if (fileRef.current) fileRef.current.value = '';
    await load();
    void refreshAudit();
  };

  const handleSettle = async () => {
    if (!settling) return;
    setBusy(true);
    const res = await postJson(`${STATEMENT_LINES_API}/${settling.id}/settle`, {});
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      setSettling(null);
      return;
    }
    setFlash({ type: 'ok', text: 'Payment settled and posted to the ledger.' });
    setSettling(null);
    await load();
    void refreshAudit();
  };

  const handleIgnore = async () => {
    if (!ignoring) return;
    if (!ignoreReason.trim()) return;
    setBusy(true);
    const res = await postJson(`${STATEMENT_LINES_API}/${ignoring.id}/ignore`, {
      reason: ignoreReason.trim(),
    });
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      return;
    }
    setFlash({ type: 'ok', text: 'Line marked as ignored.' });
    setIgnoring(null);
    setIgnoreReason('');
    await load();
    void refreshAudit();
  };

  const columns: Column<StatementLineRow>[] = [
    {
      key: 'date',
      header: 'Value date',
      sortValue: (l) => new Date(l.valueDate).getTime(),
      className: 'adm-num text-slate-600',
      cell: (l) => formatDate(l.valueDate),
    },
    {
      key: 'detail',
      header: 'Statement line',
      cell: (l) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">
            {l.reference || l.description || '(no reference)'}
          </p>
          <p className="truncate text-xs text-slate-500">
            {l.counterparty ? `${l.counterparty} · ` : ''}
            {l.statement.bankAccount.bankName}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (l) => l.amountMinor,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (l) => {
        const credit = l.amountMinor > 0;
        return (
          <span
            className={`adm-num inline-flex items-center gap-1 text-sm font-semibold ${
              credit ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {credit ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
            {formatCurrency(Math.abs(l.amountMinor), l.currency)}
          </span>
        );
      },
    },
    {
      key: 'suggestion',
      header: 'Matched to',
      headerClassName: 'hidden lg:table-cell',
      className: 'hidden lg:table-cell',
      cell: (l) =>
        l.suggestedPayment ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {l.suggestedPayment.user?.name ?? 'Unknown investor'}
            </p>
            <p className="adm-num truncate text-xs text-slate-500">
              {formatCurrency(l.suggestedPayment.amountMinor, l.suggestedPayment.currency)} ·{' '}
              {l.suggestedPayment.project?.title ?? '—'}
            </p>
          </div>
        ) : (
          <span className="text-xs text-slate-400">{l.matchNote || 'No candidate'}</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (l) => l.status,
      cell: (l) => <StatusPill status={l.status === 'unmatched' ? 'pending' : l.status === 'matched' ? 'completed' : 'closed'} />,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (l) => {
        if (l.status !== 'unmatched') {
          return <span className="text-xs text-slate-400">{l.matchNote ? '' : '—'}</span>;
        }
        const canSettle = l.amountMinor > 0 && !!l.suggestedPayment;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              disabled={!canSettle}
              title={canSettle ? 'Settle this payment' : 'No candidate payment to settle against'}
              onClick={(e) => {
                e.stopPropagation();
                setSettling(l);
              }}
              className="adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:pointer-events-none disabled:opacity-30"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIgnoring(l);
                setIgnoreReason('');
              }}
              title="Not an investor payment"
              className="adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <Ban className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Reconciliation"
        description="Match incoming bank credits to the payments they belong to."
        actions={
          <Button
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setImportError('');
              setImportOpen(true);
              if (collectionAccounts.length === 1) setImportAccount(collectionAccounts[0].id);
            }}
          >
            <Upload className="h-4 w-4" /> Import statement
          </Button>
        }
      />

      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">{error}</p>
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* The headline number: money in the bank that nobody has been credited
            with. Everything else on this page exists to drive it to zero. */}
        <StatCard
          label="Unattributed credits"
          value={formatCurrency(summary.unattributedAmountMinor)}
          icon={CircleHelp}
          tone={summary.unattributedCredits > 0 ? 'amber' : 'brand'}
          hint={`${summary.unattributedCredits} credit${summary.unattributedCredits === 1 ? '' : 's'} unmatched`}
          loading={loading}
        />
        <StatCard label="Open lines" value={summary.unmatched} icon={Scale} tone="sky" hint="Awaiting a decision" loading={loading} />
        <StatCard label="Matched" value={summary.matched} icon={Check} hint="Settled against a payment" loading={loading} />
        <StatCard label="Ignored" value={summary.ignored} icon={Ban} tone="neutral" hint="Not investor payments" loading={loading} />
      </div>

      {collectionAccounts.length === 0 && !loading && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            No collection accounts configured. Add one under <strong>Banking</strong> before importing a
            statement — a statement has to belong to an account.
          </p>
        </div>
      )}

      {lines.length === 0 && !loading && !error ? (
        <Panel>
          <EmptyState
            title={statusFilter === 'unmatched' ? 'Nothing to reconcile' : 'No lines here'}
            body={
              statusFilter === 'unmatched'
                ? 'Every imported credit has been attributed. Import a statement to check for new payments.'
                : 'Lines will appear here once statements are imported.'
            }
            icon={FileUp}
          />
        </Panel>
      ) : (
        <DataTable
          rows={lines}
          columns={columns}
          rowKey={(l) => l.id}
          loading={loading}
          error={error}
          searchable={(l) =>
            `${l.reference ?? ''} ${l.description ?? ''} ${l.counterparty ?? ''} ${l.suggestedPayment?.user?.name ?? ''}`
          }
          searchPlaceholder="Search reference, payer or description…"
          filters={{
            value: statusFilter,
            onChange: set.setFilter,
            options: [
              { value: 'unmatched', label: 'Open', count: summary.unmatched },
              { value: 'matched', label: 'Matched', count: summary.matched },
              { value: 'ignored', label: 'Ignored', count: summary.ignored },
            ],
          }}
          emptyTitle="No statement lines"
          emptyBody="Import a bank statement to begin reconciling."
        />
      )}

      {/* Import */}
      <Dialog open={importOpen} onOpenChange={(open) => !open && setImportOpen(false)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import bank statement</DialogTitle>
          </DialogHeader>

          {importError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {importError}
            </p>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rec-account">Bank account</Label>
              <Select value={importAccount} onValueChange={setImportAccount}>
                <SelectTrigger id="rec-account" className="h-11 rounded-xl">
                  <SelectValue placeholder="Which account is this statement for?" />
                </SelectTrigger>
                <SelectContent>
                  {collectionAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label} ({a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-file">Statement file</Label>
              <Input
                id="rec-file"
                ref={fileRef}
                type="file"
                accept=".csv,.txt,.sta,.xml"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="h-11 rounded-xl py-2"
              />
              <p className="text-xs text-slate-400">
                CSV, MT940 (.sta) or CAMT.053 (.xml). The format is detected automatically, and
                re-importing the same file is rejected rather than duplicating its credits.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={busy}
              onClick={() => void handleImport()}
            >
              {busy ? 'Importing…' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settle confirmation — this moves money, so it states exactly what will happen. */}
      <Dialog open={!!settling} onOpenChange={(open) => !open && setSettling(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settle this payment?</DialogTitle>
          </DialogHeader>
          {settling?.suggestedPayment && (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-600">
                This credits{' '}
                <span className="font-semibold text-slate-900">
                  {settling.suggestedPayment.user?.name ?? 'the investor'}
                </span>{' '}
                with{' '}
                <span className="adm-num font-semibold text-slate-900">
                  {formatCurrency(settling.amountMinor, settling.currency)}
                </span>
                , activates their investment and posts the movement to the ledger.
              </p>
              <dl className="divide-y divide-slate-100 rounded-xl border border-[var(--adm-line)] text-sm">
                {[
                  ['Reference', settling.reference || '—'],
                  ['Project', settling.suggestedPayment.project?.title ?? '—'],
                  [
                    'Payment total',
                    formatCurrency(settling.suggestedPayment.amountMinor, settling.suggestedPayment.currency),
                  ],
                  ['Value date', formatDate(settling.valueDate)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="text-right font-medium text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
              {settling.matchNote && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {settling.matchNote}
                </p>
              )}
            </div>
          )}
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setSettling(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={busy}
              onClick={() => void handleSettle()}
            >
              {busy ? 'Settling…' : 'Settle payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ignore — requires a reason, because a disregarded credit is exactly what
          a later investigation will ask about. */}
      <Dialog open={!!ignoring} onOpenChange={(open) => !open && setIgnoring(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ignore this line?</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            Use this for lines that are not investor payments — bank charges, interest, internal
            transfers. The line is kept and the reason recorded in the audit log.
          </p>
          <div className="space-y-2">
            <Label htmlFor="rec-reason">Reason</Label>
            <Textarea
              id="rec-reason"
              className="min-h-[72px] rounded-xl"
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              placeholder="e.g. Monthly account maintenance charge"
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setIgnoring(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={busy || !ignoreReason.trim()}
              onClick={() => void handleIgnore()}
            >
              {busy ? 'Saving…' : 'Ignore line'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

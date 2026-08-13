import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Landmark,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { deleteJson, getJson, postJson, putJson } from '@/lib/api';
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
  CUSTODY_ONLY_INSTITUTIONS,
  INSTITUTION_LABEL,
  type BankAccountRow,
  type BankAccountsResponse,
} from '../lib/types';
import { formatDate } from '../lib/format';
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

const INSTITUTIONS = [
  'SBM',
  'ABSA',
  'STANCHART',
  'MORGAN_STANLEY',
  'BANK_OF_SINGAPORE',
  'OTHER',
] as const;

type FormState = {
  label: string;
  institution: string;
  purpose: 'COLLECTION' | 'CUSTODY';
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  branch: string;
  currency: string;
  instructions: string;
  active: boolean;
};

const emptyForm = (): FormState => ({
  label: '',
  institution: 'SBM',
  purpose: 'COLLECTION',
  bankName: '',
  accountName: '',
  accountNumber: '',
  swiftCode: '',
  branch: '',
  currency: 'USD',
  instructions: '',
  active: true,
});

const formFrom = (a: BankAccountRow): FormState => ({
  label: a.label,
  institution: a.institution,
  purpose: a.purpose,
  bankName: a.bankName,
  accountName: a.accountName,
  accountNumber: a.accountNumber,
  swiftCode: a.swiftCode ?? '',
  branch: a.branch ?? '',
  currency: a.currency,
  instructions: a.instructions ?? '',
  active: a.active,
});

const inputClass = 'h-11 rounded-xl border-slate-200';

const isCustodyOnly = (institution: string) =>
  (CUSTODY_ONLY_INSTITUTIONS as readonly string[]).includes(institution);

export default function Banking() {
  const { refreshAudit } = useAdminData();
  const [state, set] = useTableState();

  const [accounts, setAccounts] = useState<BankAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [editing, setEditing] = useState<{ mode: 'create' } | { mode: 'edit'; account: BankAccountRow } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<BankAccountRow | null>(null);

  const purposeFilter = state.filter;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getJson<BankAccountsResponse>(BANK_ACCOUNTS_API);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Failed to load bank accounts.');
      return;
    }
    setAccounts(res.data.accounts ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => (purposeFilter === 'all' ? accounts : accounts.filter((a) => a.purpose === purposeFilter)),
    [accounts, purposeFilter]
  );

  const stats = useMemo(() => {
    const collection = accounts.filter((a) => a.purpose === 'COLLECTION');
    const activeCollection = collection.filter((a) => a.active);
    return {
      total: accounts.length,
      collection: collection.length,
      custody: accounts.filter((a) => a.purpose === 'CUSTODY').length,
      currencies: new Set(activeCollection.map((a) => a.currency)).size,
    };
  }, [accounts]);

  /**
   * Currencies with no active collection account.
   *
   * An investor paying in one of these cannot be shown wire instructions at
   * all, so surfacing it here is the difference between "bank transfer is off"
   * and "bank transfer silently never appears".
   */
  const currenciesWithoutCollection = useMemo(() => {
    const configured = new Set(
      accounts.filter((a) => a.purpose === 'COLLECTION' && a.active).map((a) => a.currency)
    );
    return [...new Set(accounts.map((a) => a.currency))].filter((c) => !configured.has(c));
  }, [accounts]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm());
    setFormError('');
    setEditing({ mode: 'create' });
  };

  const openEdit = (account: BankAccountRow) => {
    setForm(formFrom(account));
    setFormError('');
    setEditing({ mode: 'edit', account });
  };

  const handleSubmit = async () => {
    if (!editing) return;
    setFormError('');

    for (const [field, label] of [
      ['label', 'Label'],
      ['bankName', 'Bank name'],
      ['accountName', 'Account name'],
      ['accountNumber', 'Account number'],
    ] as const) {
      if (!form[field].trim()) {
        setFormError(`${label} is required.`);
        return;
      }
    }

    // Mirrors the server rule so the operator is told before the round trip.
    if (form.purpose === 'COLLECTION' && isCustodyOnly(form.institution)) {
      setFormError(
        `${INSTITUTION_LABEL[form.institution]} is a custody institution — it holds funds but cannot accept investor payments.`
      );
      return;
    }

    setBusy(true);
    const payload = {
      ...form,
      currency: form.currency.trim().toUpperCase(),
      swiftCode: form.swiftCode.trim() || null,
      branch: form.branch.trim() || null,
      instructions: form.instructions.trim() || null,
    };

    const res =
      editing.mode === 'create'
        ? await postJson<{ account: BankAccountRow }>(BANK_ACCOUNTS_API, payload)
        : await putJson<{ account: BankAccountRow }>(`${BANK_ACCOUNTS_API}/${editing.account.id}`, payload);

    setBusy(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }

    setFlash({
      type: 'ok',
      text: `${payload.label} ${editing.mode === 'create' ? 'added' : 'updated'}.`,
    });
    setEditing(null);
    await load();
    void refreshAudit();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const res = await deleteJson(`${BANK_ACCOUNTS_API}/${pendingDelete.id}`);
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      setPendingDelete(null);
      return;
    }
    setFlash({ type: 'ok', text: `${pendingDelete.label} deleted.` });
    setPendingDelete(null);
    await load();
    void refreshAudit();
  };

  const columns: Column<BankAccountRow>[] = [
    {
      key: 'label',
      header: 'Account',
      sortValue: (a) => a.label.toLowerCase(),
      cell: (a) => (
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              a.purpose === 'COLLECTION'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-violet-50 text-violet-600'
            }`}
          >
            {a.purpose === 'COLLECTION' ? (
              <Wallet className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{a.label}</p>
            <p className="truncate text-xs text-slate-500">
              {INSTITUTION_LABEL[a.institution] ?? a.institution}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      sortValue: (a) => a.purpose,
      cell: (a) => (
        <span
          className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium capitalize ${
            a.purpose === 'COLLECTION'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-violet-50 text-violet-700'
          }`}
        >
          {a.purpose.toLowerCase()}
        </span>
      ),
    },
    {
      key: 'currency',
      header: 'Currency',
      sortValue: (a) => a.currency,
      className: 'adm-num font-medium text-slate-700',
      cell: (a) => a.currency,
    },
    {
      key: 'account',
      header: 'Details',
      headerClassName: 'hidden lg:table-cell',
      className: 'hidden lg:table-cell',
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-700">{a.bankName}</p>
          <p className="adm-num truncate text-xs text-slate-500">
            {a.accountNumber}
            {a.swiftCode ? ` · ${a.swiftCode}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (a) => String(a.active),
      cell: (a) => <StatusPill status={a.active ? 'active' : 'closed'} />,
    },
    {
      key: 'added',
      header: 'Added',
      sortValue: (a) => new Date(a.createdAt).getTime(),
      headerClassName: 'hidden md:table-cell',
      className: 'adm-num hidden md:table-cell text-slate-600',
      cell: (a) => formatDate(a.createdAt),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (a) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(a);
            }}
            aria-label={`Edit ${a.label}`}
            className="adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(a);
            }}
            aria-label={`Delete ${a.label}`}
            className="adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const custodySelected = isCustodyOnly(form.institution);

  return (
    <>
      <PageHeader
        title="Banking"
        description="The accounts behind the platform: where investor money is collected, and where pooled funds are custodied."
        actions={
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add account
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
        <StatCard label="Accounts" value={stats.total} icon={Landmark} hint="Across all institutions" loading={loading} />
        <StatCard label="Collection" value={stats.collection} icon={Wallet} tone="sky" hint="Can receive investor funds" loading={loading} />
        <StatCard label="Custody" value={stats.custody} icon={ShieldCheck} tone="violet" hint="Hold pooled funds only" loading={loading} />
        <StatCard
          label="Currencies live"
          value={stats.currencies}
          icon={Building2}
          tone="amber"
          hint="With an active collection account"
          loading={loading}
        />
      </div>

      {/* Bank transfer silently never appears for a currency with no active
          collection account, so name it rather than leaving it to be discovered. */}
      {!loading && currenciesWithoutCollection.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            No active collection account for{' '}
            <span className="font-semibold">{currenciesWithoutCollection.join(', ')}</span>. Investors
            paying in {currenciesWithoutCollection.length === 1 ? 'that currency' : 'those currencies'}{' '}
            will not be offered bank transfer.
          </p>
        </div>
      )}

      {accounts.length === 0 && !loading && !error ? (
        <Panel>
          <EmptyState
            title="No bank accounts yet"
            body="Add a collection account so investors can pay by bank transfer, and custody accounts to record where pooled funds are held."
            icon={Landmark}
            action={
              <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add account
              </Button>
            }
          />
        </Panel>
      ) : (
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(a) => a.id}
          loading={loading}
          error={error}
          onRowClick={openEdit}
          searchable={(a) => `${a.label} ${a.bankName} ${a.accountName} ${a.accountNumber} ${a.currency} ${a.institution}`}
          searchPlaceholder="Search label, bank or account…"
          filters={{
            value: purposeFilter,
            onChange: set.setFilter,
            options: [
              { value: 'all', label: 'All', count: accounts.length },
              { value: 'COLLECTION', label: 'Collection', count: stats.collection },
              { value: 'CUSTODY', label: 'Custody', count: stats.custody },
            ],
          }}
          emptyTitle="No accounts"
          emptyBody="Bank accounts will appear here once added."
        />
      )}

      {/* Create / edit */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.mode === 'edit' ? 'Edit bank account' : 'Add bank account'}</DialogTitle>
          </DialogHeader>

          {formError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {formError}
            </p>
          )}

          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ba-label">Label</Label>
                <Input
                  id="ba-label"
                  value={form.label}
                  onChange={(e) => setField('label', e.target.value)}
                  placeholder="SBM Kenya — USD collections"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba-currency">Currency</Label>
                <Input
                  id="ba-currency"
                  value={form.currency}
                  onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                  placeholder="USD"
                  maxLength={3}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ba-institution">Institution</Label>
                <Select
                  value={form.institution}
                  onValueChange={(v) => {
                    setField('institution', v);
                    // A custody-only institution cannot collect, so move the
                    // purpose with it rather than letting an invalid pair sit
                    // in the form until submit.
                    if (isCustodyOnly(v)) setField('purpose', 'CUSTODY');
                  }}
                >
                  <SelectTrigger id="ba-institution" className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTIONS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {INSTITUTION_LABEL[i]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba-purpose">Purpose</Label>
                <Select
                  value={form.purpose}
                  onValueChange={(v) => setField('purpose', v as FormState['purpose'])}
                  disabled={custodySelected}
                >
                  <SelectTrigger id="ba-purpose" className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COLLECTION">Collection</SelectItem>
                    <SelectItem value="CUSTODY">Custody</SelectItem>
                  </SelectContent>
                </Select>
                {custodySelected && (
                  <p className="text-xs text-amber-700">
                    {INSTITUTION_LABEL[form.institution]} holds funds but does not accept investor
                    payments, so it can only be a custody account.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ba-bank">Bank name</Label>
                <Input
                  id="ba-bank"
                  value={form.bankName}
                  onChange={(e) => setField('bankName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba-accname">Account name</Label>
                <Input
                  id="ba-accname"
                  value={form.accountName}
                  onChange={(e) => setField('accountName', e.target.value)}
                  placeholder="FIBI Investor Trust Account"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba-accnum">Account number</Label>
                <Input
                  id="ba-accnum"
                  value={form.accountNumber}
                  onChange={(e) => setField('accountNumber', e.target.value)}
                  className={`${inputClass} adm-num`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba-swift">SWIFT / BIC</Label>
                <Input
                  id="ba-swift"
                  value={form.swiftCode}
                  onChange={(e) => setField('swiftCode', e.target.value.toUpperCase())}
                  className={`${inputClass} adm-num`}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ba-branch">Branch</Label>
                <Input
                  id="ba-branch"
                  value={form.branch}
                  onChange={(e) => setField('branch', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ba-instructions">Transfer instructions</Label>
              <Textarea
                id="ba-instructions"
                className="min-h-[80px] rounded-xl"
                value={form.instructions}
                onChange={(e) => setField('instructions', e.target.value)}
                placeholder="Shown to the investor alongside their payment reference. Leave blank for the default."
              />
            </div>

            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[var(--adm-line)] p-4">
              <span>
                <span className="block text-sm font-medium text-slate-700">Active</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Only one collection account per currency can be active at a time.
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                aria-label="Active"
                onClick={() => setField('active', !form.active)}
                className={`adm-focus relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.active ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform ${
                    form.active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={busy}
              onClick={() => void handleSubmit()}
            >
              {busy ? 'Saving…' : editing?.mode === 'edit' ? 'Save changes' : 'Add account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{pendingDelete?.label}”?</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            {pendingDelete?.purpose === 'COLLECTION'
              ? 'Investors will no longer be offered bank transfer in this currency. Payments already awaiting funds keep their reference, but reconciling them will need this account restored.'
              : 'This removes the custody record. Holdings reported against it will lose their linked account.'}
          </p>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={busy}
              onClick={() => void handleDelete()}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

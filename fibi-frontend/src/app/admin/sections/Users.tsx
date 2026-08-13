import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Activity,
  CalendarDays,
  Check,
  Copy,
  Download,
  Mail,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserPlus,
  Users as UsersIcon,
  Wallet,
  X,
} from 'lucide-react';
import { deleteJson } from '@/lib/api';
import { USERS_PREFIX, type UserListEntry } from '@/lib/users';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../lib/AdminDataContext';
import { useTableState } from '../lib/useTableState';
import { DataTable, type Column } from '../components/DataTable';
import {
  Avatar,
  EmptyState,
  Flash,
  KeyValue,
  PageHeader,
  StatCard,
  StatusPill,
} from '../components/primitives';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { formatCurrency, formatDate, formatDateTime, formatRelative } from '../lib/format';
import { countPerMonth, trendDelta } from '../lib/analytics';

const DAY_MS = 86_400_000;

function csvEscape(value: unknown): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const { users, transactions, investments, setUsers, refreshAudit } = useAdminData();

  const [state, set] = useTableState();
  const [params, setParams] = useSearchParams();

  const [selected, setSelected] = useState<UserListEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserListEntry[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const roleFilter = state.filter;

  // The command palette links here as /admin/users?focus=<id>. Opening the
  // drawer from the URL is what makes those results actually go somewhere.
  const focusId = params.get('focus');
  useEffect(() => {
    if (!focusId) return;
    const match = users.data.find((u) => u.id === focusId);
    if (match) setSelected(match);
  }, [focusId, users.data]);

  const closeDrawer = () => {
    setSelected(null);
    if (params.has('focus')) {
      const next = new URLSearchParams(params);
      next.delete('focus');
      setParams(next, { replace: true });
    }
  };

  const filtered = useMemo(
    () => (roleFilter === 'all' ? users.data : users.data.filter((u) => u.role === roleFilter)),
    [users.data, roleFilter]
  );

  const counts = useMemo(
    () => ({
      all: users.data.length,
      investor: users.data.filter((u) => u.role === 'investor').length,
      admin: users.data.filter((u) => u.role === 'admin').length,
    }),
    [users.data]
  );

  const signups = useMemo(
    () => countPerMonth(users.data, (u) => u.createdAt, 6),
    [users.data]
  );

  const newThisMonth = signups[signups.length - 1]?.value ?? 0;

  /** Accounts that signed in within the last seven days. */
  const activeThisWeek = useMemo(() => {
    const cutoff = Date.now() - 7 * DAY_MS;
    return users.data.filter((u) => {
      if (!u.lastLoginAt) return false;
      const t = new Date(u.lastLoginAt).getTime();
      return Number.isFinite(t) && t >= cutoff;
    }).length;
  }, [users.data]);

  /** Money footprint for the selected account, from data already loaded. */
  const selectedActivity = useMemo(() => {
    if (!selected) return null;
    const userTx = transactions.data.filter((t) => t.userId === selected.id);
    const userInv = investments.data.filter((i) => i.userId === selected.id);
    return {
      transactions: userTx,
      investments: userInv,
      invested: userInv.reduce((sum, i) => sum + (i.amountInvestedMinor || 0), 0),
    };
  }, [selected, transactions.data, investments.data]);

  /**
   * Deletes run one request per account against the existing
   * `DELETE /users/:id`. `allSettled` rather than `all`: one failure (a
   * protected account, a lost connection) must not abandon the rest, and the
   * summary has to report both halves honestly.
   */
  const handleDelete = async () => {
    if (pendingDelete.length === 0) return;
    setDeleting(true);

    const results = await Promise.allSettled(
      pendingDelete.map((u) => deleteJson<{ message?: string }>(`${USERS_PREFIX}/${u.id}`))
    );

    const removed: string[] = [];
    let failures = 0;
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value.ok) removed.push(pendingDelete[i]!.id);
      else failures += 1;
    });

    setDeleting(false);

    if (removed.length > 0) {
      const removedSet = new Set(removed);
      setUsers((prev) => prev.filter((u) => !removedSet.has(u.id)));
      if (selected && removedSet.has(selected.id)) closeDrawer();
      void refreshAudit();
    }

    setFlash(
      failures === 0
        ? { type: 'ok', text: `${removed.length} account${removed.length === 1 ? '' : 's'} removed.` }
        : {
            type: 'err',
            text:
              removed.length > 0
                ? `Removed ${removed.length}, but ${failures} could not be deleted.`
                : 'None of the selected accounts could be deleted.',
          }
    );
    setPendingDelete([]);
  };

  const exportCsv = (rows: UserListEntry[]) => {
    const header = ['Name', 'Email', 'Role', 'Joined', 'Last login'];
    const lines = rows.map((u) =>
      [u.name, u.email, u.role, u.createdAt, u.lastLoginAt ?? ''].map(csvEscape).join(',')
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fibi-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    // Revoking immediately would race the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyId = (id: string) => {
    void navigator.clipboard?.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const columns: Column<UserListEntry>[] = [
    {
      key: 'name',
      header: 'Account',
      sortValue: (u) => u.name.toLowerCase(),
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} seed={u.id} />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{u.name}</p>
            <p className="truncate text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortValue: (u) => u.role,
      cell: (u) => <StatusPill status={u.role} />,
    },
    {
      key: 'joined',
      header: 'Joined',
      sortValue: (u) => new Date(u.createdAt).getTime(),
      className: 'adm-num text-slate-600',
      headerClassName: 'hidden md:table-cell',
      cell: (u) => <span className="hidden md:inline">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'active',
      header: 'Last active',
      // Never-logged-in sorts to the bottom rather than pretending to be 1970.
      sortValue: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0),
      className: 'text-slate-600',
      cell: (u) =>
        u.lastLoginAt ? (
          <span className="adm-num text-sm">{formatRelative(u.lastLoginAt)}</span>
        ) : (
          <span className="text-sm text-slate-400">Never</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (u) => {
        const isSelf = u.id === currentUser?.id;
        return (
          <button
            type="button"
            disabled={isSelf}
            title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete([u]);
            }}
            className="adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Every account on the platform. Select a row to inspect its full record."
      />

      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total accounts"
          value={counts.all}
          icon={UsersIcon}
          series={signups.map((p) => p.value)}
          delta={trendDelta(signups)}
          hint={`${counts.investor} investors · ${counts.admin} admins`}
          loading={users.loading}
        />
        <StatCard
          label="New this month"
          value={newThisMonth}
          icon={UserPlus}
          tone="sky"
          hint="Accounts created since the 1st"
          loading={users.loading}
        />
        <StatCard
          label="Active this week"
          value={activeThisWeek}
          icon={Activity}
          tone="violet"
          hint="Signed in within 7 days"
          loading={users.loading}
        />
        <StatCard
          label="Administrators"
          value={counts.admin}
          icon={ShieldCheck}
          tone="amber"
          hint="With console access"
          loading={users.loading}
        />
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(u) => u.id}
        loading={users.loading}
        error={users.error}
        onRowClick={setSelected}
        searchable={(u) => `${u.name} ${u.email} ${u.role}`}
        searchPlaceholder="Search name or email…"
        filters={{
          value: roleFilter,
          onChange: set.setFilter,
          options: [
            { value: 'all', label: 'All', count: counts.all },
            { value: 'investor', label: 'Investors', count: counts.investor },
            { value: 'admin', label: 'Admins', count: counts.admin },
          ],
        }}
        toolbarAction={
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        }
        bulkActions={[
          {
            label: 'Export selected',
            icon: <Download className="h-3.5 w-3.5" />,
            onClick: exportCsv,
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-3.5 w-3.5" />,
            tone: 'danger',
            // Your own account cannot be deleted server-side, so it is filtered
            // out of the request rather than being sent and rejected.
            onClick: (rows) => setPendingDelete(rows.filter((u) => u.id !== currentUser?.id)),
          },
        ]}
        emptyTitle="No accounts"
        emptyBody="Registered users will appear here."
      />

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close details"
            onClick={closeDrawer}
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-[var(--adm-e3)]">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={selected.name} seed={selected.id} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{selected.name}</p>
                  <p className="truncate text-sm text-slate-500">{selected.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close"
                className="adm-focus rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="px-6 py-5">
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--adm-line)] bg-slate-50/60 p-4">
                  <p className="text-xs font-medium text-slate-500">Invested</p>
                  <p className="adm-num mt-1 text-lg font-bold text-slate-900">
                    {formatCurrency(selectedActivity?.invested ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--adm-line)] bg-slate-50/60 p-4">
                  <p className="text-xs font-medium text-slate-500">Transactions</p>
                  <p className="adm-num mt-1 text-lg font-bold text-slate-900">
                    {selectedActivity?.transactions.length ?? 0}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="profile">
                <TabsList className="mb-4 grid w-full grid-cols-3 rounded-xl">
                  <TabsTrigger value="profile" className="rounded-lg text-xs">
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="investments" className="rounded-lg text-xs">
                    Investments
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="rounded-lg text-xs">
                    Money
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <dl className="divide-y divide-slate-100">
                    <KeyValue label="Role" icon={ShieldCheck}>
                      <StatusPill status={selected.role} />
                    </KeyValue>
                    <KeyValue label="Joined" icon={CalendarDays}>
                      <span className="adm-num">{formatDateTime(selected.createdAt)}</span>
                    </KeyValue>
                    <KeyValue label="Last sign-in" icon={Activity}>
                      <span className="adm-num">
                        {selected.lastLoginAt ? formatDateTime(selected.lastLoginAt) : 'Never'}
                      </span>
                    </KeyValue>
                    <KeyValue label="Account ID" icon={Mail}>
                      <button
                        type="button"
                        onClick={() => copyId(selected.id)}
                        className="adm-focus inline-flex max-w-[13rem] items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title="Copy account ID"
                      >
                        <span className="truncate">{selected.id}</span>
                        {copied ? (
                          <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 shrink-0" />
                        )}
                      </button>
                    </KeyValue>
                  </dl>
                </TabsContent>

                <TabsContent value="investments">
                  {!selectedActivity || selectedActivity.investments.length === 0 ? (
                    <EmptyState
                      title="No investments"
                      body="This account has not backed any project yet."
                      icon={Wallet}
                    />
                  ) : (
                    <ul className="divide-y divide-slate-100 rounded-xl border border-[var(--adm-line)]">
                      {selectedActivity.investments.slice(0, 8).map((inv) => (
                        <li key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {inv.project?.title ?? 'Unknown project'}
                            </p>
                            <p className="adm-num text-xs text-slate-500">
                              {formatDate(inv.investmentDate)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="adm-num text-sm font-semibold text-slate-800">
                              {formatCurrency(inv.amountInvestedMinor)}
                            </p>
                            <StatusPill status={inv.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>

                <TabsContent value="transactions">
                  {!selectedActivity || selectedActivity.transactions.length === 0 ? (
                    <EmptyState
                      title="No transactions"
                      body="No money has moved on this account."
                      icon={Wallet}
                    />
                  ) : (
                    <ul className="divide-y divide-slate-100 rounded-xl border border-[var(--adm-line)]">
                      {selectedActivity.transactions.slice(0, 8).map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium capitalize text-slate-800">
                              {t.type.toLowerCase()}
                            </p>
                            <p className="adm-num text-xs text-slate-500">{formatDate(t.createdAt)}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="adm-num text-sm font-semibold text-slate-800">
                              {formatCurrency(t.amountMinor)}
                            </p>
                            <StatusPill status={t.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>

              {selected.id !== currentUser?.id && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-rose-900">
                    <TriangleAlert className="h-4 w-4" /> Danger zone
                  </p>
                  <p className="mt-1 text-sm text-rose-700">
                    Deleting removes the account and its investments and transactions.
                  </p>
                  <Button
                    variant="destructive"
                    className="mt-3 rounded-xl"
                    onClick={() => setPendingDelete([selected])}
                  >
                    <Trash2 className="h-4 w-4" /> Delete account
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      <Dialog
        open={pendingDelete.length > 0}
        onOpenChange={(open) => !open && setPendingDelete([])}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingDelete.length === 1
                ? `Delete ${pendingDelete[0]!.name}?`
                : `Delete ${pendingDelete.length} accounts?`}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            This permanently removes{' '}
            {pendingDelete.length === 1 ? 'the account' : 'these accounts'} together with their
            investments and transactions. This cannot be undone.
          </p>
          {pendingDelete.length > 1 && (
            <ul className="max-h-32 overflow-y-auto rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {pendingDelete.map((u) => (
                <li key={u.id} className="truncate py-0.5">
                  {u.name} · {u.email}
                </li>
              ))}
            </ul>
          )}
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setPendingDelete([])}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

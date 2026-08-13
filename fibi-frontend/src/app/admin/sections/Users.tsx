import { useMemo, useState } from 'react';
import { Mail, ShieldCheck, Trash2, TriangleAlert, User as UserIcon, X } from 'lucide-react';
import { deleteJson } from '@/lib/api';
import { USERS_PREFIX, type UserListEntry } from '@/lib/users';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../lib/AdminDataContext';
import { DataTable, type Column } from '../components/DataTable';
import { Flash, PageHeader, StatusPill } from '../components/primitives';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { formatCurrency, formatDate, formatDateTime } from '../lib/format';

export default function Users() {
  const { user: currentUser } = useAuth();
  const { users, transactions, investments, setUsers } = useAdminData();

  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState<UserListEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserListEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

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

  /** Money footprint for the selected account, from data already loaded. */
  const selectedActivity = useMemo(() => {
    if (!selected) return null;
    const userTx = transactions.data.filter((t) => t.userId === selected.id);
    const userInv = investments.data.filter((i) => i.userId === selected.id);
    return {
      transactions: userTx,
      investments: userInv,
      invested: userInv.reduce((sum, i) => sum + (i.amount || 0), 0),
    };
  }, [selected, transactions.data, investments.data]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await deleteJson<{ message?: string }>(`${USERS_PREFIX}/${pendingDelete.id}`);
    setDeleting(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      setPendingDelete(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
    setFlash({ type: 'ok', text: `${pendingDelete.name} was removed.` });
    if (selected?.id === pendingDelete.id) setSelected(null);
    setPendingDelete(null);
  };

  const columns: Column<UserListEntry>[] = [
    {
      key: 'name',
      header: 'Account',
      sortValue: (u) => u.name.toLowerCase(),
      cell: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {u.name.slice(0, 2).toUpperCase()}
          </span>
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
      className: 'text-slate-600',
      cell: (u) => formatDate(u.createdAt),
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
              setPendingDelete(u);
            }}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-30"
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
        description="Every account on the platform. Select a row to see its full record."
      />

      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

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
          onChange: setRoleFilter,
          options: [
            { value: 'all', label: 'All', count: counts.all },
            { value: 'investor', label: 'Investors', count: counts.investor },
            { value: 'admin', label: 'Admins', count: counts.admin },
          ],
        }}
        emptyTitle="No accounts"
        emptyBody="Registered users will appear here."
      />

      {/* Detail drawer — the old table offered no way to inspect an account at all. */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
            <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {selected.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{selected.name}</p>
                  <p className="truncate text-sm text-slate-500">{selected.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="space-y-6 px-6 py-6">
              <dl className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-slate-400" /> Role
                  </dt>
                  <dd><StatusPill status={selected.role} /></dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-sm text-slate-500">
                    <UserIcon className="h-4 w-4 text-slate-400" /> Joined
                  </dt>
                  <dd className="text-sm font-medium text-slate-800">
                    {formatDateTime(selected.createdAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="h-4 w-4 text-slate-400" /> Account ID
                  </dt>
                  <dd className="max-w-[55%] truncate font-mono text-xs text-slate-500">
                    {selected.id}
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500">Invested</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatCurrency(selectedActivity?.invested ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500">Transactions</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {selectedActivity?.transactions.length ?? 0}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Recent transactions</h3>
                {!selectedActivity || selectedActivity.transactions.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                    No transactions for this account.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {selectedActivity.transactions.slice(0, 6).map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium capitalize text-slate-800">
                            {t.type.toLowerCase()}
                          </p>
                          <p className="text-xs text-slate-500">{formatDate(t.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800">
                            {formatCurrency(t.amount)}
                          </p>
                          <StatusPill status={t.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selected.id !== currentUser?.id && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-rose-900">
                    <TriangleAlert className="h-4 w-4" /> Danger zone
                  </p>
                  <p className="mt-1 text-sm text-rose-700">
                    Deleting removes the account and its investments and transactions.
                  </p>
                  <Button
                    variant="destructive"
                    className="mt-3 rounded-xl"
                    onClick={() => setPendingDelete(selected)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete account
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            This permanently removes the account together with its investments and transactions.
            This cannot be undone.
          </p>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

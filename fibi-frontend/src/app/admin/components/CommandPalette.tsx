import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  BadgeCheck,
  ChartColumn,
  CircleUser,
  Download,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../../components/ui/command';
import { useAdminData } from '../lib/AdminDataContext';
import { formatCurrency, formatDate } from '../lib/format';

/**
 * ⌘K navigator.
 *
 * Searches the datasets AdminDataContext has already loaded — it issues no
 * requests of its own, so opening the palette is free and results appear as
 * fast as they can be filtered.
 *
 * Record results are capped per group. cmdk renders every item it is given, and
 * handing it a thousand users would make each keystroke re-render the lot.
 */

const SECTIONS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, keywords: 'dashboard home summary' },
  { to: '/admin/users', label: 'Users', icon: UsersIcon, keywords: 'accounts investors admins people' },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen, keywords: 'land listings funding' },
  { to: '/admin/transactions', label: 'Transactions', icon: ChartColumn, keywords: 'money deposits withdrawals ledger' },
  { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp, keywords: 'charts growth reports' },
  { to: '/admin/memberships', label: 'Memberships', icon: BadgeCheck, keywords: 'tiers applications features' },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon, keywords: 'configuration platform account' },
];

const RESULTS_PER_GROUP = 6;

export function CommandPalette({
  open,
  onOpenChange,
  onRefresh,
  onLogout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const { users, projects, transactions } = useAdminData();

  const run = (fn: () => void) => {
    onOpenChange(false);
    // Defer so the dialog's close animation is not competing with a route
    // change in the same frame.
    setTimeout(fn, 0);
  };

  const topUsers = useMemo(() => users.data.slice(0, 40), [users.data]);
  const topProjects = useMemo(() => projects.data.slice(0, 40), [projects.data]);
  const topTransactions = useMemo(
    () =>
      [...transactions.data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30),
    [transactions.data]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search sections, records and actions"
    >
      <CommandInput placeholder="Search sections, users, projects, transactions…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Go to">
          {SECTIONS.map((s) => (
            <CommandItem
              key={s.to}
              value={`${s.label} ${s.keywords}`}
              onSelect={() => run(() => navigate(s.to))}
            >
              <s.icon className="h-4 w-4 text-slate-400" />
              <span>{s.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {topUsers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Users">
              {topUsers.slice(0, RESULTS_PER_GROUP * 4).map((u) => (
                <CommandItem
                  key={u.id}
                  value={`user ${u.name} ${u.email}`}
                  // The Users section reads ?focus= and opens that record's drawer.
                  onSelect={() => run(() => navigate(`/admin/users?focus=${u.id}`))}
                >
                  <CircleUser className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{u.name}</span>
                  <span className="ml-auto truncate pl-3 text-xs text-slate-400">{u.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {topProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {topProjects.slice(0, RESULTS_PER_GROUP * 4).map((p) => (
                <CommandItem
                  key={p.id}
                  value={`project ${p.title} ${p.location} ${p.category}`}
                  onSelect={() => run(() => navigate(`/admin/projects?focus=${p.id}`))}
                >
                  <FolderOpen className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{p.title}</span>
                  <span className="ml-auto truncate pl-3 text-xs text-slate-400">{p.location}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {topTransactions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent transactions">
              {topTransactions.slice(0, RESULTS_PER_GROUP).map((t) => (
                <CommandItem
                  key={t.id}
                  value={`transaction ${t.user?.name ?? ''} ${t.type} ${t.status}`}
                  onSelect={() => run(() => navigate('/admin/transactions'))}
                >
                  <ChartColumn className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{t.user?.name ?? 'Unknown'}</span>
                  <span className="adm-num ml-auto pl-3 text-xs text-slate-400">
                    {formatCurrency(t.amountMinor)} · {formatDate(t.createdAt)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="new project create add"
            onSelect={() => run(() => navigate('/admin/projects?new=1'))}
          >
            <Plus className="h-4 w-4 text-slate-400" />
            New project
          </CommandItem>
          <CommandItem value="refresh reload sync data" onSelect={() => run(onRefresh)}>
            <RefreshCw className="h-4 w-4 text-slate-400" />
            Refresh all data
          </CommandItem>
          <CommandItem
            value="export transactions csv download"
            onSelect={() => run(() => navigate('/admin/transactions?export=1'))}
          >
            <Download className="h-4 w-4 text-slate-400" />
            Export transactions
          </CommandItem>
          <CommandItem
            value="public site homepage view"
            onSelect={() => run(() => navigate('/'))}
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            View public site
          </CommandItem>
          <CommandItem value="log out sign out" onSelect={() => run(onLogout)}>
            <LogOut className="h-4 w-4 text-slate-400" />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

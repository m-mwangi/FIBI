import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import {
  BadgeCheck,
  ChartColumn,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  FolderOpen,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  TrendingUp,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminDataProvider, useAdminData } from './lib/AdminDataContext';
import { pendingApplications, pendingTransactions } from './lib/queue';
import { formatRelative } from './lib/format';
import { Avatar } from './components/primitives';
import { ActionQueue } from './components/ActionQueue';
import { CommandPalette } from './components/CommandPalette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import logo from '../../assets/fibi_logo.svg';
import './admin.css';

/**
 * Admin shell: a dark navigation rail against a light workspace.
 *
 * The rail is deliberately a different material from the page. On the old
 * all-white chrome nothing separated navigation from content, so the console
 * read as another page of the public site rather than an operator surface.
 */

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  /** Which pending count, if any, this item badges. */
  badge?: 'transactions' | 'applications';
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Monitor',
    items: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'Manage',
    items: [
      { to: '/admin/users', label: 'Users', icon: UsersIcon },
      { to: '/admin/projects', label: 'Projects', icon: FolderOpen },
      { to: '/admin/transactions', label: 'Transactions', icon: ChartColumn, badge: 'transactions' },
      { to: '/admin/memberships', label: 'Memberships', icon: BadgeCheck, badge: 'applications' },
    ],
  },
  {
    label: 'Configure',
    items: [
      { to: '/admin/banking', label: 'Banking', icon: Landmark },
      { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
const COLLAPSE_KEY = 'fibi.admin.railCollapsed';

/* ------------------------------------------------------------------- rail */

function RailContent({
  collapsed,
  badges,
  onNavigate,
}: {
  collapsed: boolean;
  badges: { transactions: number; applications: number };
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className={`flex items-center py-6 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        <Link to="/" onClick={onNavigate} className="adm-focus inline-block" aria-label="FIBI home">
          <img
            src={logo}
            alt="FIBI"
            className={`adm-logo-invert h-auto ${collapsed ? 'w-9' : 'w-24'} transition-[width] duration-200`}
          />
        </Link>
      </div>

      <nav className="adm-rail-scroll flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-3 mb-2 h-px bg-[var(--adm-rail-line)]" />}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const count = item.badge ? badges[item.badge] : 0;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `adm-focus group relative flex items-center rounded-xl text-sm font-medium transition-colors ${
                        collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-white/[0.07] text-[var(--adm-rail-ink-hi)]'
                          : 'text-[var(--adm-rail-ink)] hover:bg-white/[0.04] hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator: a brand bar on the rail edge reads
                            faster than a filled pill at this contrast. */}
                        {isActive && (
                          <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--adm-brand-hi)]" />
                        )}
                        <item.icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            isActive ? 'text-[var(--adm-brand-hi)]' : 'text-slate-500 group-hover:text-slate-400'
                          }`}
                        />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {count > 0 &&
                          (collapsed ? (
                            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                          ) : (
                            <span className="adm-num rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[0.6875rem] font-bold text-amber-300">
                              {count}
                            </span>
                          ))}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--adm-rail-line)] p-3">
        <Link
          to="/"
          onClick={onNavigate}
          title={collapsed ? 'View public site' : undefined}
          className={`adm-focus flex items-center rounded-xl text-sm font-medium text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300 ${
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <ExternalLink className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && 'View public site'}
        </Link>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ chrome */

function AdminChrome() {
  const { user, logout } = useAuth();
  const {
    refreshAll,
    users,
    projects,
    transactions,
    investments,
    applications,
    lastSyncedAt,
  } = useAdminData();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  });

  // A route change must dismiss the drawer, or the overlay stays over the page
  // the user just navigated to.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer covers the screen.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  // ⌘K / Ctrl-K anywhere in the console. Bound on the window rather than a
  // container so it fires with focus inside a table or a dialog trigger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const anyLoading =
    users.loading ||
    projects.loading ||
    transactions.loading ||
    investments.loading ||
    applications.loading;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const handleLogout = useCallback(() => {
    void logout().then(() => navigate('/', { replace: true }));
  }, [logout, navigate]);

  const badges = useMemo(
    () => ({
      transactions: pendingTransactions(transactions.data).length,
      applications: pendingApplications(applications.data).length,
    }),
    [transactions.data, applications.data]
  );

  const current = ALL_NAV.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  );

  const railWidth = collapsed ? 'lg:w-[76px]' : 'lg:w-64';
  const railPad = collapsed ? 'lg:pl-[76px]' : 'lg:pl-64';

  return (
    <div className="adm-shell min-h-screen bg-[var(--adm-canvas)]">
      {/* Desktop rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-[var(--adm-rail)] transition-[width] duration-200 lg:flex ${railWidth}`}
      >
        <RailContent collapsed={collapsed} badges={badges} />
      </aside>

      {/* Mobile drawer. A fixed 256px rail would eat two thirds of a phone
          screen and push the content off-canvas. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--adm-rail)] shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
            <RailContent collapsed={false} badges={badges} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${railPad}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-[var(--adm-line)] bg-white/85 px-4 backdrop-blur-md sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="adm-focus rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="adm-focus hidden rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:block"
          >
            {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          </button>

          {/* Breadcrumb */}
          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <span className="hidden text-slate-400 sm:inline">Admin</span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="truncate font-semibold text-slate-800">{current?.label ?? 'Console'}</span>
            </nav>
          </div>

          {/* Palette trigger. The visible ⌘K affordance is what makes the
              shortcut discoverable at all. */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="adm-focus hidden items-center gap-2 rounded-xl border border-[var(--adm-line)] bg-white px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 md:flex"
          >
            <Search className="h-4 w-4" />
            <span className="pr-6">Search…</span>
            <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold text-slate-500">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="adm-focus rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 md:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          {lastSyncedAt && (
            <span className="hidden whitespace-nowrap text-xs text-slate-400 xl:inline">
              synced {formatRelative(lastSyncedAt.toISOString())}
            </span>
          )}

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing || anyLoading}
            aria-label="Refresh data"
            className="adm-focus rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
          >
            <RefreshCw className={`h-[18px] w-[18px] ${refreshing || anyLoading ? 'animate-spin' : ''}`} />
          </button>

          <ActionQueue />

          <div className="ml-1 border-l border-slate-200 pl-2 sm:pl-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="adm-focus flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-slate-100"
                >
                  <Avatar name={user?.name ?? 'Admin'} seed={user?.id} size="sm" />
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block truncate text-sm font-medium leading-tight text-slate-800">
                      {user?.name}
                    </span>
                    <span className="block truncate text-xs leading-tight text-slate-400">Administrator</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-medium text-slate-800">{user?.name}</span>
                  <span className="block truncate text-xs text-slate-400">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/admin/settings')}>
                  <SettingsIcon className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/')}>
                  <ExternalLink className="h-4 w-4" /> View public site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Keyed on the path so each section fades in on navigation rather than
            the new page appearing mid-scroll of the old one. */}
        <main className="adm-fade-in p-4 sm:p-6 lg:p-8" key={location.pathname}>
          <Outlet />
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onRefresh={() => void handleRefresh()}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default function AdminLayout() {
  const { user, authReady } = useAuth();

  // ProtectedRoute already gates this, but the guard is repeated here so the
  // portal is safe if it is ever mounted from another route.
  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <AdminDataProvider>
      <AdminChrome />
    </AdminDataProvider>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import {
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMembership } from '../../context/MembershipContext';
import { AccountMenu, MemberAvatar } from './AccountMenu';
import { memberStatus, STATUS_TONE_ON_DARK, STATUS_TONE_ON_LIGHT } from './member-status';
import { Wordmark } from '../Wordmark';
import './portal.css';

/**
 * The signed-in investor's chrome.
 *
 * The portal used to borrow the marketing navigation — a transparent bar built
 * to float over a hero image — and the portfolio page then grew a second,
 * different header of its own. A member therefore met three navigations across
 * four pages, none of which said which surface they were on.
 *
 * This is one bar for every member surface: a solid forest header that is a
 * different material from both the marketing site and the admin console, and
 * that carries the two things only a signed-in member needs — where they are,
 * and where their membership stands.
 */

type PortalNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Match this path exactly rather than by prefix. */
  end?: boolean;
};

const DESKTOP_LINK =
  'inv-focus flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors';


export function InvestorShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const { membership, stage } = useMembership();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const status = memberStatus(membership, stage);
  const isMember = stage === 'active' || stage === 'ending';

  // Members manage an existing membership; everyone else is still choosing one,
  // and the plans page is the only page that can help them.
  const nav: PortalNavItem[] = [
    { to: '/dashboard', label: 'Portfolio', icon: LayoutDashboard, end: true },
    { to: '/projects', label: 'Opportunities', icon: FolderOpen, end: true },
    ...(isMember ? [{ to: '/member-hub', label: 'Member hub', icon: Sparkles, end: true }] : []),
    isMember
      ? { to: '/membership/billing', label: 'Membership', icon: CreditCard }
      : { to: '/membership', label: 'Membership', icon: BadgeCheck, end: true },
  ];

  // A route change with the drawer left open strands the overlay over the new
  // page on browser back/forward.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Without this the page scrolls under the open drawer on touch.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="inv-shell flex min-h-screen flex-col bg-[var(--inv-canvas)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-emerald-800 focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Fixed, not sticky: every member page was written to sit under a fixed
          64px bar, and switching to in-flow would re-open the top spacing on
          all of them. */}
      <header
        role="banner"
        className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--inv-bar-line)] bg-gradient-to-r from-[var(--inv-bar)] via-[var(--inv-bar)] to-[var(--inv-bar-2)] shadow-lg shadow-emerald-950/20"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="inv-focus -ml-1 rounded-xl p-2 text-[var(--inv-bar-ink)] transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/dashboard" className="inv-focus flex shrink-0 items-center gap-3" aria-label="FIBI portal">
            <Wordmark size="md" tone="light" />
            <span className="hidden items-center gap-3 xl:flex">
              <span className="h-6 w-px bg-white/15" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--inv-bar-ink)]">
                Investor portal
              </span>
            </span>
          </Link>

          <nav aria-label="Portal" className="ml-4 hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${DESKTOP_LINK} ${
                    isActive
                      ? 'bg-white/12 text-[var(--inv-bar-ink-hi)] shadow-inner shadow-white/5'
                      : 'text-[var(--inv-bar-ink)] hover:bg-white/8 hover:text-[var(--inv-bar-ink-hi)]'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Standing, with its next step attached. A member who owes a
                payment should not have to go looking for where to make it. */}
            <div
              className={`hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset md:flex ${
                STATUS_TONE_ON_DARK[status.tone]
              }`}
            >
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
              <span>{status.label}</span>
              {/* Held back to xl: at lg the nav pills and this line together
                  overflow a 1024px bar. */}
              <span className="inv-num hidden font-normal opacity-70 xl:inline">· {status.detail}</span>
              {status.action && (
                <Link
                  to={status.action.to}
                  className="inv-focus ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-white transition-colors hover:bg-white/25"
                >
                  {status.action.label}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <AccountMenu tone="onDark" />
          </div>
        </div>
      </header>

      {/* Mobile drawer. Hand-rolled rather than the Sheet primitive so the
          member's standing and the sign-out live in it without fighting the
          dialog's own padding. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="fx-fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <aside className="fx-drawer-left absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <Wordmark size="sm" />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="inv-focus rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <MemberAvatar name={user.name} seed={user.id} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}

            <nav aria-label="Portal" className="flex-1 space-y-1 overflow-y-auto p-3">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}

              <div className="!mt-4 rounded-xl border border-slate-200 p-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    STATUS_TONE_ON_LIGHT[status.tone]
                  }`}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                <p className="inv-num mt-2 text-xs text-slate-500">{status.detail}</p>
                {status.action && (
                  <Link
                    to={status.action.to}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    {status.action.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </nav>

            <div className="border-t border-slate-100 p-3">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <ArrowUpRight className="h-4 w-4" /> Public site
              </Link>
              <LogoutRow />
            </div>
          </aside>
        </div>
      )}

      {/* Keyed on the path so each surface fades in on navigation rather than
          the next page appearing mid-scroll of the last one. */}
      <main id="main-content" className="fx-page flex-1" key={location.pathname}>
        {children}
      </main>

      {/* A member is mid-task, not browsing — the marketing footer's four
          columns of site links belong on the public pages, not here. */}
      <footer className="border-t border-[var(--inv-line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} FIBI · For Investors By Investors</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/projects" className="hover:text-emerald-700">
              Opportunities
            </Link>
            <Link to="/membership" className="hover:text-emerald-700">
              Membership
            </Link>
            <Link to="/" className="hover:text-emerald-700">
              Public site
            </Link>
            <a href="mailto:support@fibi.co.ke" className="hover:text-emerald-700">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Sign-out inside the drawer, kept apart so the drawer stays declarative. */
function LogoutRow() {
  const { logout } = useAuth();
  return (
    <button
      type="button"
      onClick={() => {
        void logout().then(() => {
          window.location.assign('/');
        });
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
    >
      <LogOut className="h-4 w-4" /> Log out
    </button>
  );
}

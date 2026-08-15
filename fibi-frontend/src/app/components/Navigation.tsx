import { Link, useLocation } from 'react-router';
import { BadgeCheck, FolderOpen, Home, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { AccountMenu } from './investor/AccountMenu';
import { Wordmark } from './Wordmark';
import { useEffect, useState } from 'react';

/**
 * Marketing navigation: floats over the hero, and is the chrome for visitors.
 *
 * Signed-in members get the portal shell instead on every product page, so what
 * this bar owes an authenticated visitor is a way back into the portal and a
 * correct account control — not a second copy of the portal's navigation.
 *
 * Below `lg` the links move into a drawer. They used to stay in the bar at
 * every width, which on a phone meant "Membership", "Log In" and the signup
 * call to action were pushed off the right edge — present in the DOM, and
 * unreachable.
 */

const LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/membership', label: 'Membership', icon: BadgeCheck },
];

export function Navigation() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, isAuthenticated, authReady } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Leaving the drawer open across a navigation strands the scrim over the new
  // page on browser back/forward.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // A drawer over a scrollable body lets the page slide underneath it on touch.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // The bar is dark-on-light only in one state: scrolled down the home page,
  // where it has picked up its white backdrop. Everywhere else it is sitting on
  // imagery and must be light-on-dark.
  const onLightBar = isHomePage && scrolled;
  const linkClass = `text-base transition-colors ${
    onLightBar ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/20'
  }`;
  const portalPath = user?.role === 'admin' ? '/admin' : '/dashboard';
  const portalLabel = user?.role === 'admin' ? 'Admin' : 'Portfolio';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          !isHomePage && scrolled
            ? 'opacity-0 pointer-events-none'
            : isHomePage && scrolled
            ? 'bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 h-16">
            <Link to="/" className="flex items-center" aria-label="FIBI home">
              <Wordmark size="md" tone={onLightBar ? 'dark' : 'light'} className="transition-all" />
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <Button variant="ghost" className={linkClass}>
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}

              {authReady && isAuthenticated && user && (
                <Link to={portalPath}>
                  <Button variant="ghost" className={linkClass}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {portalLabel}
                  </Button>
                </Link>
              )}
            </div>

            {/* Right side: account or the signup path. The account control is
                shown at every width — it is how a signed-in visitor gets back
                to their portfolio — while the two-button visitor pair collapses
                into the drawer. */}
            <div className="flex items-center gap-2">
              {!authReady ? (
                // Reserve the width so the bar does not reflow when auth resolves.
                <div className="h-10 w-10 lg:w-40" aria-hidden />
              ) : isAuthenticated ? (
                <AccountMenu tone={onLightBar ? 'onLight' : 'onDark'} />
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block">
                    <Button variant="ghost" className={linkClass}>
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" className="hidden sm:block">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Join Investment
                    </Button>
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className={`rounded-xl p-2 transition-colors lg:hidden ${
                  onLightBar
                    ? 'text-slate-800 hover:bg-black/10'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fx-fade-in absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <aside className="fx-drawer-right absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <Wordmark size="sm" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Site" className="flex-1 space-y-1 overflow-y-auto p-3">
              {LINKS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}

              {authReady && isAuthenticated && user && (
                <Link
                  to={portalPath}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {portalLabel}
                </Link>
              )}
            </nav>

            {authReady && !isAuthenticated && (
              <div className="shrink-0 space-y-2 border-t border-slate-100 p-4">
                <Link to="/signup" className="block">
                  <Button className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                    Join Investment
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="outline" className="h-11 w-full rounded-xl border-slate-200">
                    Log In
                  </Button>
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

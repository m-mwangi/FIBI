import { Outlet, useLocation } from 'react-router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { InvestorShell } from './components/investor/InvestorShell';
import { useAuth } from './context/AuthContext';
import { NoIndexSeo } from './seo/Seo';

/**
 * Chooses the chrome for a page: marketing navigation, or the investor portal
 * shell.
 *
 * The split is by *audience*, not by route. A signed-in member on the projects
 * list is inside the product and gets the portal bar; a visitor on the same
 * page is being sold to and gets the marketing nav.
 */

/** Member surfaces. Everything else keeps the marketing chrome. */
const PORTAL_PATHS = new Set([
  '/dashboard',
  '/member-hub',
  '/membership',
  '/membership/apply',
  '/membership/billing',
  '/projects',
]);

export default function Root() {
  const location = useLocation();
  const { user, isAuthenticated, authReady } = useAuth();

  // Auth pages carry their own full-height split-screen chrome, so both the site
  // nav and the footer are suppressed on all of them.
  const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  const showPortal =
    authReady &&
    isAuthenticated &&
    user?.role === 'investor' &&
    PORTAL_PATHS.has(location.pathname);

  if (showPortal) {
    return (
      <InvestorShell>
        <Outlet />
      </InvestorShell>
    );
  }

  const hideNavigation =
    isAuthPage ||
    (location.pathname.startsWith('/projects/') &&
      location.pathname !== '/projects') ||
    location.pathname.startsWith('/admin') ||
    // Only reachable by an admin — an investor here is inside the portal above.
    location.pathname === '/dashboard';

  // The admin console is an operator surface with its own full-height chrome —
  // the marketing footer was rendering underneath every section of it.
  const hideFooter = isAuthPage || location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/*
        Sign-in and password-recovery screens are marked `noindex` here rather
        than in each of the four pages, for the same reason ProtectedRoute owns
        it for authenticated routes: a new auth screen should inherit the rule
        instead of having to remember it. Declared before `<Outlet />` so any
        page-level `<Seo>` still takes precedence.
      */}
      {isAuthPage && <NoIndexSeo title="Sign in" path={location.pathname} />}
      {!hideNavigation && <Navigation />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

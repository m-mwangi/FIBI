import { Outlet, useLocation } from 'react-router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';

export default function Root() {
  const location = useLocation();

  // Auth pages carry their own full-height split-screen chrome, so both the site
  // nav and the footer are suppressed on all of them.
  const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  const hideNavigation =
    isAuthPage ||
    (location.pathname.startsWith('/projects/') &&
      location.pathname !== '/projects') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/dashboard';

  const hideFooter = isAuthPage;

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <Navigation />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
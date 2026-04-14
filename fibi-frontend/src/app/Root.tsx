import { Outlet, useLocation } from 'react-router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';

export default function Root() {
  const location = useLocation();

  const hideNavigation =
    (location.pathname.startsWith('/projects/') &&
      location.pathname !== '/projects') ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/dashboard';

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <Navigation />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
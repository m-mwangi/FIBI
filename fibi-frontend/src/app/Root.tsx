import { Outlet, useLocation } from 'react-router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { useEffect } from 'react';

export default function Root() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideNavigation =
    (location.pathname.startsWith('/projects/') &&
      location.pathname !== '/projects') ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname.startsWith('/admin');

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
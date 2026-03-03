import { Outlet, useLocation } from 'react-router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';

export default function Root() {
  const location = useLocation();

  // Hide Navigation on individual Project Detail pages
  const hideNavigation =
    location.pathname.startsWith('/projects/') &&
    location.pathname !== '/projects';

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavigation && <Navigation />}
      <main className="flex-1">{/* Outlet will render page content */}<Outlet /></main>
      <Footer />
    </div>
  );
}
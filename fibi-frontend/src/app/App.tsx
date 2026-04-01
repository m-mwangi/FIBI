import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
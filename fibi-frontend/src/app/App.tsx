import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { MembershipProvider } from './context/MembershipContext';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
      <MembershipProvider>
        <RouterProvider router={router} />
      </MembershipProvider>
    </AuthProvider>
  );
}
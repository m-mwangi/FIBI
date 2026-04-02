import { createBrowserRouter } from 'react-router';
import Root from './Root';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import MembershipLanding from './pages/MembershipLanding';
import MembershipApplication from './pages/MembershipApplication';
import MemberHub from './pages/MemberHub';
import AdminMembership from './pages/AdminMembership';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'projects', Component: Projects },
      { path: 'projects/:id', Component: ProjectDetail },
      { path: 'membership', Component: MembershipLanding },
      {
        path: 'membership/apply',
        element: (
          <ProtectedRoute>
            <MembershipApplication />
          </ProtectedRoute>
        ),
      },
      {
        path: 'member-hub',
        element: (
          <ProtectedRoute requireMembershipTier="basic">
            <MemberHub />
          </ProtectedRoute>
        ),
      },

      // User dashboard route
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['investor']}>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },

      // Admin dashboard route
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/memberships',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminMembership />
          </ProtectedRoute>
        ),
      },

      { path: 'login', Component: Login },
      { path: 'signup', Component: Signup },
      { path: '*', Component: NotFound },
    ],
  },
]);
import { createBrowserRouter } from 'react-router';
import Root from './Root';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import UserDashboard from './pages/UserDashboard';
import AdminLayout from './admin/AdminLayout';
import AdminOverview from './admin/sections/Overview';
import AdminUsers from './admin/sections/Users';
import AdminProjects from './admin/sections/Projects';
import AdminTransactions from './admin/sections/Transactions';
import AdminAnalytics from './admin/sections/Analytics';
import AdminMemberships from './admin/sections/Memberships';
import AdminSettings from './admin/sections/Settings';
import AdminBanking from './admin/sections/Banking';
import AdminReconciliation from './admin/sections/Reconciliation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import MembershipLanding from './pages/MembershipLanding';
import MembershipApplication from './pages/MembershipApplication';
import MemberHub from './pages/MemberHub';

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

      // Admin portal. Each section is its own route so tabs are linkable,
      // survive a refresh, and can be opened directly from a notification.
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: AdminOverview },
          { path: 'users', Component: AdminUsers },
          { path: 'projects', Component: AdminProjects },
          { path: 'transactions', Component: AdminTransactions },
          { path: 'analytics', Component: AdminAnalytics },
          { path: 'memberships', Component: AdminMemberships },
          { path: 'banking', Component: AdminBanking },
          { path: 'reconciliation', Component: AdminReconciliation },
          { path: 'settings', Component: AdminSettings },
        ],
      },

      { path: 'login', Component: Login },
      { path: 'signup', Component: Signup },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'reset-password', Component: ResetPassword },
      { path: '*', Component: NotFound },
    ],
  },
]);
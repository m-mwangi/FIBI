import type { RouteObject } from 'react-router';
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
import MembershipBilling from './pages/MembershipBilling';
import MemberHub from './pages/MemberHub';
import About from './pages/About';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Faq from './pages/Faq';
import RiskDisclosure from './pages/legal/RiskDisclosure';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Insights from './pages/insights/Insights';
import InsightPost from './pages/insights/InsightPost';

/**
 * The route tree, kept separate from the router instance.
 *
 * `createBrowserRouter` reaches for `window.history` the moment it is called,
 * which crashes under node. The build-time prerenderer needs these route
 * objects but must not construct a browser router, so the two live in
 * different modules: this file is import-safe from node, `routes.tsx` is not.
 */
export const routeConfig: RouteObject[] = [
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'projects', Component: Projects },
      { path: 'projects/:id', Component: ProjectDetail },
      { path: 'membership', Component: MembershipLanding },

      // Public content. These carry the site's E-E-A-T weight: on a YMYL
      // investment domain, an unattributed platform with no about, contact or
      // risk page has a hard ceiling on how far it can rank.
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'how-it-works', Component: HowItWorks },
      { path: 'faq', Component: Faq },
      { path: 'insights', Component: Insights },
      { path: 'insights/:slug', Component: InsightPost },
      { path: 'legal/risk-disclosure', Component: RiskDisclosure },
      { path: 'legal/terms', Component: Terms },
      { path: 'legal/privacy', Component: Privacy },

      {
        path: 'membership/apply',
        element: (
          <ProtectedRoute>
            <MembershipApplication />
          </ProtectedRoute>
        ),
      },
      {
        // Auth-only, not tier-gated: an expired or approved-but-unpaid member
        // needs this page precisely because they have no tier yet.
        path: 'membership/billing',
        element: (
          <ProtectedRoute>
            <MembershipBilling />
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
];

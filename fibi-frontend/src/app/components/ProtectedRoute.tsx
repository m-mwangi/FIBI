import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useMembership } from "../context/MembershipContext";
import type { MembershipTier } from "@/lib/membership";
import { NoIndexSeo } from "../seo/Seo";

type Role = "investor" | "admin";

export function ProtectedRoute({
  children,
  allowedRoles,
  requireMembershipTier,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireMembershipTier?: MembershipTier;
}) {
  const { isAuthenticated, user, authReady } = useAuth();
  const { canAccessTier, ready: membershipReady } = useMembership();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading session…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  if (requireMembershipTier) {
    // Membership arrives on a second request, after auth. Deciding before it
    // lands means every member is briefly a non-member — which redirected real
    // members off their own hub on every page load.
    if (!membershipReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500 text-sm">Checking your membership…</p>
        </div>
      );
    }
    if (!canAccessTier(requireMembershipTier)) {
      return <Navigate to="/membership" state={{ from: location }} replace />;
    }
  }

  /**
   * Every authenticated surface is marked `noindex` from one place rather than
   * page by page, so a new protected route cannot be added without it.
   *
   * This is belt-and-braces alongside the `Disallow` rules in robots.txt, and
   * the two do different jobs: robots.txt stops crawling, `noindex` removes a
   * URL that is already indexed. A disallowed URL can never be recrawled, so
   * it can never be told to deindex — which is why both are needed.
   *
   * Rendered before `children` so a page that declares its own `<Seo>` wins.
   */
  return (
    <>
      <NoIndexSeo title="FIBI account" path={location.pathname} />
      {children}
    </>
  );
}

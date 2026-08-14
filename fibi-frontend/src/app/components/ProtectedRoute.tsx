import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useMembership } from "../context/MembershipContext";
import type { MembershipTier } from "@/lib/membership";

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

  return <>{children}</>;
}

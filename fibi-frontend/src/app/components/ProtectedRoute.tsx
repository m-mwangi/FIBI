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
  const { canAccessTier } = useMembership();
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

  if (requireMembershipTier && !canAccessTier(requireMembershipTier)) {
    return <Navigate to="/membership" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

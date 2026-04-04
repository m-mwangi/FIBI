import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getJson,
  postJson,
  MEMBERSHIP_PREFIX,
  type MembershipDto,
} from "@/lib/api";
import {
  defaultMembershipProfile,
  getPlanByTier,
  hasTierAccess,
  isMembershipActive,
  type MembershipFeatureKey,
  type MembershipProfile,
  type MembershipTier,
} from "@/lib/membership";

type MembershipApplicationPayload = {
  motivation: string;
  interests: string;
  communityContribution: string;
};

type MembershipMeResponse = {
  success: boolean;
  membership: MembershipDto;
  latestApplication?: {
    id: string;
    status: string;
    adminFeedback: string | null;
    createdAt: string;
  } | null;
};

type MembershipContextType = {
  membership: MembershipProfile;
  latestApplication: MembershipMeResponse["latestApplication"];
  loading: boolean;
  error: string | null;
  refreshMembership: () => Promise<void>;
  canAccessTier: (requiredTier: MembershipTier) => boolean;
  canAccessFeature: (feature: MembershipFeatureKey) => boolean;
  applyForMembership: (payload: MembershipApplicationPayload) => Promise<{ success: boolean; error?: string }>;
};

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

function dtoToProfile(d: MembershipDto | null | undefined): MembershipProfile {
  if (!d) return defaultMembershipProfile();
  return {
    tier: d.tier,
    status: d.status,
    applicationStatus: d.applicationStatus,
    renewalDate: d.renewalDate,
    badgeLabel:
      d.badgeLabel ??
      (d.tier === "free" && d.status === "none" ? "Visitor" : "Member"),
  };
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();
  const [membership, setMembership] = useState<MembershipProfile>(defaultMembershipProfile());
  const [latestApplication, setLatestApplication] =
    useState<MembershipMeResponse["latestApplication"]>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMembership = useCallback(async () => {
    if (!user) {
      setMembership(defaultMembershipProfile());
      setLatestApplication(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await getJson<MembershipMeResponse>(`${MEMBERSHIP_PREFIX}/me`);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setMembership(defaultMembershipProfile());
      return;
    }
    setMembership(dtoToProfile(res.data.membership));
    setLatestApplication(res.data.latestApplication ?? null);
  }, [user]);

  useEffect(() => {
    if (!authReady) return;
    void refreshMembership();
  }, [authReady, user?.id, refreshMembership]);

  const canAccessTier = (requiredTier: MembershipTier) =>
    isMembershipActive(membership) && hasTierAccess(membership.tier, requiredTier);

  const canAccessFeature = (feature: MembershipFeatureKey) => {
    if (!isMembershipActive(membership)) return false;
    const plan = getPlanByTier(membership.tier);
    return plan.features.includes(feature);
  };

  const applyForMembership = async (payload: MembershipApplicationPayload) => {
    if (!user) return { success: false, error: "Please log in to apply." };
    if (
      !payload.motivation.trim() ||
      !payload.interests.trim() ||
      !payload.communityContribution.trim()
    ) {
      return { success: false, error: "Please complete all application fields." };
    }
    const res = await postJson<{
      success: boolean;
      membership?: MembershipDto;
      error?: string;
    }>(`${MEMBERSHIP_PREFIX}/apply`, payload);
    if (!res.ok) {
      return { success: false, error: res.error };
    }
    if (res.data.membership) {
      setMembership(dtoToProfile(res.data.membership));
    } else {
      await refreshMembership();
    }
    return { success: true };
  };

  const value = useMemo(
    () => ({
      membership,
      latestApplication,
      loading,
      error,
      refreshMembership,
      canAccessTier,
      canAccessFeature,
      applyForMembership,
    }),
    [membership, latestApplication, loading, error, refreshMembership]
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembership must be used within MembershipProvider");
  }
  return context;
}

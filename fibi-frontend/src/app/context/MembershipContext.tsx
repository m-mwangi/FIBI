import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
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

type MembershipContextType = {
  membership: MembershipProfile;
  canAccessTier: (requiredTier: MembershipTier) => boolean;
  canAccessFeature: (feature: MembershipFeatureKey) => boolean;
  applyForMembership: (payload: MembershipApplicationPayload) => Promise<{ success: boolean; error?: string }>;
  setApplicationStatus: (status: MembershipProfile["applicationStatus"]) => void;
  setMembershipTier: (tier: MembershipTier) => void;
  setMembershipStatus: (status: MembershipProfile["status"]) => void;
};

const STORAGE_PREFIX = "fibi_membership";

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}_${userId}`;
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [localState, setLocalState] = useState<Record<string, MembershipProfile>>({});

  const userMembership = useMemo(() => {
    if (!user) return defaultMembershipProfile();

    if (localState[user.id]) return localState[user.id];

    const raw = localStorage.getItem(storageKey(user.id));
    if (raw) {
      try {
        return JSON.parse(raw) as MembershipProfile;
      } catch {
        return defaultMembershipProfile();
      }
    }

    // Keep existing investor flows intact by bootstrapping authenticated investors.
    if (user.role === "investor") {
      return {
        tier: "basic",
        status: "active",
        applicationStatus: "approved",
        renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        badgeLabel: "Member",
      };
    }

    return defaultMembershipProfile();
  }, [localState, user]);

  const persist = (profile: MembershipProfile) => {
    if (!user) return;
    setLocalState((prev) => ({ ...prev, [user.id]: profile }));
    localStorage.setItem(storageKey(user.id), JSON.stringify(profile));
  };

  const canAccessTier = (requiredTier: MembershipTier) =>
    isMembershipActive(userMembership) && hasTierAccess(userMembership.tier, requiredTier);

  const canAccessFeature = (feature: MembershipFeatureKey) => {
    if (!isMembershipActive(userMembership)) return false;
    const plan = getPlanByTier(userMembership.tier);
    return plan.features.includes(feature);
  };

  const applyForMembership = async (payload: MembershipApplicationPayload) => {
    if (!user) return { success: false, error: "Please log in to apply." };
    if (!payload.motivation.trim() || !payload.interests.trim() || !payload.communityContribution.trim()) {
      return { success: false, error: "Please complete all application fields." };
    }

    persist({
      ...userMembership,
      applicationStatus: "pending",
      badgeLabel: "Applicant",
    });
    return { success: true };
  };

  const setApplicationStatus = (status: MembershipProfile["applicationStatus"]) => {
    const updated: MembershipProfile = {
      ...userMembership,
      applicationStatus: status,
      badgeLabel:
        status === "approved"
          ? "Member"
          : status === "pending"
            ? "Applicant"
            : userMembership.badgeLabel,
    };
    persist(updated);
  };

  const setMembershipTier = (tier: MembershipTier) => {
    const updated: MembershipProfile = {
      ...userMembership,
      tier,
      status: tier === "free" ? "none" : "active",
      applicationStatus: tier === "free" ? userMembership.applicationStatus : "approved",
      renewalDate:
        tier === "free" ? null : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      badgeLabel: tier === "free" ? "Visitor" : "Member",
    };
    persist(updated);
  };

  const setMembershipStatus = (status: MembershipProfile["status"]) => {
    persist({
      ...userMembership,
      status,
      badgeLabel: status === "active" ? "Member" : userMembership.badgeLabel,
    });
  };

  return (
    <MembershipContext.Provider
      value={{
        membership: userMembership,
        canAccessTier,
        canAccessFeature,
        applyForMembership,
        setApplicationStatus,
        setMembershipTier,
        setMembershipStatus,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembership must be used within MembershipProvider");
  }
  return context;
}

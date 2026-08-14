/**
 * Membership types and tier arithmetic.
 *
 * Plans and feature gates deliberately do NOT live here any more. They are
 * rows the admin console edits, and the client reads them from
 * `/api/v1/membership/plans` and `/api/v1/membership/features`. The hardcoded
 * copies this file used to hold meant an admin could change a price or move a
 * feature gate and nothing on the site would move with it.
 */

export type MembershipTier = "free" | "basic" | "premium" | "investor_plus";
export type MembershipStatus = "none" | "active" | "expired" | "canceled";
export type ApplicationStatus = "none" | "pending" | "approved" | "rejected";
export type InvoiceStatus = "pending" | "paid" | "failed" | "canceled";

/** Feature keys the platform ships with. The gate map is authoritative. */
export type MembershipFeatureKey =
  | "exclusive_content"
  | "member_events"
  | "community_groups"
  | "premium_services"
  | "investment_opportunities"
  | "founder_qa"
  | "priority_booking";

export type MembershipPlan = {
  id: string;
  tier: MembershipTier;
  name: string;
  /** Integer MINOR units (cents). See lib/money.ts. */
  monthlyPriceMinor: number;
  currency: string;
  description: string;
  features: MembershipFeatureKey[];
  active: boolean;
  sortOrder: number;
};

export type FeatureGate = { featureKey: string; minTier: MembershipTier };

export type MembershipProfile = {
  tier: MembershipTier;
  status: MembershipStatus;
  applicationStatus: ApplicationStatus;
  renewalDate: string | null;
  badgeLabel: string;
  startedAt: string | null;
  canceledAt: string | null;
  pendingTier: MembershipTier | null;
  daysRemaining: number | null;
};

export type MembershipApplicationSummary = {
  id: string;
  status: ApplicationStatus;
  adminFeedback: string | null;
  reviewedAt?: string | null;
  createdAt: string;
};

export type MembershipInvoice = {
  id: string;
  tier: MembershipTier;
  amountMinor: number;
  currency: string;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string;
  payment: { id: string; provider: string; status: string } | null;
};

export type MemberEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  minTier: MembershipTier;
  capacity: number | null;
  seatsLeft: number | null;
  active: boolean;
  /** True when the viewer's tier cannot attend; detail fields are withheld. */
  locked: boolean;
  registered: boolean;
  registrationId: string | null;
  description?: string | null;
  location?: string | null;
  imageUrl?: string | null;
};

export const MEMBERSHIP_TIER_ORDER: MembershipTier[] = [
  "free",
  "basic",
  "premium",
  "investor_plus",
];

export const TIER_LABELS: Record<MembershipTier, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  investor_plus: "Investor+",
};

export function tierLabel(tier: string): string {
  return TIER_LABELS[tier as MembershipTier] ?? tier.replace(/_/g, " ");
}

/** Human copy for a feature key, with a readable fallback for new keys. */
export const MEMBERSHIP_FEATURE_LABELS: Record<string, string> = {
  exclusive_content: "Exclusive guides, media and strategy briefs",
  member_events: "Member-only events and workshops",
  community_groups: "Private community groups and networking",
  premium_services: "Premium support and concierge services",
  investment_opportunities: "Early and higher-tier investment opportunities",
  founder_qa: "Direct founder Q&A sessions",
  priority_booking: "Priority event booking and reservations",
};

export function featureLabel(key: string): string {
  return (
    MEMBERSHIP_FEATURE_LABELS[key] ??
    key.replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase())
  );
}

export function membershipTierRank(tier: MembershipTier): number {
  return MEMBERSHIP_TIER_ORDER.indexOf(tier);
}

export function hasTierAccess(current: MembershipTier, required: MembershipTier): boolean {
  return membershipTierRank(current) >= membershipTierRank(required);
}

export function defaultMembershipProfile(): MembershipProfile {
  return {
    tier: "free",
    status: "none",
    applicationStatus: "none",
    renewalDate: null,
    badgeLabel: "Visitor",
    startedAt: null,
    canceledAt: null,
    pendingTier: null,
    daysRemaining: null,
  };
}

export function isMembershipActive(profile: MembershipProfile): boolean {
  return profile.status === "active";
}

/**
 * The one-line answer to "where do I stand?", used by every membership surface
 * so the landing page, the hub, and the billing page cannot disagree.
 */
export type MembershipStage =
  | "visitor"       // not applied
  | "pending"       // application under review
  | "rejected"      // application declined
  | "awaiting_payment" // approved, not yet paid
  | "active"        // paid and current
  | "ending"        // active but cancelled; runs to period end
  | "expired"       // period lapsed
  | "canceled";     // cancelled and lapsed

export function membershipStage(profile: MembershipProfile): MembershipStage {
  if (profile.status === "active") return profile.canceledAt ? "ending" : "active";
  if (profile.status === "expired") return "expired";
  if (profile.status === "canceled") return "canceled";
  if (profile.applicationStatus === "approved") return "awaiting_payment";
  if (profile.applicationStatus === "pending") return "pending";
  if (profile.applicationStatus === "rejected") return "rejected";
  return "visitor";
}

export const STAGE_COPY: Record<MembershipStage, { label: string; blurb: string }> = {
  visitor: {
    label: "Not a member",
    blurb: "Apply to join — every application is reviewed by the membership team.",
  },
  pending: {
    label: "Under review",
    blurb: "Your application is with the membership team. We'll email you when there's a decision.",
  },
  rejected: {
    label: "Not accepted",
    blurb: "This application wasn't accepted. You're welcome to apply again.",
  },
  awaiting_payment: {
    label: "Approved — activate",
    blurb: "You're approved. Choose a tier to activate your membership.",
  },
  active: { label: "Active", blurb: "Your membership is active." },
  ending: {
    label: "Ending",
    blurb: "Your membership is set to end. You keep full access until then.",
  },
  expired: { label: "Expired", blurb: "Your membership period ended. Renew to restore access." },
  canceled: { label: "Cancelled", blurb: "Your membership has ended. You can rejoin any time." },
};

export function getPlanByTier(
  plans: MembershipPlan[],
  tier: MembershipTier
): MembershipPlan | undefined {
  return plans.find((plan) => plan.tier === tier);
}

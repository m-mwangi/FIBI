export type MembershipTier = "free" | "basic" | "premium" | "investor_plus";
export type MembershipStatus = "none" | "active" | "expired" | "canceled";
export type ApplicationStatus = "none" | "pending" | "approved" | "rejected";

export type MembershipFeatureKey =
  | "exclusive_content"
  | "member_events"
  | "community_groups"
  | "premium_services"
  | "investment_opportunities"
  | "founder_qa"
  | "priority_booking";

export type MembershipPlan = {
  tier: MembershipTier;
  name: string;
  monthlyPrice: number;
  description: string;
  highlighted?: boolean;
  features: MembershipFeatureKey[];
};

export type MembershipProfile = {
  tier: MembershipTier;
  status: MembershipStatus;
  applicationStatus: ApplicationStatus;
  renewalDate: string | null;
  badgeLabel: string;
};

export const MEMBERSHIP_TIER_ORDER: MembershipTier[] = [
  "free",
  "basic",
  "premium",
  "investor_plus",
];

export const MEMBERSHIP_FEATURE_LABELS: Record<MembershipFeatureKey, string> = {
  exclusive_content: "Exclusive guides, media and strategy briefs",
  member_events: "Member-only events and workshops",
  community_groups: "Private community groups and networking",
  premium_services: "Premium support and concierge services",
  investment_opportunities: "Early and higher-tier investment opportunities",
  founder_qa: "Direct founder Q&A sessions",
  priority_booking: "Priority event booking and reservations",
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    tier: "free",
    name: "Free",
    monthlyPrice: 0,
    description: "Public platform access and project discovery.",
    features: [],
  },
  {
    tier: "basic",
    name: "Basic",
    monthlyPrice: 19,
    description: "Entry to member ecosystem with starter benefits.",
    features: ["exclusive_content", "member_events", "community_groups"],
  },
  {
    tier: "premium",
    name: "Premium",
    monthlyPrice: 59,
    description: "Advanced benefits, premium services, and priority experiences.",
    highlighted: true,
    features: [
      "exclusive_content",
      "member_events",
      "community_groups",
      "premium_services",
      "founder_qa",
      "priority_booking",
    ],
  },
  {
    tier: "investor_plus",
    name: "Investor+",
    monthlyPrice: 149,
    description: "Full elite access including premium deal-flow opportunities.",
    features: [
      "exclusive_content",
      "member_events",
      "community_groups",
      "premium_services",
      "investment_opportunities",
      "founder_qa",
      "priority_booking",
    ],
  },
];

export function getPlanByTier(tier: MembershipTier): MembershipPlan {
  return MEMBERSHIP_PLANS.find((plan) => plan.tier === tier) ?? MEMBERSHIP_PLANS[0];
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
  };
}

export function isMembershipActive(profile: MembershipProfile): boolean {
  return profile.status === "active";
}

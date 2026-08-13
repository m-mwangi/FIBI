const { prisma } = require("../config/db");

const TIER_ORDER = ["free", "basic", "premium", "investor_plus"];

function tierRank(tier) {
  const i = TIER_ORDER.indexOf(tier);
  return i === -1 ? 0 : i;
}

function hasTierAccess(userTier, requiredTier) {
  return tierRank(userTier) >= tierRank(requiredTier);
}

/** True when Prisma Client was regenerated after membership schema was added. */
function hasMembershipPrisma() {
  return (
    typeof prisma?.userMembership?.findUnique === "function" &&
    typeof prisma?.membershipPlan?.findMany === "function" &&
    typeof prisma?.membershipApplication?.create === "function" &&
    typeof prisma?.memberEvent?.findMany === "function"
  );
}

function defaultMembershipDto() {
  return {
    tier: "free",
    status: "none",
    applicationStatus: "none",
    renewalDate: null,
    badgeLabel: "Visitor",
  };
}

/**
 * Membership payload for auth (/me, login) — never throws; survives stale Prisma client.
 */
async function getMembershipForAuth(userId) {
  try {
    if (!hasMembershipPrisma()) {
      console.warn(
        "[fibi] Prisma Client missing UserMembership. Run from BACKEND: npx prisma generate"
      );
      return defaultMembershipDto();
    }
    const row = await getOrCreateUserMembership(userId);
    return safeMembershipDto(row);
  } catch (e) {
    console.warn("[fibi] membership getOrCreate failed:", e.message);
    return defaultMembershipDto();
  }
}

function safeMembershipDto(row) {
  const d = membershipToDto(row);
  return d ?? defaultMembershipDto();
}

/**
 * Ensure a UserMembership row exists (default: free / none / none).
 */
async function getOrCreateUserMembership(userId) {
  if (!hasMembershipPrisma()) {
    throw new Error("PRISMA_MEMBERSHIP_UNAVAILABLE");
  }
  let row = await prisma.userMembership.findUnique({ where: { userId } });
  if (row) return row;
  row = await prisma.userMembership.create({
    data: {
      userId,
      tier: "free",
      status: "none",
      applicationStatus: "none",
      badgeLabel: "Visitor",
    },
  });
  return row;
}

/**
 * Default plans if DB empty (idempotent seed helper).
 */
async function ensureDefaultMembershipPlans() {
  if (typeof prisma?.membershipPlan?.count !== "function") return;
  const count = await prisma.membershipPlan.count();
  if (count > 0) return;

  await prisma.membershipPlan.createMany({
    data: [
      {
        tier: "free",
        name: "Free",
        monthlyPriceMinor: 0n,
        description: "Public platform access and project discovery.",
        features: [],
        sortOrder: 0,
      },
      {
        tier: "basic",
        name: "Basic",
        monthlyPriceMinor: 1900n,
        description: "Entry to member ecosystem with starter benefits.",
        features: ["exclusive_content", "member_events", "community_groups"],
        sortOrder: 1,
      },
      {
        tier: "premium",
        name: "Premium",
        monthlyPriceMinor: 5900n,
        description: "Advanced benefits, premium services, and priority experiences.",
        features: [
          "exclusive_content",
          "member_events",
          "community_groups",
          "premium_services",
          "founder_qa",
          "priority_booking",
        ],
        sortOrder: 2,
      },
      {
        tier: "investor_plus",
        name: "Investor+",
        monthlyPriceMinor: 14900n,
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
        sortOrder: 3,
      },
    ],
  });
}

async function ensureDefaultFeatureAccess() {
  if (typeof prisma?.membershipFeatureAccess?.count !== "function") return;
  const count = await prisma.membershipFeatureAccess.count();
  if (count > 0) return;

  const rows = [
    { featureKey: "exclusive_content", minTier: "basic" },
    { featureKey: "member_events", minTier: "basic" },
    { featureKey: "community_groups", minTier: "basic" },
    { featureKey: "premium_services", minTier: "premium" },
    { featureKey: "founder_qa", minTier: "premium" },
    { featureKey: "priority_booking", minTier: "premium" },
    { featureKey: "investment_opportunities", minTier: "investor_plus" },
  ];
  for (const r of rows) {
    await prisma.membershipFeatureAccess.upsert({
      where: { featureKey: r.featureKey },
      create: r,
      update: { minTier: r.minTier },
    });
  }
}

function membershipToDto(m) {
  if (!m) return null;
  return {
    tier: m.tier,
    status: mapSubscriptionToClientStatus(m.status),
    applicationStatus: m.applicationStatus,
    renewalDate: m.renewalDate ? m.renewalDate.toISOString() : null,
    badgeLabel: m.badgeLabel,
  };
}

/** Frontend uses "none" for subscription when not subscribed; DB uses enum none. */
function mapSubscriptionToClientStatus(s) {
  return s;
}

module.exports = {
  getOrCreateUserMembership,
  getMembershipForAuth,
  hasMembershipPrisma,
  ensureDefaultMembershipPlans,
  ensureDefaultFeatureAccess,
  membershipToDto,
  safeMembershipDto,
  hasTierAccess,
  tierRank,
};

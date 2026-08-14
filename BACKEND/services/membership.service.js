const { prisma } = require("../config/db");

const TIER_ORDER = ["free", "basic", "premium", "investor_plus"];
const SUBSCRIPTION_STATUSES = ["none", "active", "expired", "canceled"];
const APPLICATION_STATUSES = ["none", "pending", "approved", "rejected"];

/** Length of one billed membership period. */
const PERIOD_DAYS = 30;

function isTier(value) {
  return TIER_ORDER.includes(value);
}

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
    typeof prisma?.memberEvent?.findMany === "function" &&
    typeof prisma?.membershipInvoice?.create === "function"
  );
}

function defaultMembershipDto() {
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

//////////////////////////////////////////////////////
// PERIODS AND EXPIRY
//////////////////////////////////////////////////////

/** End of a membership period that starts at `from`. */
function periodEndFrom(from) {
  return new Date(from.getTime() + PERIOD_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * The period a new invoice should buy.
 *
 * Renewing before the current period ends extends from `renewalDate` rather
 * than from today — paying early must never cost the member the days they have
 * already bought.
 */
function nextPeriodFor(membership, now = new Date()) {
  const base =
    membership?.status === "active" && membership.renewalDate && membership.renewalDate > now
      ? membership.renewalDate
      : now;
  return { periodStart: base, periodEnd: periodEndFrom(base) };
}

function daysRemaining(renewalDate, now = new Date()) {
  if (!renewalDate) return null;
  const ms = renewalDate.getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / (24 * 60 * 60 * 1000));
}

/**
 * Move every membership whose paid period has ended out of `active`.
 *
 * A membership the member cancelled lands on `canceled`; one that simply ran
 * out lands on `expired`. Both lose access — the distinction is for the member,
 * who should be told which of the two happened.
 *
 * Runs on a timer from index.js and again lazily whenever a single membership
 * is read, so access is never granted on a period that has already ended even
 * if the timer is not running.
 */
async function expireDueMemberships(now = new Date()) {
  if (!hasMembershipPrisma()) return { expired: 0, canceled: 0 };

  const [canceled, expired] = await Promise.all([
    prisma.userMembership.updateMany({
      where: { status: "active", renewalDate: { lt: now }, canceledAt: { not: null } },
      data: { status: "canceled", pendingTier: null },
    }),
    prisma.userMembership.updateMany({
      where: { status: "active", renewalDate: { lt: now }, canceledAt: null },
      data: { status: "expired", pendingTier: null },
    }),
  ]);

  return { expired: expired.count, canceled: canceled.count };
}

/**
 * Apply expiry to a single row, in the database, and return the current truth.
 *
 * Returning a locally-adjusted object without writing would mean the admin list
 * and the member's own view disagree until the next sweep.
 */
async function applyExpiry(row, now = new Date()) {
  if (!row) return row;
  if (row.status !== "active") return row;
  if (!row.renewalDate || row.renewalDate > now) return row;

  return prisma.userMembership.update({
    where: { userId: row.userId },
    data: { status: row.canceledAt ? "canceled" : "expired", pendingTier: null },
  });
}

//////////////////////////////////////////////////////
// READS
//////////////////////////////////////////////////////

/**
 * Ensure a UserMembership row exists (default: free / none / none), with any
 * elapsed period already applied.
 */
async function getOrCreateUserMembership(userId) {
  if (!hasMembershipPrisma()) {
    throw new Error("PRISMA_MEMBERSHIP_UNAVAILABLE");
  }
  const row = await prisma.userMembership.findUnique({ where: { userId } });
  if (row) return applyExpiry(row);

  return prisma.userMembership.create({
    data: {
      userId,
      tier: "free",
      status: "none",
      applicationStatus: "none",
      badgeLabel: "Visitor",
    },
  });
}

/**
 * Membership payload for auth (/me, login) — never throws; survives stale
 * Prisma client.
 */
async function getMembershipForAuth(userId) {
  try {
    if (!hasMembershipPrisma()) {
      console.warn(
        "[fibi] Prisma Client missing membership models. Run from BACKEND: npx prisma generate"
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

function membershipToDto(m) {
  if (!m) return null;
  return {
    tier: m.tier,
    status: m.status,
    applicationStatus: m.applicationStatus,
    renewalDate: m.renewalDate ? m.renewalDate.toISOString() : null,
    badgeLabel: m.badgeLabel,
    startedAt: m.startedAt ? m.startedAt.toISOString() : null,
    canceledAt: m.canceledAt ? m.canceledAt.toISOString() : null,
    pendingTier: m.pendingTier ?? null,
    daysRemaining: daysRemaining(m.renewalDate),
  };
}

function safeMembershipDto(row) {
  return membershipToDto(row) ?? defaultMembershipDto();
}

function isActive(membership) {
  return Boolean(membership) && membership.status === "active";
}

//////////////////////////////////////////////////////
// FEATURE ACCESS
//////////////////////////////////////////////////////

const DEFAULT_FEATURE_ACCESS = [
  { featureKey: "exclusive_content", minTier: "basic" },
  { featureKey: "member_events", minTier: "basic" },
  { featureKey: "community_groups", minTier: "basic" },
  { featureKey: "premium_services", minTier: "premium" },
  { featureKey: "founder_qa", minTier: "premium" },
  { featureKey: "priority_booking", minTier: "premium" },
  { featureKey: "investment_opportunities", minTier: "investor_plus" },
];

// The gate map is read on nearly every membership request and written only when
// an admin edits it, so it is cached and explicitly invalidated on write.
let featureCache = null;

function invalidateFeatureCache() {
  featureCache = null;
}

async function getFeatureAccessMap() {
  if (featureCache) return featureCache;
  if (typeof prisma?.membershipFeatureAccess?.findMany !== "function") {
    featureCache = new Map(DEFAULT_FEATURE_ACCESS.map((r) => [r.featureKey, r.minTier]));
    return featureCache;
  }
  const rows = await prisma.membershipFeatureAccess.findMany({ orderBy: { featureKey: "asc" } });
  const source = rows.length > 0 ? rows : DEFAULT_FEATURE_ACCESS;
  featureCache = new Map(source.map((r) => [r.featureKey, r.minTier]));
  return featureCache;
}

/**
 * Does this membership unlock `featureKey`?
 *
 * The single source of truth is the MembershipFeatureAccess table the admin
 * console edits — not the feature list stored on a plan, which is marketing
 * copy for the pricing page.
 */
async function canUseFeature(membership, featureKey) {
  if (!isActive(membership)) return false;
  const map = await getFeatureAccessMap();
  const minTier = map.get(featureKey);
  // An unmapped feature is closed, not open: a typo in a feature key must not
  // hand out access.
  if (!minTier) return false;
  return hasTierAccess(membership.tier, minTier);
}

//////////////////////////////////////////////////////
// SEEDS
//////////////////////////////////////////////////////

const DEFAULT_PLANS = [
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
];

/**
 * Default plans if DB empty (idempotent seed helper).
 */
async function ensureDefaultMembershipPlans() {
  if (typeof prisma?.membershipPlan?.count !== "function") return;
  const count = await prisma.membershipPlan.count();
  if (count > 0) return;
  await prisma.membershipPlan.createMany({ data: DEFAULT_PLANS });
}

async function ensureDefaultFeatureAccess() {
  if (typeof prisma?.membershipFeatureAccess?.count !== "function") return;
  const count = await prisma.membershipFeatureAccess.count();
  if (count > 0) return;

  for (const r of DEFAULT_FEATURE_ACCESS) {
    await prisma.membershipFeatureAccess.upsert({
      where: { featureKey: r.featureKey },
      create: r,
      update: { minTier: r.minTier },
    });
  }
  invalidateFeatureCache();
}

/**
 * Seed plans and feature gates once at boot.
 *
 * Previously both seeds ran lazily on first request, which meant a fresh
 * database served an empty pricing page and an empty gate matrix until someone
 * happened to open the right screen.
 */
async function bootstrapMembership() {
  if (!hasMembershipPrisma()) {
    console.warn(
      "[fibi] Membership models missing from Prisma Client — skipping membership bootstrap. Run: npx prisma generate"
    );
    return;
  }
  try {
    await ensureDefaultMembershipPlans();
    await ensureDefaultFeatureAccess();
    const swept = await expireDueMemberships();
    if (swept.expired || swept.canceled) {
      console.log(
        `[fibi] membership sweep: ${swept.expired} expired, ${swept.canceled} canceled at boot`
      );
    }
  } catch (e) {
    console.error("[fibi] membership bootstrap failed:", e.message);
  }
}

/** Plan for a tier, or null when the tier has no active plan. */
async function getPlanForTier(tier) {
  if (!isTier(tier)) return null;
  return prisma.membershipPlan.findUnique({ where: { tier } });
}

function planToDto(p) {
  return {
    id: p.id,
    tier: p.tier,
    name: p.name,
    monthlyPriceMinor: p.monthlyPriceMinor,
    currency: p.currency,
    description: p.description,
    features: Array.isArray(p.features) ? p.features : [],
    active: p.active,
    sortOrder: p.sortOrder,
  };
}

module.exports = {
  TIER_ORDER,
  SUBSCRIPTION_STATUSES,
  APPLICATION_STATUSES,
  PERIOD_DAYS,
  isTier,
  tierRank,
  hasTierAccess,
  hasMembershipPrisma,
  defaultMembershipDto,
  getOrCreateUserMembership,
  getMembershipForAuth,
  membershipToDto,
  safeMembershipDto,
  isActive,
  periodEndFrom,
  nextPeriodFor,
  daysRemaining,
  expireDueMemberships,
  applyExpiry,
  getFeatureAccessMap,
  invalidateFeatureCache,
  canUseFeature,
  ensureDefaultMembershipPlans,
  ensureDefaultFeatureAccess,
  bootstrapMembership,
  getPlanForTier,
  planToDto,
};

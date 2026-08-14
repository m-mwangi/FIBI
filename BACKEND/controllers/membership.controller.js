const { prisma } = require("../config/db");
const config = require("../config/env");
const {
  TIER_ORDER,
  SUBSCRIPTION_STATUSES,
  APPLICATION_STATUSES,
  isTier,
  hasTierAccess,
  getOrCreateUserMembership,
  getMembershipForAuth,
  hasMembershipPrisma,
  ensureDefaultMembershipPlans,
  ensureDefaultFeatureAccess,
  membershipToDto,
  isActive,
  getFeatureAccessMap,
  invalidateFeatureCache,
  planToDto,
  periodEndFrom,
} = require("../services/membership.service");
const {
  BillingError,
  startCheckout,
  cancelMembership,
  resumeMembership,
  listInvoices,
  invoiceToDto,
} = require("../services/membershipBilling.service");
const { recordAudit } = require("../utils/audit");
const { sendMembershipDecisionEmail } = require("../services/mailer.service");

//////////////////////////////////////////////////////
// MEMBER: STATE
//////////////////////////////////////////////////////

/**
 * Everything the member-facing app needs in one call: the membership itself,
 * the gates it unlocks, the latest application, and any payment still in
 * flight.
 *
 * Bundled deliberately — the client used to derive entitlements from a
 * hardcoded plan table, which meant the admin console's feature matrix had no
 * effect on what anyone could actually open.
 */
async function getMyMembership(req, res, next) {
  try {
    if (!hasMembershipPrisma()) {
      const membership = await getMembershipForAuth(req.user.id);
      return res.json({
        success: true,
        membership,
        entitlements: [],
        latestApplication: null,
        openInvoice: null,
      });
    }

    const membership = await getOrCreateUserMembership(req.user.id);
    const [latestApplication, openInvoice, featureMap] = await Promise.all([
      prisma.membershipApplication.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.membershipInvoice.findFirst({
        where: { userId: req.user.id, status: "pending" },
        orderBy: { createdAt: "desc" },
        include: { payment: { select: { id: true, provider: true, status: true } } },
      }),
      getFeatureAccessMap(),
    ]);

    // Resolved server-side from the gate table, so the client renders locks
    // rather than deciding them.
    const entitlements = isActive(membership)
      ? [...featureMap.entries()]
          .filter(([, minTier]) => hasTierAccess(membership.tier, minTier))
          .map(([featureKey]) => featureKey)
      : [];

    res.json({
      success: true,
      membership: membershipToDto(membership),
      entitlements,
      latestApplication: latestApplication
        ? {
            id: latestApplication.id,
            status: latestApplication.status,
            adminFeedback: latestApplication.adminFeedback,
            reviewedAt: latestApplication.reviewedAt
              ? latestApplication.reviewedAt.toISOString()
              : null,
            createdAt: latestApplication.createdAt.toISOString(),
          }
        : null,
      openInvoice: openInvoice ? invoiceToDto(openInvoice) : null,
    });
  } catch (e) {
    next(e);
  }
}

//////////////////////////////////////////////////////
// MEMBER: APPLICATION
//////////////////////////////////////////////////////

const APPLICATION_FIELDS = ["motivation", "interests", "communityContribution"];
const MIN_ANSWER_LENGTH = 20;
const MAX_ANSWER_LENGTH = 2000;

function validateApplicationBody(body) {
  const cleaned = {};
  for (const field of APPLICATION_FIELDS) {
    const value = body?.[field];
    if (typeof value !== "string" || !value.trim()) {
      return { error: `${field} is required` };
    }
    const trimmed = value.trim();
    if (trimmed.length < MIN_ANSWER_LENGTH) {
      return { error: `Please write a little more for "${field}" (at least ${MIN_ANSWER_LENGTH} characters)` };
    }
    if (trimmed.length > MAX_ANSWER_LENGTH) {
      return { error: `"${field}" is too long (max ${MAX_ANSWER_LENGTH} characters)` };
    }
    cleaned[field] = trimmed;
  }
  return { cleaned };
}

async function submitApplication(req, res, next) {
  try {
    const { error, cleaned } = validateApplicationBody(req.body);
    if (error) return res.status(400).json({ success: false, error });

    const membership = await getOrCreateUserMembership(req.user.id);

    if (membership.applicationStatus === "pending") {
      return res.status(409).json({
        success: false,
        error: "You already have an application under review",
      });
    }
    // An approved member reapplying used to reset their badge to "Applicant"
    // and their application status to pending — demoting a paying member for
    // pressing a button labelled "Apply or upgrade". Tier changes go through
    // checkout, not through a second application.
    if (membership.applicationStatus === "approved") {
      return res.status(409).json({
        success: false,
        error: "You are already an approved member. Change your tier from the membership page.",
      });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.membershipApplication.create({
          data: { userId: req.user.id, ...cleaned, status: "pending" },
        });
        await tx.userMembership.update({
          where: { userId: req.user.id },
          data: { applicationStatus: "pending", badgeLabel: "Applicant" },
        });
      });
    } catch (e) {
      // The partial unique index on (userId) WHERE status = 'pending' is what
      // actually stops a double submit; the check above is only a friendlier
      // first line.
      if (e.code === "P2002") {
        return res.status(409).json({
          success: false,
          error: "You already have an application under review",
        });
      }
      throw e;
    }

    const updated = await getOrCreateUserMembership(req.user.id);
    res.status(201).json({
      success: true,
      message: "Application submitted",
      membership: membershipToDto(updated),
    });
  } catch (e) {
    next(e);
  }
}

//////////////////////////////////////////////////////
// MEMBER: BILLING
//////////////////////////////////////////////////////

function billingFailure(res, e) {
  if (e instanceof BillingError) {
    return res.status(e.status).json({ success: false, error: e.message, code: e.code });
  }
  return null;
}

async function startMembershipCheckout(req, res, next) {
  try {
    const { tier, provider } = req.body || {};
    const result = await startCheckout({
      userId: req.user.id,
      tier,
      provider: provider || "STRIPE",
    });
    res.status(201).json({
      success: true,
      invoice: invoiceToDto({ ...result.invoice, payment: result.payment }),
      provider: result.provider,
      status: result.status,
      nextAction: result.nextAction,
      checkoutUrl: result.nextAction?.type === "redirect" ? result.nextAction.url : undefined,
    });
  } catch (e) {
    if (billingFailure(res, e)) return;
    next(e);
  }
}

async function cancelMyMembership(req, res, next) {
  try {
    const updated = await cancelMembership(req.user.id);
    res.json({
      success: true,
      message: "Membership will end when the current period does",
      membership: membershipToDto(updated),
    });
  } catch (e) {
    if (billingFailure(res, e)) return;
    next(e);
  }
}

async function resumeMyMembership(req, res, next) {
  try {
    const updated = await resumeMembership(req.user.id);
    res.json({ success: true, membership: membershipToDto(updated) });
  } catch (e) {
    if (billingFailure(res, e)) return;
    next(e);
  }
}

async function listMyInvoices(req, res, next) {
  try {
    const invoices = await listInvoices(req.user.id);
    res.json({ success: true, invoices: invoices.map(invoiceToDto) });
  } catch (e) {
    next(e);
  }
}

//////////////////////////////////////////////////////
// PUBLIC: PLANS AND GATES
//////////////////////////////////////////////////////

async function listPlans(req, res, next) {
  try {
    await ensureDefaultMembershipPlans();
    const plans = await prisma.membershipPlan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, plans: plans.map(planToDto) });
  } catch (e) {
    next(e);
  }
}

/**
 * The gate map, readable by anyone.
 *
 * It was admin-only, which is why the client could not render "this needs
 * Premium" from real data and fell back to a hardcoded copy that drifted.
 */
async function listFeatureAccess(req, res, next) {
  try {
    await ensureDefaultFeatureAccess();
    const map = await getFeatureAccessMap();
    res.json({
      success: true,
      features: [...map.entries()].map(([featureKey, minTier]) => ({ featureKey, minTier })),
    });
  } catch (e) {
    next(e);
  }
}

async function updateFeatureAccess(req, res, next) {
  try {
    const { features } = req.body || {};
    if (!Array.isArray(features)) {
      return res.status(400).json({ success: false, error: "features must be an array" });
    }
    for (const item of features) {
      if (!item || typeof item.featureKey !== "string" || !isTier(item.minTier)) {
        return res.status(400).json({
          success: false,
          error: "Each feature needs featureKey and a valid minTier",
        });
      }
    }

    // Snapshot first so the audit entry lists only the gates that moved — the
    // console saves the whole matrix on every click.
    const beforeRows = await prisma.membershipFeatureAccess.findMany();
    const beforeByKey = new Map(beforeRows.map((r) => [r.featureKey, r.minTier]));

    await prisma.$transaction(
      features.map((item) =>
        prisma.membershipFeatureAccess.upsert({
          where: { featureKey: item.featureKey },
          create: { featureKey: item.featureKey, minTier: item.minTier },
          update: { minTier: item.minTier },
        })
      )
    );
    invalidateFeatureCache();

    const rows = await prisma.membershipFeatureAccess.findMany({
      orderBy: { featureKey: "asc" },
    });

    const changes = rows
      .filter((r) => beforeByKey.get(r.featureKey) !== r.minTier)
      .map((r) => ({
        featureKey: r.featureKey,
        from: beforeByKey.get(r.featureKey) ?? null,
        to: r.minTier,
      }));

    if (changes.length > 0) {
      recordAudit(req, {
        action: "membership.features.update",
        targetType: "feature",
        targetId: null,
        targetLabel: `${changes.length} feature gate${changes.length === 1 ? "" : "s"}`,
        metadata: { changes },
      });
    }

    res.json({
      success: true,
      features: rows.map((r) => ({ featureKey: r.featureKey, minTier: r.minTier })),
    });
  } catch (e) {
    next(e);
  }
}

//////////////////////////////////////////////////////
// ADMIN: APPLICATIONS AND MEMBERSHIPS
//////////////////////////////////////////////////////

async function adminListApplications(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && APPLICATION_STATUSES.includes(status)) {
      where.status = status;
    }
    const apps = await prisma.membershipApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    res.json({
      success: true,
      applications: apps.map((a) => ({
        id: a.id,
        userId: a.userId,
        user: a.user,
        motivation: a.motivation,
        interests: a.interests,
        communityContribution: a.communityContribution,
        status: a.status,
        adminFeedback: a.adminFeedback,
        reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : null,
        reviewedById: a.reviewedById,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Approve or reject an application.
 *
 * Approval grants entry to the ecosystem; it does not grant a paid tier for
 * free. The member is marked approved and, unless the admin explicitly grants a
 * complimentary tier, activates by paying. That split is what makes the pricing
 * on the plans page mean anything.
 */
async function adminReviewApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { action, tier, adminFeedback, complimentary } = req.body || {};
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, error: "action must be approve or reject" });
    }
    if (tier !== undefined && !isTier(tier)) {
      return res.status(400).json({ success: false, error: "Invalid tier" });
    }

    // The applicant is included so the audit entry can name a person rather
    // than a uuid.
    const app = await prisma.membershipApplication.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!app) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }
    if (app.status !== "pending") {
      return res.status(400).json({ success: false, error: "Application is not pending" });
    }

    const now = new Date();
    const reviewerId = req.user.id;
    const feedback = typeof adminFeedback === "string" && adminFeedback.trim()
      ? adminFeedback.trim()
      : null;

    // The applicant normally has a membership row already (applying creates
    // one), but a review must not 500 if it is missing.
    await getOrCreateUserMembership(app.userId);

    if (action === "reject") {
      await prisma.$transaction([
        prisma.membershipApplication.update({
          where: { id },
          data: {
            status: "rejected",
            adminFeedback: feedback,
            reviewedById: reviewerId,
            reviewedAt: now,
          },
        }),
        prisma.userMembership.update({
          where: { userId: app.userId },
          data: { applicationStatus: "rejected", badgeLabel: "Visitor" },
        }),
      ]);
    } else {
      const grantedTier = isTier(tier) ? tier : "basic";
      // A complimentary approval activates immediately at no charge — for
      // founders, staff, and comped partners. Everyone else is approved and
      // then pays.
      const membershipUpdate = complimentary
        ? {
            tier: grantedTier,
            status: "active",
            applicationStatus: "approved",
            renewalDate: periodEndFrom(now),
            startedAt: now,
            canceledAt: null,
            pendingTier: null,
            badgeLabel: "Member",
          }
        : {
            applicationStatus: "approved",
            badgeLabel: "Approved",
            pendingTier: grantedTier,
          };

      await prisma.$transaction([
        prisma.membershipApplication.update({
          where: { id },
          data: {
            status: "approved",
            adminFeedback: feedback,
            reviewedById: reviewerId,
            reviewedAt: now,
          },
        }),
        prisma.userMembership.update({
          where: { userId: app.userId },
          data: membershipUpdate,
        }),
      ]);
    }

    const membership = await getOrCreateUserMembership(app.userId);

    recordAudit(req, {
      action: `membership.application.${action}`,
      targetType: "membership",
      targetId: app.userId,
      targetLabel: app.user ? app.user.name : null,
      metadata: {
        applicationId: id,
        email: app.user ? app.user.email : undefined,
        tier: membership.tier,
        complimentary: action === "approve" ? Boolean(complimentary) : undefined,
      },
    });

    // Best effort: the decision is already committed, so a mail failure must
    // not fail the request.
    if (app.user?.email) {
      const base = (config.FRONTEND_URL || "").replace(/\/$/, "");
      sendMembershipDecisionEmail({
        to: app.user.email,
        name: app.user.name,
        approved: action === "approve",
        tier: action === "approve" ? (isTier(tier) ? tier : "basic") : null,
        feedback,
        actionUrl: base ? `${base}/membership/billing` : null,
      }).catch((e) => console.error("[fibi] membership decision email failed:", e.message));
    }

    res.json({ success: true, membership: membershipToDto(membership) });
  } catch (e) {
    next(e);
  }
}

async function adminListMemberships(req, res, next) {
  try {
    const rows = await prisma.userMembership.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      },
    });
    res.json({
      success: true,
      memberships: rows.map((m) => ({
        ...membershipToDto(m),
        userId: m.userId,
        user: m.user,
        updatedAt: m.updatedAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function adminUpdateUserMembership(req, res, next) {
  try {
    const { userId } = req.params;
    const { tier, status, applicationStatus, renewalDate, badgeLabel } = req.body || {};
    const data = {};

    if (tier !== undefined) {
      if (!isTier(tier)) return res.status(400).json({ success: false, error: "Invalid tier" });
      data.tier = tier;
    }
    if (status !== undefined) {
      if (!SUBSCRIPTION_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status" });
      }
      data.status = status;
    }
    if (applicationStatus !== undefined) {
      if (!APPLICATION_STATUSES.includes(applicationStatus)) {
        return res.status(400).json({ success: false, error: "Invalid applicationStatus" });
      }
      data.applicationStatus = applicationStatus;
    }
    if (renewalDate !== undefined) {
      data.renewalDate = renewalDate === null || renewalDate === "" ? null : new Date(renewalDate);
      if (data.renewalDate && Number.isNaN(data.renewalDate.getTime())) {
        return res.status(400).json({ success: false, error: "Invalid renewalDate" });
      }
    }
    if (badgeLabel !== undefined) {
      data.badgeLabel = badgeLabel === null || badgeLabel === "" ? null : String(badgeLabel).slice(0, 60);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    const previous = await getOrCreateUserMembership(userId);

    // Activating by hand without a date would create a membership that never
    // expires — the one shape the sweep cannot clean up.
    if (data.status === "active" && !data.renewalDate && !previous.renewalDate) {
      data.renewalDate = periodEndFrom(new Date());
    }
    if (data.status === "active" && !previous.startedAt) {
      data.startedAt = new Date();
    }

    const updated = await prisma.userMembership.update({
      where: { userId },
      data,
      include: { user: { select: { name: true, email: true } } },
    });

    recordAudit(req, {
      action: "membership.update",
      targetType: "membership",
      targetId: userId,
      targetLabel: updated.user ? updated.user.name : null,
      metadata: {
        from: { tier: previous.tier, status: previous.status },
        to: { tier: updated.tier, status: updated.status },
      },
    });

    res.json({ success: true, membership: membershipToDto(updated) });
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ success: false, error: "User membership not found" });
    }
    next(e);
  }
}

async function adminListInvoices(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ["pending", "paid", "failed", "canceled"].includes(status)) {
      where.status = status;
    }
    const rows = await prisma.membershipInvoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: { select: { id: true, provider: true, status: true } },
      },
    });
    res.json({
      success: true,
      invoices: rows.map((r) => ({ ...invoiceToDto(r), user: r.user })),
    });
  } catch (e) {
    next(e);
  }
}

//////////////////////////////////////////////////////
// ADMIN: PLANS
//////////////////////////////////////////////////////

async function adminListPlans(req, res, next) {
  try {
    await ensureDefaultMembershipPlans();
    const plans = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });
    res.json({ success: true, plans: plans.map(planToDto) });
  } catch (e) {
    next(e);
  }
}

async function adminUpsertPlan(req, res, next) {
  try {
    const { tier, name, monthlyPriceMinor, currency, description, features, active, sortOrder } =
      req.body || {};
    if (!isTier(tier)) {
      return res.status(400).json({ success: false, error: "Valid tier is required" });
    }

    let priceMinor;
    if (monthlyPriceMinor !== undefined) {
      const parsed = Number(monthlyPriceMinor);
      if (!Number.isSafeInteger(parsed) || parsed < 0) {
        return res.status(400).json({
          success: false,
          error: "monthlyPriceMinor must be a non-negative integer in minor units (cents)",
        });
      }
      priceMinor = BigInt(parsed);
    }
    if (features !== undefined && !Array.isArray(features)) {
      return res.status(400).json({ success: false, error: "features must be an array" });
    }

    const before = await prisma.membershipPlan.findUnique({ where: { tier } });

    const plan = await prisma.membershipPlan.upsert({
      where: { tier },
      create: {
        tier,
        name: name || tier,
        monthlyPriceMinor: priceMinor === undefined ? 0n : priceMinor,
        currency: (currency || "USD").toUpperCase(),
        description: description || "",
        features: Array.isArray(features) ? features : [],
        active: active !== false,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
      update: {
        ...(name !== undefined && { name }),
        ...(priceMinor !== undefined && { monthlyPriceMinor: priceMinor }),
        ...(currency !== undefined && { currency: String(currency).toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features }),
        ...(active !== undefined && { active }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    // Plan edits change what members are charged, so they belong in the audit
    // trail alongside every other admin membership write.
    recordAudit(req, {
      action: before ? "membership.plan.update" : "membership.plan.create",
      targetType: "membership",
      targetId: plan.tier,
      targetLabel: plan.name,
      metadata: {
        from: before
          ? { price: String(before.monthlyPriceMinor), currency: before.currency, active: before.active }
          : null,
        to: { price: String(plan.monthlyPriceMinor), currency: plan.currency, active: plan.active },
      },
    });

    res.json({ success: true, plan: planToDto(plan) });
  } catch (e) {
    next(e);
  }
}

//////////////////////////////////////////////////////
// EVENTS
//////////////////////////////////////////////////////

/**
 * Shape an event for a given viewer.
 *
 * An event the viewer cannot attend is returned as a teaser — title, when, and
 * the tier it needs — with location and description withheld. The full record
 * used to be public, which handed anyone on the internet the address of an
 * Investor+ dinner.
 */
function eventToDto(event, { unlocked, registration, registeredCount }) {
  const seatsLeft =
    event.capacity == null ? null : Math.max(0, event.capacity - registeredCount);

  const base = {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt ? event.endsAt.toISOString() : null,
    minTier: event.minTier,
    capacity: event.capacity,
    seatsLeft,
    active: event.active,
    locked: !unlocked,
    registered: registration?.status === "confirmed",
    registrationId: registration?.status === "confirmed" ? registration.id : null,
  };

  if (!unlocked) return base;

  return {
    ...base,
    description: event.description,
    location: event.location,
    imageUrl: event.imageUrl,
  };
}

async function listMemberEvents(req, res, next) {
  try {
    const now = new Date();
    const events = await prisma.memberEvent.findMany({
      where: { active: true, startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
    });

    let membership = null;
    let registrations = new Map();
    if (req.user) {
      membership = await getOrCreateUserMembership(req.user.id);
      const rows = await prisma.memberEventRegistration.findMany({
        where: { userId: req.user.id, eventId: { in: events.map((e) => e.id) } },
      });
      registrations = new Map(rows.map((r) => [r.eventId, r]));
    }

    const counts = await prisma.memberEventRegistration.groupBy({
      by: ["eventId"],
      where: { eventId: { in: events.map((e) => e.id) }, status: "confirmed" },
      _count: { _all: true },
    });
    const countByEvent = new Map(counts.map((c) => [c.eventId, c._count._all]));

    res.json({
      success: true,
      events: events.map((event) =>
        eventToDto(event, {
          unlocked:
            Boolean(membership) &&
            isActive(membership) &&
            hasTierAccess(membership.tier, event.minTier),
          registration: registrations.get(event.id),
          registeredCount: countByEvent.get(event.id) ?? 0,
        })
      ),
    });
  } catch (e) {
    next(e);
  }
}

async function bookMemberEvent(req, res, next) {
  try {
    const { id } = req.params;

    const membership = await getOrCreateUserMembership(req.user.id);
    if (!isActive(membership)) {
      return res.status(403).json({ success: false, error: "Active membership required" });
    }

    const registration = await prisma.$transaction(async (tx) => {
      // Serialise bookings for this event. The old count-then-insert could seat
      // two members in the last chair, because each transaction counted before
      // the other's insert was visible.
      const locked = await tx.$queryRaw`
        SELECT "id", "capacity", "minTier", "startsAt", "active"
          FROM "MemberEvent"
         WHERE "id" = ${id}
           FOR UPDATE`;
      const event = locked[0];
      if (!event) throw new Error("EVENT_NOT_FOUND");
      if (!event.active) throw new Error("EVENT_INACTIVE");
      if (new Date(event.startsAt) <= new Date()) throw new Error("EVENT_PAST");
      if (!hasTierAccess(membership.tier, event.minTier)) {
        throw new Error(`EVENT_TIER:${event.minTier}`);
      }

      const existing = await tx.memberEventRegistration.findUnique({
        where: { eventId_userId: { eventId: id, userId: req.user.id } },
      });
      if (existing?.status === "confirmed") throw new Error("ALREADY_REGISTERED");

      if (event.capacity != null) {
        const taken = await tx.memberEventRegistration.count({
          where: { eventId: id, status: "confirmed" },
        });
        if (taken >= event.capacity) throw new Error("EVENT_FULL");
      }

      // Re-booking after a cancellation reuses the row; the (eventId, userId)
      // pair is unique, so inserting a second one would fail.
      if (existing) {
        return tx.memberEventRegistration.update({
          where: { id: existing.id },
          data: { status: "confirmed", canceledAt: null },
        });
      }
      return tx.memberEventRegistration.create({
        data: { eventId: id, userId: req.user.id, status: "confirmed" },
      });
    });

    res.status(201).json({ success: true, registration });
  } catch (e) {
    const map = {
      EVENT_NOT_FOUND: [404, "Event not found"],
      EVENT_INACTIVE: [400, "This event is no longer open"],
      EVENT_PAST: [400, "This event has already started"],
      ALREADY_REGISTERED: [409, "You are already registered for this event"],
      EVENT_FULL: [409, "This event is full"],
    };
    if (map[e.message]) {
      const [status, error] = map[e.message];
      return res.status(status).json({ success: false, error });
    }
    if (e.message?.startsWith("EVENT_TIER:")) {
      return res.status(403).json({
        success: false,
        error: `This event requires the ${e.message.split(":")[1]} tier or higher`,
      });
    }
    next(e);
  }
}

async function cancelEventBooking(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.memberEventRegistration.findUnique({
      where: { eventId_userId: { eventId: id, userId: req.user.id } },
    });
    if (!existing || existing.status !== "confirmed") {
      return res.status(404).json({ success: false, error: "You are not registered for this event" });
    }
    const updated = await prisma.memberEventRegistration.update({
      where: { id: existing.id },
      data: { status: "canceled", canceledAt: new Date() },
    });
    res.json({ success: true, registration: updated });
  } catch (e) {
    next(e);
  }
}

//////////////////////////////////////////////////////
// ADMIN: EVENTS
//////////////////////////////////////////////////////

function parseEventBody(body, { partial }) {
  const data = {};
  const { title, description, startsAt, endsAt, location, minTier, capacity, imageUrl, active } =
    body || {};

  if (!partial || title !== undefined) {
    if (typeof title !== "string" || !title.trim()) return { error: "title is required" };
    data.title = title.trim();
  }
  if (!partial || startsAt !== undefined) {
    const d = new Date(startsAt);
    if (Number.isNaN(d.getTime())) return { error: "startsAt must be a valid date" };
    data.startsAt = d;
  }
  if (endsAt !== undefined) {
    if (endsAt === null || endsAt === "") data.endsAt = null;
    else {
      const d = new Date(endsAt);
      if (Number.isNaN(d.getTime())) return { error: "endsAt must be a valid date" };
      data.endsAt = d;
    }
  }
  if (data.startsAt && data.endsAt && data.endsAt < data.startsAt) {
    return { error: "endsAt cannot be before startsAt" };
  }
  if (description !== undefined) data.description = description ? String(description) : null;
  if (location !== undefined) data.location = location ? String(location) : null;
  if (imageUrl !== undefined) data.imageUrl = imageUrl ? String(imageUrl) : null;
  if (minTier !== undefined) {
    if (!isTier(minTier)) return { error: "Invalid minTier" };
    data.minTier = minTier;
  }
  if (capacity !== undefined) {
    if (capacity === null || capacity === "") data.capacity = null;
    else {
      const n = Number(capacity);
      if (!Number.isSafeInteger(n) || n < 1) return { error: "capacity must be a positive integer" };
      data.capacity = n;
    }
  }
  if (active !== undefined) data.active = Boolean(active);

  return { data };
}

async function adminListEvents(req, res, next) {
  try {
    const events = await prisma.memberEvent.findMany({
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { registrations: true } } },
    });
    res.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt ? e.endsAt.toISOString() : null,
        location: e.location,
        minTier: e.minTier,
        capacity: e.capacity,
        imageUrl: e.imageUrl,
        active: e.active,
        registrationCount: e._count.registrations,
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function adminCreateMemberEvent(req, res, next) {
  try {
    const { error, data } = parseEventBody(req.body, { partial: false });
    if (error) return res.status(400).json({ success: false, error });

    const event = await prisma.memberEvent.create({
      data: { minTier: "basic", ...data },
    });

    recordAudit(req, {
      action: "membership.event.create",
      targetType: "membership",
      targetId: event.id,
      targetLabel: event.title,
      metadata: { startsAt: event.startsAt.toISOString(), minTier: event.minTier },
    });

    res.status(201).json({ success: true, event });
  } catch (e) {
    next(e);
  }
}

async function adminUpdateMemberEvent(req, res, next) {
  try {
    const { id } = req.params;
    const { error, data } = parseEventBody(req.body, { partial: true });
    if (error) return res.status(400).json({ success: false, error });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    const event = await prisma.memberEvent.update({ where: { id }, data });

    recordAudit(req, {
      action: "membership.event.update",
      targetType: "membership",
      targetId: event.id,
      targetLabel: event.title,
      metadata: { fields: Object.keys(data) },
    });

    res.json({ success: true, event });
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    next(e);
  }
}

/**
 * Cancel an event.
 *
 * A soft cancel rather than a delete: members who booked should still see that
 * the thing they reserved was called off, and their registration rows are the
 * record of who to tell.
 */
async function adminCancelMemberEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await prisma.memberEvent.update({
      where: { id },
      data: { active: false },
    });

    recordAudit(req, {
      action: "membership.event.cancel",
      targetType: "membership",
      targetId: event.id,
      targetLabel: event.title,
      metadata: null,
    });

    res.json({ success: true, event });
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    next(e);
  }
}

async function adminListEventRegistrations(req, res, next) {
  try {
    const { eventId } = req.query;
    const where = eventId ? { eventId: String(eventId) } : {};
    const rows = await prisma.memberEventRegistration.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, startsAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, registrations: rows });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getMyMembership,
  submitApplication,
  startMembershipCheckout,
  cancelMyMembership,
  resumeMyMembership,
  listMyInvoices,
  listPlans,
  listFeatureAccess,
  updateFeatureAccess,
  adminListApplications,
  adminReviewApplication,
  adminListMemberships,
  adminUpdateUserMembership,
  adminListInvoices,
  adminUpsertPlan,
  adminListPlans,
  listMemberEvents,
  bookMemberEvent,
  cancelEventBooking,
  adminListEvents,
  adminCreateMemberEvent,
  adminUpdateMemberEvent,
  adminCancelMemberEvent,
  adminListEventRegistrations,
  TIER_ORDER,
};

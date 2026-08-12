const { prisma } = require("../config/db");
const {
  getOrCreateUserMembership,
  getMembershipForAuth,
  hasMembershipPrisma,
  ensureDefaultMembershipPlans,
  ensureDefaultFeatureAccess,
  membershipToDto,
  hasTierAccess,
} = require("../services/membership.service");

async function getMyMembership(req, res, next) {
  try {
    if (!hasMembershipPrisma()) {
      const membership = await getMembershipForAuth(req.user.id);
      return res.json({
        success: true,
        membership,
        latestApplication: null,
      });
    }
    await ensureDefaultMembershipPlans();
    const membership = await getOrCreateUserMembership(req.user.id);
    const latestApplication = await prisma.membershipApplication.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      membership: membershipToDto(membership),
      latestApplication: latestApplication
        ? {
            id: latestApplication.id,
            status: latestApplication.status,
            adminFeedback: latestApplication.adminFeedback,
            createdAt: latestApplication.createdAt.toISOString(),
          }
        : null,
    });
  } catch (e) {
    next(e);
  }
}

async function submitApplication(req, res, next) {
  try {
    const { motivation, interests, communityContribution } = req.body || {};
    if (
      typeof motivation !== "string" ||
      typeof interests !== "string" ||
      typeof communityContribution !== "string" ||
      !motivation.trim() ||
      !interests.trim() ||
      !communityContribution.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "motivation, interests, and communityContribution are required",
      });
    }

    const pending = await prisma.membershipApplication.findFirst({
      where: { userId: req.user.id, status: "pending" },
    });
    if (pending) {
      return res.status(400).json({
        success: false,
        error: "You already have a pending application",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.membershipApplication.create({
        data: {
          userId: req.user.id,
          motivation: motivation.trim(),
          interests: interests.trim(),
          communityContribution: communityContribution.trim(),
          status: "pending",
        },
      });
      await tx.userMembership.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          tier: "free",
          status: "none",
          applicationStatus: "pending",
          badgeLabel: "Applicant",
        },
        update: {
          applicationStatus: "pending",
          badgeLabel: "Applicant",
        },
      });
    });

    const membership = await getOrCreateUserMembership(req.user.id);
    res.status(201).json({
      success: true,
      message: "Application submitted",
      membership: membershipToDto(membership),
    });
  } catch (e) {
    next(e);
  }
}

async function listPlans(req, res, next) {
  try {
    await ensureDefaultMembershipPlans();
    const plans = await prisma.membershipPlan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({
      success: true,
      plans: plans.map((p) => ({
        id: p.id,
        tier: p.tier,
        name: p.name,
        monthlyPrice: p.monthlyPrice,
        description: p.description,
        features: Array.isArray(p.features) ? p.features : [],
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function listFeatureAccess(req, res, next) {
  try {
    await ensureDefaultFeatureAccess();
    const rows = await prisma.membershipFeatureAccess.findMany({
      orderBy: { featureKey: "asc" },
    });
    res.json({
      success: true,
      features: rows.map((r) => ({ featureKey: r.featureKey, minTier: r.minTier })),
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
      if (!item || typeof item.featureKey !== "string" || !item.minTier) {
        return res.status(400).json({
          success: false,
          error: "Each feature needs featureKey and minTier",
        });
      }
      await prisma.membershipFeatureAccess.upsert({
        where: { featureKey: item.featureKey },
        create: { featureKey: item.featureKey, minTier: item.minTier },
        update: { minTier: item.minTier },
      });
    }
    const rows = await prisma.membershipFeatureAccess.findMany({
      orderBy: { featureKey: "asc" },
    });
    res.json({
      success: true,
      features: rows.map((r) => ({ featureKey: r.featureKey, minTier: r.minTier })),
    });
  } catch (e) {
    next(e);
  }
}

async function adminListApplications(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ["pending", "approved", "rejected", "none"].includes(status)) {
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

async function adminReviewApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { action, tier, adminFeedback } = req.body || {};
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, error: "action must be approve or reject" });
    }

    const app = await prisma.membershipApplication.findUnique({ where: { id } });
    if (!app) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }
    if (app.status !== "pending") {
      return res.status(400).json({ success: false, error: "Application is not pending" });
    }

    const now = new Date();
    const reviewerId = req.user.id;

    if (action === "reject") {
      await prisma.$transaction([
        prisma.membershipApplication.update({
          where: { id },
          data: {
            status: "rejected",
            adminFeedback: typeof adminFeedback === "string" ? adminFeedback : null,
            reviewedById: reviewerId,
            reviewedAt: now,
          },
        }),
        prisma.userMembership.upsert({
          where: { userId: app.userId },
          create: {
            userId: app.userId,
            tier: "free",
            status: "none",
            applicationStatus: "rejected",
            badgeLabel: "Applicant",
          },
          update: {
            applicationStatus: "rejected",
            badgeLabel: "Applicant",
          },
        }),
      ]);
    } else {
      const assignTier =
        tier && ["free", "basic", "premium", "investor_plus"].includes(tier) ? tier : "basic";
      await prisma.$transaction([
        prisma.membershipApplication.update({
          where: { id },
          data: {
            status: "approved",
            adminFeedback: typeof adminFeedback === "string" ? adminFeedback : null,
            reviewedById: reviewerId,
            reviewedAt: now,
          },
        }),
        prisma.userMembership.upsert({
          where: { userId: app.userId },
          create: {
            userId: app.userId,
            tier: assignTier,
            status: "active",
            applicationStatus: "approved",
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            badgeLabel: "Member",
          },
          update: {
            tier: assignTier,
            status: "active",
            applicationStatus: "approved",
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            badgeLabel: "Member",
          },
        }),
      ]);
    }

    const membership = await getOrCreateUserMembership(app.userId);
    res.json({
      success: true,
      membership: membershipToDto(membership),
    });
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
      if (!["free", "basic", "premium", "investor_plus"].includes(tier)) {
        return res.status(400).json({ success: false, error: "Invalid tier" });
      }
      data.tier = tier;
    }
    if (status !== undefined) {
      if (!["none", "active", "expired", "canceled"].includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status" });
      }
      data.status = status;
    }
    if (applicationStatus !== undefined) {
      if (!["none", "pending", "approved", "rejected"].includes(applicationStatus)) {
        return res.status(400).json({ success: false, error: "Invalid applicationStatus" });
      }
      data.applicationStatus = applicationStatus;
    }
    if (renewalDate !== undefined) {
      data.renewalDate = renewalDate === null || renewalDate === "" ? null : new Date(renewalDate);
    }
    if (badgeLabel !== undefined) {
      data.badgeLabel = badgeLabel === null || badgeLabel === "" ? null : String(badgeLabel);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    await getOrCreateUserMembership(userId);
    const updated = await prisma.userMembership.update({
      where: { userId },
      data,
    });
    res.json({ success: true, membership: membershipToDto(updated) });
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ success: false, error: "User membership not found" });
    }
    next(e);
  }
}

async function adminUpsertPlan(req, res, next) {
  try {
    const { tier, name, monthlyPrice, description, features, active, sortOrder } = req.body || {};
    if (!tier || !["free", "basic", "premium", "investor_plus"].includes(tier)) {
      return res.status(400).json({ success: false, error: "Valid tier is required" });
    }
    const plan = await prisma.membershipPlan.upsert({
      where: { tier },
      create: {
        tier,
        name: name || tier,
        monthlyPrice: typeof monthlyPrice === "number" ? monthlyPrice : 0,
        description: description || "",
        features: Array.isArray(features) ? features : [],
        active: active !== false,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
      update: {
        ...(name !== undefined && { name }),
        ...(monthlyPrice !== undefined && { monthlyPrice }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features }),
        ...(active !== undefined && { active }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    res.json({ success: true, plan });
  } catch (e) {
    next(e);
  }
}

async function adminListPlans(req, res, next) {
  try {
    await ensureDefaultMembershipPlans();
    const plans = await prisma.membershipPlan.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, plans });
  } catch (e) {
    next(e);
  }
}

async function listMemberEvents(req, res, next) {
  try {
    const events = await prisma.memberEvent.findMany({
      orderBy: { startsAt: "asc" },
    });
    res.json({ success: true, events });
  } catch (e) {
    next(e);
  }
}

async function adminCreateMemberEvent(req, res, next) {
  try {
    const { title, description, startsAt, endsAt, location, minTier, capacity, imageUrl } = req.body || {};
    if (!title || !startsAt) {
      return res.status(400).json({ success: false, error: "title and startsAt are required" });
    }
    const tier =
      minTier && ["free", "basic", "premium", "investor_plus"].includes(minTier) ? minTier : "basic";
    const event = await prisma.memberEvent.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description) : null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        location: location ? String(location) : null,
        minTier: tier,
        capacity: capacity != null ? parseInt(capacity, 10) : null,
        imageUrl: imageUrl ? String(imageUrl) : null,
      },
    });
    res.status(201).json({ success: true, event });
  } catch (e) {
    next(e);
  }
}

async function bookMemberEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await prisma.memberEvent.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const membership = await getOrCreateUserMembership(req.user.id);
    if (membership.status !== "active") {
      return res.status(403).json({ success: false, error: "Active membership required" });
    }
    if (!hasTierAccess(membership.tier, event.minTier)) {
      return res.status(403).json({
        success: false,
        error: `This event requires tier ${event.minTier} or higher`,
      });
    }

    const existing = await prisma.memberEventRegistration.findUnique({
      where: {
        eventId_userId: { eventId: id, userId: req.user.id },
      },
    });
    if (existing) {
      return res.status(400).json({ success: false, error: "Already registered for this event" });
    }

    if (event.capacity != null) {
      const count = await prisma.memberEventRegistration.count({ where: { eventId: id } });
      if (count >= event.capacity) {
        return res.status(409).json({ success: false, error: "Event is full" });
      }
    }

    const reg = await prisma.memberEventRegistration.create({
      data: {
        eventId: id,
        userId: req.user.id,
        status: "confirmed",
      },
    });
    res.status(201).json({ success: true, registration: reg });
  } catch (e) {
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
  listPlans,
  listFeatureAccess,
  updateFeatureAccess,
  adminListApplications,
  adminReviewApplication,
  adminListMemberships,
  adminUpdateUserMembership,
  adminUpsertPlan,
  adminListPlans,
  listMemberEvents,
  adminCreateMemberEvent,
  bookMemberEvent,
  adminListEventRegistrations,
};

const express = require("express");
const protect = require("../middleware/protect.middleware");
const authorize = require("../middleware/authorize.middleware");
const {
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
} = require("../controllers/membership.controller");
const { hasMembershipPrisma } = require("../services/membership.service");

const router = express.Router();

function requireMembershipPrismaClient(req, res, next) {
  if (!hasMembershipPrisma()) {
    return res.status(503).json({
      success: false,
      error:
        "Membership API needs an updated Prisma Client. From the BACKEND folder run: npx prisma generate",
    });
  }
  next();
}

router.get("/plans", requireMembershipPrismaClient, listPlans);
router.get("/events", requireMembershipPrismaClient, listMemberEvents);

router.get("/me", protect, getMyMembership);
router.post("/apply", protect, requireMembershipPrismaClient, submitApplication);
router.post("/events/:id/book", protect, requireMembershipPrismaClient, bookMemberEvent);

const admin = express.Router();
admin.use(protect, authorize("admin"), requireMembershipPrismaClient);
admin.get("/applications", adminListApplications);
admin.patch("/applications/:id", adminReviewApplication);
admin.get("/memberships", adminListMemberships);
admin.patch("/memberships/:userId", adminUpdateUserMembership);
admin.get("/plans", adminListPlans);
admin.put("/plans", adminUpsertPlan);
admin.get("/features", listFeatureAccess);
admin.put("/features", updateFeatureAccess);
admin.post("/events", adminCreateMemberEvent);
admin.get("/event-registrations", adminListEventRegistrations);

router.use("/admin", admin);

module.exports = router;

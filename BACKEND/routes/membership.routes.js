const express = require("express");
const protect = require("../middleware/protect.middleware");
const optionalAuth = require("../middleware/optionalAuth.middleware");
const authorize = require("../middleware/authorize.middleware");
const {
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

// Public: pricing, gates, and the events teaser. `optionalAuth` on the events
// list is what lets a signed-in member see full detail on the same URL an
// anonymous visitor gets a teaser from.
router.get("/plans", requireMembershipPrismaClient, listPlans);
router.get("/features", requireMembershipPrismaClient, listFeatureAccess);
router.get("/events", requireMembershipPrismaClient, optionalAuth, listMemberEvents);

// Member.
router.get("/me", protect, getMyMembership);
router.post("/apply", protect, requireMembershipPrismaClient, submitApplication);
router.get("/invoices", protect, requireMembershipPrismaClient, listMyInvoices);
router.post("/checkout", protect, requireMembershipPrismaClient, startMembershipCheckout);
router.post("/cancel", protect, requireMembershipPrismaClient, cancelMyMembership);
router.post("/resume", protect, requireMembershipPrismaClient, resumeMyMembership);
router.post("/events/:id/book", protect, requireMembershipPrismaClient, bookMemberEvent);
router.delete("/events/:id/book", protect, requireMembershipPrismaClient, cancelEventBooking);

const admin = express.Router();
admin.use(protect, authorize("admin"), requireMembershipPrismaClient);
admin.get("/applications", adminListApplications);
admin.patch("/applications/:id", adminReviewApplication);
admin.get("/memberships", adminListMemberships);
admin.patch("/memberships/:userId", adminUpdateUserMembership);
admin.get("/invoices", adminListInvoices);
admin.get("/plans", adminListPlans);
admin.put("/plans", adminUpsertPlan);
admin.get("/features", listFeatureAccess);
admin.put("/features", updateFeatureAccess);
admin.get("/events", adminListEvents);
admin.post("/events", adminCreateMemberEvent);
admin.patch("/events/:id", adminUpdateMemberEvent);
admin.delete("/events/:id", adminCancelMemberEvent);
admin.get("/event-registrations", adminListEventRegistrations);

router.use("/admin", admin);

module.exports = router;

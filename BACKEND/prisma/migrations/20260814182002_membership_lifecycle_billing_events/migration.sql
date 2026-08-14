-- CreateEnum
CREATE TYPE "MembershipInvoiceStatus" AS ENUM ('pending', 'paid', 'failed', 'canceled');

-- AlterTable
ALTER TABLE "MemberEvent" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MemberEventRegistration" ADD COLUMN     "canceledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserMembership" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "pendingTier" "MembershipTier",
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MembershipInvoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "MembershipTier" NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "MembershipInvoiceStatus" NOT NULL DEFAULT 'pending',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipInvoice_paymentId_key" ON "MembershipInvoice"("paymentId");

-- CreateIndex
CREATE INDEX "MembershipInvoice_userId_createdAt_idx" ON "MembershipInvoice"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MembershipInvoice_status_idx" ON "MembershipInvoice"("status");

-- CreateIndex
CREATE INDEX "MemberEvent_startsAt_idx" ON "MemberEvent"("startsAt");

-- CreateIndex
CREATE INDEX "UserMembership_status_renewalDate_idx" ON "UserMembership"("status", "renewalDate");

-- AddForeignKey
ALTER TABLE "MembershipInvoice" ADD CONSTRAINT "MembershipInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipInvoice" ADD CONSTRAINT "MembershipInvoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: an already-active membership started at some point in the past, and
-- the row's own createdAt is the only evidence we have of when.
UPDATE "UserMembership" SET "startedAt" = "createdAt" WHERE "status" = 'active' AND "startedAt" IS NULL;

-- Collapse any duplicate pending applications down to the newest one before the
-- unique index below can be created. The controller's read-then-write check let
-- a double submit through, so this is not hypothetical.
UPDATE "MembershipApplication" a
   SET "status" = 'rejected',
       "adminFeedback" = COALESCE(a."adminFeedback", 'Superseded by a newer application.')
 WHERE a."status" = 'pending'
   AND a."id" <> (
     SELECT b."id" FROM "MembershipApplication" b
      WHERE b."userId" = a."userId" AND b."status" = 'pending'
      ORDER BY b."createdAt" DESC, b."id" DESC
      LIMIT 1
   );

-- One open application per user, enforced by the database rather than by a
-- read-then-write check in the controller. Prisma cannot express a partial
-- unique index, so it lives here and is reflected back via a @@ignore-free raw
-- constraint the client never needs to know about.
CREATE UNIQUE INDEX "MembershipApplication_one_pending_per_user"
    ON "MembershipApplication"("userId")
 WHERE "status" = 'pending';

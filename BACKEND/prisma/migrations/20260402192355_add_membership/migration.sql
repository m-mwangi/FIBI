-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('free', 'basic', 'premium', 'investor_plus');

-- CreateEnum
CREATE TYPE "MembershipSubscriptionStatus" AS ENUM ('none', 'active', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "MembershipApplicationReviewStatus" AS ENUM ('none', 'pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "UserMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "MembershipTier" NOT NULL DEFAULT 'free',
    "status" "MembershipSubscriptionStatus" NOT NULL DEFAULT 'none',
    "applicationStatus" "MembershipApplicationReviewStatus" NOT NULL DEFAULT 'none',
    "renewalDate" TIMESTAMP(3),
    "badgeLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "communityContribution" TEXT NOT NULL,
    "status" "MembershipApplicationReviewStatus" NOT NULL DEFAULT 'pending',
    "adminFeedback" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" TEXT NOT NULL,
    "tier" "MembershipTier" NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "features" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipFeatureAccess" (
    "featureKey" TEXT NOT NULL,
    "minTier" "MembershipTier" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipFeatureAccess_pkey" PRIMARY KEY ("featureKey")
);

-- CreateTable
CREATE TABLE "MemberEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "location" TEXT,
    "minTier" "MembershipTier" NOT NULL DEFAULT 'basic',
    "capacity" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberEventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberEventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMembership_userId_key" ON "UserMembership"("userId");

-- CreateIndex
CREATE INDEX "MembershipApplication_userId_idx" ON "MembershipApplication"("userId");

-- CreateIndex
CREATE INDEX "MembershipApplication_status_idx" ON "MembershipApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_tier_key" ON "MembershipPlan"("tier");

-- CreateIndex
CREATE INDEX "MemberEventRegistration_userId_idx" ON "MemberEventRegistration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberEventRegistration_eventId_userId_key" ON "MemberEventRegistration"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "UserMembership" ADD CONSTRAINT "UserMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipApplication" ADD CONSTRAINT "MembershipApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipApplication" ADD CONSTRAINT "MembershipApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberEventRegistration" ADD CONSTRAINT "MemberEventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MemberEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberEventRegistration" ADD CONSTRAINT "MemberEventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

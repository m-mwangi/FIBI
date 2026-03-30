/*
  Warnings:

  - The `idType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('investor', 'admin');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('passport', 'national_id', 'drivers_license');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('open', 'funded', 'active', 'closed');

-- CreateEnum
CREATE TYPE "TimelineStatus" AS ENUM ('completed', 'in-progress', 'upcoming');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('pending', 'active', 'completed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PAYOUT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "idType",
ADD COLUMN     "idType" "IdType",
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'investor';

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "minInvestment" DOUBLE PRECISION NOT NULL,
    "totalFunding" DOUBLE PRECISION NOT NULL,
    "currentFunding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "investorsCount" INTEGER NOT NULL DEFAULT 0,
    "projectedROI" DOUBLE PRECISION NOT NULL,
    "payoutFrequency" TEXT NOT NULL,
    "fundingDeadline" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "imageUrl" TEXT NOT NULL,
    "images" TEXT[],
    "status" "ProjectStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "status" "TimelineStatus" NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amountInvested" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "totalReturns" DOUBLE PRECISION DEFAULT 0,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'active',
    "investmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "platformName" TEXT NOT NULL DEFAULT 'FIBI',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@fibi.com',
    "contactPhone" TEXT NOT NULL DEFAULT '+254 700 000 000',
    "minInvestment" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "maxInvestment" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "depositsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "withdrawalsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transactionFee" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "investmentEmails" BOOLEAN NOT NULL DEFAULT true,
    "adminAlerts" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

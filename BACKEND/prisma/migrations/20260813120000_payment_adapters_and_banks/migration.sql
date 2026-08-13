-- Phase 2: provider-agnostic payments + bank accounts.
--
-- HAND-WRITTEN so the existing Stripe identifiers survive. Prisma's generated
-- migration drops `stripeCheckoutSessionId` and adds an empty `providerRef`,
-- which would orphan every in-flight Stripe payment from its session.

-- 1. Provider / status enums gain the members slow rails need.
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'MANUAL_WIRE';
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'MPESA';
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'ABSA';
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'SBM';
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'STANCHART';

ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'awaiting_funds';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'partially_settled';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'reversed';

-- 2. Payment: provider-agnostic identity.
ALTER TABLE "Payment"
  ADD COLUMN "providerRef"  TEXT,
  ADD COLUMN "providerMeta" JSONB,
  ADD COLUMN "settledAmountMinor" BIGINT NOT NULL DEFAULT 0;

-- Carry the Stripe ids across rather than losing them: the checkout session is
-- the handle, the payment intent is kept alongside it for reference.
UPDATE "Payment"
SET "providerRef" = "stripeCheckoutSessionId",
    "providerMeta" = jsonb_strip_nulls(
      jsonb_build_object(
        'stripeCheckoutSessionId', "stripeCheckoutSessionId",
        'stripePaymentIntentId',   "stripePaymentIntentId"
      )
    )
WHERE "stripeCheckoutSessionId" IS NOT NULL
   OR "stripePaymentIntentId" IS NOT NULL;

-- A payment that already succeeded has, by definition, settled in full.
UPDATE "Payment" SET "settledAmountMinor" = "amountMinor" WHERE "status" = 'succeeded';

ALTER TABLE "Payment"
  DROP COLUMN "stripeCheckoutSessionId",
  DROP COLUMN "stripePaymentIntentId";

-- Looking a payment up by its provider handle is the hot path in every webhook.
CREATE INDEX "Payment_provider_providerRef_idx" ON "Payment"("provider", "providerRef");

-- 3. Bank accounts.
CREATE TYPE "BankInstitution" AS ENUM (
  'SBM', 'ABSA', 'STANCHART', 'MORGAN_STANLEY', 'BANK_OF_SINGAPORE', 'OTHER'
);
CREATE TYPE "BankAccountPurpose" AS ENUM ('COLLECTION', 'CUSTODY');

CREATE TABLE "BankAccount" (
    "id"            TEXT NOT NULL,
    "label"         TEXT NOT NULL,
    "institution"   "BankInstitution" NOT NULL,
    "purpose"       "BankAccountPurpose" NOT NULL DEFAULT 'COLLECTION',
    "bankName"      TEXT NOT NULL,
    "accountName"   TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "swiftCode"     TEXT,
    "branch"        TEXT,
    "currency"      TEXT NOT NULL,
    "instructions"  TEXT,
    "active"        BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BankAccount_currency_purpose_active_idx"
  ON "BankAccount"("currency", "purpose", "active");

-- Exactly one active collection account per currency. Without this a second
-- account could be added and wire instructions would silently start quoting
-- whichever row the query happened to return first.
CREATE UNIQUE INDEX "BankAccount_one_active_collection_per_currency"
  ON "BankAccount"("currency")
  WHERE "purpose" = 'COLLECTION' AND "active" = true;

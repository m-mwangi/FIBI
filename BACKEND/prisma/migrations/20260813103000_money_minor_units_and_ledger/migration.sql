-- Money: Float (double precision) -> BigInt integer MINOR units, plus the
-- double-entry ledger tables.
--
-- HAND-WRITTEN. Prisma's generated migration for this schema change drops the
-- money columns and recreates them empty, which would destroy every balance on
-- the platform. This version adds the new columns, backfills them from the old
-- values, and only then drops the originals.
--
-- The backfill is `ROUND(old * 100)`. ROUND matters: the stored doubles are
-- already imprecise (4000.0000000000005 is representable and 4000 is not
-- guaranteed), so a bare cast would truncate toward zero and silently shave a
-- cent off arbitrary rows. ROUND recovers the value the user actually intended.
--
-- 100 is hard-coded rather than derived per-currency because every row today is
-- USD or KES, both of which are 2-decimal. utils/money.js owns the per-currency
-- exponent from here on; a future zero-decimal currency (JPY) must not be
-- backfilled by this script.

-- ---------------------------------------------------------------------------
-- 1. Project
-- ---------------------------------------------------------------------------
ALTER TABLE "Project"
  ADD COLUMN "minInvestmentMinor"  BIGINT,
  ADD COLUMN "totalFundingMinor"   BIGINT,
  ADD COLUMN "currentFundingMinor" BIGINT,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

UPDATE "Project" SET
  "minInvestmentMinor"  = ROUND("minInvestment"::numeric  * 100),
  "totalFundingMinor"   = ROUND("totalFunding"::numeric   * 100),
  "currentFundingMinor" = ROUND("currentFunding"::numeric * 100);

-- Fail the whole migration rather than leave a NULL balance behind.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Project"
             WHERE "minInvestmentMinor" IS NULL
                OR "totalFundingMinor" IS NULL
                OR "currentFundingMinor" IS NULL) THEN
    RAISE EXCEPTION 'Project money backfill left NULLs; aborting';
  END IF;
END $$;

ALTER TABLE "Project"
  ALTER COLUMN "minInvestmentMinor"  SET NOT NULL,
  ALTER COLUMN "totalFundingMinor"   SET NOT NULL,
  ALTER COLUMN "currentFundingMinor" SET NOT NULL,
  ALTER COLUMN "currentFundingMinor" SET DEFAULT 0;

ALTER TABLE "Project"
  DROP COLUMN "minInvestment",
  DROP COLUMN "totalFunding",
  DROP COLUMN "currentFunding";

-- ---------------------------------------------------------------------------
-- 2. Investment
-- ---------------------------------------------------------------------------
ALTER TABLE "Investment"
  ADD COLUMN "amountInvestedMinor" BIGINT,
  ADD COLUMN "currentValueMinor"   BIGINT,
  ADD COLUMN "totalReturnsMinor"   BIGINT DEFAULT 0,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

-- currentValue and totalReturns are nullable; NULL must stay NULL rather than
-- becoming a zero balance.
UPDATE "Investment" SET
  "amountInvestedMinor" = ROUND("amountInvested"::numeric * 100),
  "currentValueMinor"   = CASE WHEN "currentValue" IS NULL THEN NULL
                               ELSE ROUND("currentValue"::numeric * 100) END,
  "totalReturnsMinor"   = CASE WHEN "totalReturns" IS NULL THEN NULL
                               ELSE ROUND("totalReturns"::numeric * 100) END;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Investment" WHERE "amountInvestedMinor" IS NULL) THEN
    RAISE EXCEPTION 'Investment money backfill left NULLs; aborting';
  END IF;
END $$;

ALTER TABLE "Investment" ALTER COLUMN "amountInvestedMinor" SET NOT NULL;

ALTER TABLE "Investment"
  DROP COLUMN "amountInvested",
  DROP COLUMN "currentValue",
  DROP COLUMN "totalReturns";

-- ---------------------------------------------------------------------------
-- 3. Transaction
-- ---------------------------------------------------------------------------
ALTER TABLE "Transaction"
  ADD COLUMN "amountMinor" BIGINT,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

UPDATE "Transaction" SET "amountMinor" = ROUND("amount"::numeric * 100);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Transaction" WHERE "amountMinor" IS NULL) THEN
    RAISE EXCEPTION 'Transaction money backfill left NULLs; aborting';
  END IF;
END $$;

ALTER TABLE "Transaction" ALTER COLUMN "amountMinor" SET NOT NULL;
ALTER TABLE "Transaction" DROP COLUMN "amount";

-- ---------------------------------------------------------------------------
-- 4. Payment  (already had its own `currency` column — keep those values)
-- ---------------------------------------------------------------------------
ALTER TABLE "Payment" ADD COLUMN "amountMinor" BIGINT;

UPDATE "Payment" SET "amountMinor" = ROUND("amount"::numeric * 100);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Payment" WHERE "amountMinor" IS NULL) THEN
    RAISE EXCEPTION 'Payment money backfill left NULLs; aborting';
  END IF;
END $$;

ALTER TABLE "Payment" ALTER COLUMN "amountMinor" SET NOT NULL;
ALTER TABLE "Payment" DROP COLUMN "amount";

-- ---------------------------------------------------------------------------
-- 5. Settings  (single global row)
-- ---------------------------------------------------------------------------
ALTER TABLE "Settings"
  ADD COLUMN "minInvestmentMinor" BIGINT,
  ADD COLUMN "maxInvestmentMinor" BIGINT;

UPDATE "Settings" SET
  "minInvestmentMinor" = ROUND("minInvestment"::numeric * 100),
  "maxInvestmentMinor" = ROUND("maxInvestment"::numeric * 100);

ALTER TABLE "Settings"
  ALTER COLUMN "minInvestmentMinor" SET NOT NULL,
  ALTER COLUMN "maxInvestmentMinor" SET NOT NULL,
  ALTER COLUMN "minInvestmentMinor" SET DEFAULT 10000,
  ALTER COLUMN "maxInvestmentMinor" SET DEFAULT 5000000;

ALTER TABLE "Settings"
  DROP COLUMN "minInvestment",
  DROP COLUMN "maxInvestment";

-- ---------------------------------------------------------------------------
-- 6. MembershipPlan
-- ---------------------------------------------------------------------------
ALTER TABLE "MembershipPlan"
  ADD COLUMN "monthlyPriceMinor" BIGINT,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

UPDATE "MembershipPlan" SET "monthlyPriceMinor" = ROUND("monthlyPrice"::numeric * 100);

ALTER TABLE "MembershipPlan" ALTER COLUMN "monthlyPriceMinor" SET NOT NULL;
ALTER TABLE "MembershipPlan" DROP COLUMN "monthlyPrice";

-- ---------------------------------------------------------------------------
-- 7. Ledger
-- ---------------------------------------------------------------------------
CREATE TYPE "LedgerAccountType" AS ENUM (
  'INVESTOR_WALLET', 'PROJECT_ESCROW', 'PLATFORM_FEE',
  'BANK_SETTLEMENT', 'FX_SUSPENSE', 'CUSTODY'
);

CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "currency" TEXT NOT NULL,
    "ownerId" TEXT,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LedgerPosting" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "LedgerPosting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LedgerAccount_ownerId_idx" ON "LedgerAccount"("ownerId");
CREATE UNIQUE INDEX "LedgerAccount_type_ownerId_currency_key" ON "LedgerAccount"("type", "ownerId", "currency");
CREATE UNIQUE INDEX "JournalEntry_idempotencyKey_key" ON "JournalEntry"("idempotencyKey");
CREATE INDEX "JournalEntry_occurredAt_idx" ON "JournalEntry"("occurredAt");
CREATE INDEX "LedgerPosting_accountId_idx" ON "LedgerPosting"("accountId");
CREATE INDEX "LedgerPosting_entryId_idx" ON "LedgerPosting"("entryId");

ALTER TABLE "LedgerPosting" ADD CONSTRAINT "LedgerPosting_entryId_fkey"
  FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LedgerPosting" ADD CONSTRAINT "LedgerPosting_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The ledger is append-only. Postings are immutable once written; a correction
-- is a new reversing entry. Enforced in the database so no future code path —
-- an admin tool, a migration, a console session — can quietly rewrite history.
CREATE OR REPLACE FUNCTION ledger_posting_is_immutable() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'LedgerPosting is append-only: use a reversing entry instead of % ', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_posting_no_update
  BEFORE UPDATE OR DELETE ON "LedgerPosting"
  FOR EACH ROW EXECUTE FUNCTION ledger_posting_is_immutable();

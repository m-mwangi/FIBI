-- Phase 3: bank statement import and reconciliation.
--
-- Purely additive: two new tables, one enum, one index. No existing column
-- is touched, so unlike the money migration this carries no data risk.


-- CreateEnum
CREATE TYPE "StatementLineStatus" AS ENUM ('unmatched', 'matched', 'ignored');

-- CreateTable
CREATE TABLE "BankStatement" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "importedById" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lineCount" INTEGER NOT NULL DEFAULT 0,
    "fileHash" TEXT NOT NULL,

    CONSTRAINT "BankStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatementLine" (
    "id" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "valueDate" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "counterparty" TEXT,
    "status" "StatementLineStatus" NOT NULL DEFAULT 'unmatched',
    "matchedPaymentId" TEXT,
    "matchedAt" TIMESTAMP(3),
    "matchedById" TEXT,
    "matchNote" TEXT,
    "lineHash" TEXT NOT NULL,

    CONSTRAINT "StatementLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankStatement_fileHash_key" ON "BankStatement"("fileHash");

-- CreateIndex
CREATE INDEX "BankStatement_bankAccountId_idx" ON "BankStatement"("bankAccountId");

-- CreateIndex
CREATE INDEX "BankStatement_importedAt_idx" ON "BankStatement"("importedAt");

-- CreateIndex
CREATE INDEX "StatementLine_status_idx" ON "StatementLine"("status");

-- CreateIndex
CREATE INDEX "StatementLine_valueDate_idx" ON "StatementLine"("valueDate");

-- CreateIndex
CREATE INDEX "StatementLine_matchedPaymentId_idx" ON "StatementLine"("matchedPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "StatementLine_statementId_lineHash_key" ON "StatementLine"("statementId", "lineHash");

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementLine" ADD CONSTRAINT "StatementLine_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "BankStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;


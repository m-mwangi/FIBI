-- CreateTable
CREATE TABLE "OAuthCredential" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scope" TEXT,
    "accountEmail" TEXT,
    "connectedById" TEXT,
    "connectedByEmail" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthCredential_provider_key" ON "OAuthCredential"("provider");

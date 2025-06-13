-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN "portalToken" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "portalExpiresAt" TIMESTAMP(3);
ALTER TABLE "Proposal" ADD COLUMN "portalViewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Proposal" ADD COLUMN "portalLastViewed" TIMESTAMP(3);
ALTER TABLE "Proposal" ADD COLUMN "clientStatus" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "clientFeedback" TEXT;
ALTER TABLE "Proposal" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Proposal" ADD COLUMN "approvedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_portalToken_key" ON "Proposal"("portalToken");
CREATE INDEX "Proposal_portalToken_idx" ON "Proposal"("portalToken");
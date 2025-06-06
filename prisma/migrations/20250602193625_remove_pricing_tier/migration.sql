/*
  Warnings:

  - You are about to drop the column `pricingTier` on the `Proposal` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "customerPersona" TEXT NOT NULL,
    "voiceTranscript" TEXT,
    "aiSummary" TEXT,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "validUntil" DATETIME,
    "isExistingCustomer" BOOLEAN NOT NULL DEFAULT true,
    "customerId" TEXT,
    "prospectName" TEXT,
    "prospectCompany" TEXT,
    "prospectEmail" TEXT,
    "prospectPhone" TEXT,
    "prospectStatus" TEXT,
    "propertyId" TEXT,
    "projectId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proposal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Proposal_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Proposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Proposal" ("aiSummary", "createdAt", "createdBy", "customerId", "customerPersona", "description", "id", "isExistingCustomer", "name", "projectId", "propertyId", "prospectCompany", "prospectEmail", "prospectName", "prospectPhone", "prospectStatus", "status", "totalAmount", "updatedAt", "validUntil", "voiceTranscript") SELECT "aiSummary", "createdAt", "createdBy", "customerId", "customerPersona", "description", "id", "isExistingCustomer", "name", "projectId", "propertyId", "prospectCompany", "prospectEmail", "prospectName", "prospectPhone", "prospectStatus", "status", "totalAmount", "updatedAt", "validUntil", "voiceTranscript" FROM "Proposal";
DROP TABLE "Proposal";
ALTER TABLE "new_Proposal" RENAME TO "Proposal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

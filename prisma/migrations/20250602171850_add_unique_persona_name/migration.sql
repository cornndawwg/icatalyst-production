/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ProposalPersona` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProposalPersona_name_key" ON "ProposalPersona"("name");

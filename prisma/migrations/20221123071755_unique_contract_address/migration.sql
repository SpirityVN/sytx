/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `contract` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contract_address_key" ON "contract"("address");

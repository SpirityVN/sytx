/*
  Warnings:

  - You are about to drop the column `contract_id` on the `network_support` table. All the data in the column will be lost.
  - Added the required column `network_support_id` to the `contract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "network_support" DROP CONSTRAINT "network_support_contract_id_fkey";

-- DropIndex
DROP INDEX "network_support_contract_id_key";

-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "network_support_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "network_support" DROP COLUMN "contract_id";

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_network_support_id_fkey" FOREIGN KEY ("network_support_id") REFERENCES "network_support"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

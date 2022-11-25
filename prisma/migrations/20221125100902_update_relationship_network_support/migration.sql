-- DropForeignKey
ALTER TABLE "network_support" DROP CONSTRAINT "network_support_contract_id_fkey";

-- AlterTable
ALTER TABLE "network_support" ALTER COLUMN "contract_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "network_support" ADD CONSTRAINT "network_support_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

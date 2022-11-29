/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contract" DROP CONSTRAINT "contract_user_id_fkey";

-- DropTable
DROP TABLE "user";

/*
  Warnings:

  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `method` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `contract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_contract_id_fkey";

-- DropForeignKey
ALTER TABLE "method" DROP CONSTRAINT "method_contract_id_fkey";

-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "event";

-- DropTable
DROP TABLE "method";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

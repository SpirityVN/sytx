/*
  Warnings:

  - You are about to alter the column `weight` on the `lucky_wheel_reward` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Decimal(1,1)`.

*/
-- AlterTable
ALTER TABLE "lucky_wheel_reward" ALTER COLUMN "weight" SET DATA TYPE DECIMAL(1,1);

/*
  Warnings:

  - Added the required column `type` to the `network_support` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NetworkSupportType" AS ENUM ('testnet', 'mainnet');

-- AlterTable
ALTER TABLE "network_support" ADD COLUMN     "icon_currency_url" TEXT,
ADD COLUMN     "icon_network_url" TEXT,
ADD COLUMN     "type" "NetworkSupportType" NOT NULL;

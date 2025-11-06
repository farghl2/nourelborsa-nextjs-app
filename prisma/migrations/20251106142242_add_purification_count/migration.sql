-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "purificationLimit" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "purificationCount" INTEGER DEFAULT 0;

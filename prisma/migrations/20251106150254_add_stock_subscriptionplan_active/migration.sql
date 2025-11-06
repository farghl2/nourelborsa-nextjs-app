-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "allowedStocks" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "allowedStocks" BOOLEAN NOT NULL DEFAULT false;

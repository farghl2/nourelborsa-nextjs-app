-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "prohibitedRevenuePercentageSecondary" TEXT,
ALTER COLUMN "prohibitedRevenuePercentage" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiUsageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAiUsageReset" TIMESTAMP(3);

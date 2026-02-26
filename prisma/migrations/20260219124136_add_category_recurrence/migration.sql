-- CreateEnum
CREATE TYPE "BillCategory" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "BillRecurrence" AS ENUM ('NONE', 'MONTHLY');

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "category" "BillCategory" NOT NULL DEFAULT 'VARIABLE',
ADD COLUMN     "recurrence" "BillRecurrence" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "Bill_dueDate_idx" ON "Bill"("dueDate");

-- CreateIndex
CREATE INDEX "Bill_category_idx" ON "Bill"("category");

-- CreateIndex
CREATE INDEX "Bill_recurrence_idx" ON "Bill"("recurrence");

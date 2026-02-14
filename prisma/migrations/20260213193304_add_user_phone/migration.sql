/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bill_id_userId_key" ON "Bill"("id", "userId");

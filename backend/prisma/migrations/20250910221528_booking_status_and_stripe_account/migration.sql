/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeAccountId]` on the table `Groomer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Groomer" ADD COLUMN "stripeAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Booking_groomerId_startTs_idx" ON "Booking"("groomerId", "startTs");

-- CreateIndex
CREATE UNIQUE INDEX "Groomer_stripeAccountId_key" ON "Groomer"("stripeAccountId");

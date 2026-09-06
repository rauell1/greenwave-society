ALTER TABLE "member_registrations"
  ADD COLUMN "membershipFeeStatus" TEXT NOT NULL DEFAULT 'not_required',
  ADD COLUMN "membershipFeePaidAt" TIMESTAMP(3);

CREATE TABLE "membership_payments" (
  "id" TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "checkoutRequestId" TEXT NOT NULL,
  "merchantRequestId" TEXT NOT NULL,
  "idempotencyKey" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "mpesaReceiptNumber" TEXT,
  "failureReason" TEXT,
  "resultCode" INTEGER,
  "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "rawCallback" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "membership_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "membership_payments_checkoutRequestId_key" ON "membership_payments"("checkoutRequestId");
CREATE UNIQUE INDEX "membership_payments_idempotencyKey_key" ON "membership_payments"("idempotencyKey");
CREATE INDEX "membership_payments_registrationId_createdAt_idx" ON "membership_payments"("registrationId", "createdAt");
CREATE INDEX "membership_payments_status_idx" ON "membership_payments"("status");

ALTER TABLE "membership_payments"
  ADD CONSTRAINT "membership_payments_registrationId_fkey"
  FOREIGN KEY ("registrationId") REFERENCES "member_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "membership_refunds" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "conversationId" TEXT,
  "originatorConversationId" TEXT,
  "resultCode" INTEGER,
  "resultDesc" TEXT,
  "rawResult" JSONB,
  "requestedBy" TEXT NOT NULL,
  "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "membership_refunds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "membership_refunds_conversationId_key" ON "membership_refunds"("conversationId");
CREATE UNIQUE INDEX "membership_refunds_originatorConversationId_key" ON "membership_refunds"("originatorConversationId");
CREATE INDEX "membership_refunds_paymentId_createdAt_idx" ON "membership_refunds"("paymentId", "createdAt");
CREATE INDEX "membership_refunds_status_idx" ON "membership_refunds"("status");

ALTER TABLE "membership_refunds"
  ADD CONSTRAINT "membership_refunds_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "membership_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

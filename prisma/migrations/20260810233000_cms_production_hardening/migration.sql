ALTER TABLE "cms_campaign_recipients"
  ADD COLUMN "deliveredAt" TIMESTAMP(3),
  ADD COLUMN "bouncedAt" TIMESTAMP(3),
  ADD COLUMN "complainedAt" TIMESTAMP(3),
  ADD COLUMN "lastEventAt" TIMESTAMP(3);

CREATE TABLE "cms_webhook_events" (
  "id" TEXT PRIMARY KEY,
  "provider" TEXT NOT NULL DEFAULT 'resend',
  "type" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "payload" TEXT NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3)
);
CREATE INDEX "cms_webhook_events_providerMessageId_idx" ON "cms_webhook_events"("providerMessageId");
CREATE INDEX "cms_webhook_events_type_receivedAt_idx" ON "cms_webhook_events"("type", "receivedAt");

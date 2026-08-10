CREATE TABLE "cms_campaigns" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "subject" TEXT NOT NULL,
  "preheader" TEXT, "eyebrow" TEXT NOT NULL DEFAULT 'Greenwave Update',
  "htmlBody" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'draft',
  "audience" TEXT NOT NULL DEFAULT 'newsletter', "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3), "createdById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "cms_campaign_recipients" (
  "id" TEXT PRIMARY KEY, "campaignId" TEXT NOT NULL, "subscriberId" TEXT,
  "email" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending',
  "providerMessageId" TEXT, "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT, "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "cms_campaigns_status_createdAt_idx" ON "cms_campaigns"("status", "createdAt");
CREATE INDEX "cms_campaigns_scheduledAt_idx" ON "cms_campaigns"("scheduledAt");
CREATE UNIQUE INDEX "cms_campaign_recipients_campaignId_email_key" ON "cms_campaign_recipients"("campaignId", "email");
CREATE INDEX "cms_campaign_recipients_campaignId_status_idx" ON "cms_campaign_recipients"("campaignId", "status");
CREATE INDEX "cms_campaign_recipients_email_idx" ON "cms_campaign_recipients"("email");
ALTER TABLE "cms_campaigns" ADD CONSTRAINT "cms_campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_campaigns" ADD CONSTRAINT "cms_campaigns_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_campaign_recipients" ADD CONSTRAINT "cms_campaign_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "cms_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_campaign_recipients" ADD CONSTRAINT "cms_campaign_recipients_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "newsletter_subscribers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
UPDATE "newsletter_subscribers" SET "unsubscribe_token" = md5(random()::text || clock_timestamp()::text || "id") WHERE "unsubscribe_token" IS NULL;

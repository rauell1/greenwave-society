CREATE TABLE "member_status_history" (
  "id" TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "reason" TEXT,
  "actorUserId" TEXT,
  "actorEmail" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "member_status_history_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "member_registrations"
  ADD COLUMN "onboardingEmailStatus" TEXT,
  ADD COLUMN "onboardingEmailAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "onboardingEmailLastError" TEXT,
  ADD COLUMN "onboardingEmailSentAt" TIMESTAMP(3);

CREATE TABLE "member_notes" (
  "id" TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "authorUserId" TEXT,
  "authorEmail" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "member_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "member_status_history_registrationId_createdAt_idx" ON "member_status_history"("registrationId", "createdAt");
CREATE INDEX "member_status_history_toStatus_createdAt_idx" ON "member_status_history"("toStatus", "createdAt");
CREATE INDEX "member_notes_registrationId_createdAt_idx" ON "member_notes"("registrationId", "createdAt");
ALTER TABLE "member_status_history" ADD CONSTRAINT "member_status_history_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "member_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_notes" ADD CONSTRAINT "member_notes_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "member_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "member_status_history" ("id", "registrationId", "fromStatus", "toStatus", "reason", "actorEmail", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text || "id"), "id", NULL, "status", 'Status at CMS migration', COALESCE("reviewedBy", 'system'), COALESCE("reviewedAt", "createdAt")
FROM "member_registrations";

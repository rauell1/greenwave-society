CREATE TABLE "cms_events" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL,
  "location" TEXT, "virtualUrl" TEXT, "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL, "capacity" INTEGER,
  "registrationOpensAt" TIMESTAMP(3), "registrationClosesAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'draft', "publishedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cms_events_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "cms_event_registrations" (
  "id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "memberRegistrationId" TEXT,
  "fullName" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "organization" TEXT,
  "status" TEXT NOT NULL DEFAULT 'registered', "attendanceStatus" TEXT NOT NULL DEFAULT 'not_checked_in',
  "checkedInAt" TIMESTAMP(3), "checkedInBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cms_event_registrations_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "baraza_registrations" ADD COLUMN "eventId" TEXT;
CREATE UNIQUE INDEX "cms_events_slug_key" ON "cms_events"("slug");
CREATE INDEX "cms_events_status_startsAt_idx" ON "cms_events"("status", "startsAt");
CREATE INDEX "cms_events_startsAt_idx" ON "cms_events"("startsAt");
CREATE UNIQUE INDEX "cms_event_registrations_eventId_email_key" ON "cms_event_registrations"("eventId", "email");
CREATE INDEX "cms_event_registrations_eventId_status_idx" ON "cms_event_registrations"("eventId", "status");
CREATE INDEX "cms_event_registrations_eventId_attendanceStatus_idx" ON "cms_event_registrations"("eventId", "attendanceStatus");
CREATE INDEX "cms_event_registrations_memberRegistrationId_idx" ON "cms_event_registrations"("memberRegistrationId");
CREATE INDEX "baraza_registrations_eventId_idx" ON "baraza_registrations"("eventId");
ALTER TABLE "cms_events" ADD CONSTRAINT "cms_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_events" ADD CONSTRAINT "cms_events_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cms_event_registrations" ADD CONSTRAINT "cms_event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "cms_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_event_registrations" ADD CONSTRAINT "cms_event_registrations_memberRegistrationId_fkey" FOREIGN KEY ("memberRegistrationId") REFERENCES "member_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "baraza_registrations" ADD CONSTRAINT "baraza_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "cms_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

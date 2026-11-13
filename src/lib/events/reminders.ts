import "server-only";

import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { APP_CONFIG } from "@/config/app.config";
import { sendEventReminderEmail } from "./email";
import { formatEventWhen } from "./nairobi-time";
import { hasCustomEventPage } from "./public-events";

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
// People who signed up in the last few hours already have a fresh confirmation email.
const RECENT_SIGNUP_MS = 3 * 60 * 60 * 1000;
const MAX_EMAILS_PER_RUN = 40;
// Resend's default limit is 2 requests per second.
const SEND_INTERVAL_MS = 600;

type Metadata = Record<string, unknown>;
const asMetadata = (value: Prisma.JsonValue | null): Metadata => (value && typeof value === "object" && !Array.isArray(value) ? (value as Metadata) : {});

/**
 * Emails a reminder to everyone registered for a published event that starts within the next
 * 24 hours, once per registration (tracked as metadata.reminderSentAt, the same field the admin
 * "send reminder" panel uses). Run hourly; each run sends at most MAX_EMAILS_PER_RUN.
 */
export async function sendDueEventReminders(now = new Date()) {
  const db = getDb();
  const events = await db.cmsEvent.findMany({
    where: { status: "published", startsAt: { gt: now, lte: new Date(now.getTime() + REMINDER_WINDOW_MS) } },
    include: { registrations: { where: { status: "registered", createdAt: { lt: new Date(now.getTime() - RECENT_SIGNUP_MS) } } } },
  });
  let sent = 0;
  let failed = 0;
  for (const event of events) {
    // Hand-built event pages (graduation, mental health circle) have their own reminder emails.
    if (hasCustomEventPage(event.slug)) continue;
    for (const registration of event.registrations) {
      if (sent + failed >= MAX_EMAILS_PER_RUN) return { sent, failed, more: true };
      const metadata = asMetadata(registration.metadata);
      if (metadata.reminderSentAt) continue;
      // Claim before sending so an overlapping run cannot email the same person twice.
      const claimed = await db.cmsEventRegistration.updateMany({
        where: { id: registration.id, updatedAt: registration.updatedAt },
        data: { metadata: { ...metadata, reminderSentAt: now.toISOString() } as Prisma.InputJsonValue },
      });
      if (claimed.count !== 1) continue;
      const ok = await sendEventReminderEmail({
        to: registration.email,
        name: registration.fullName,
        eventTitle: event.title,
        eventDate: formatEventWhen(event.startsAt, event.endsAt),
        location: event.location || event.virtualUrl || undefined,
        eventUrl: `${APP_CONFIG.url}/events/${event.slug}`,
      });
      if (ok) {
        sent++;
      } else {
        failed++;
        await db.cmsEventRegistration.update({ where: { id: registration.id }, data: { metadata: metadata as Prisma.InputJsonValue } });
      }
      await new Promise(resolve => setTimeout(resolve, SEND_INTERVAL_MS));
    }
  }
  if (sent || failed) logger.info("Event reminders processed", { sent, failed });
  return { sent, failed, more: false };
}

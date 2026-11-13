import "server-only";

import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { APP_CONFIG } from "@/config/app.config";
import { buildScheduledEventEmail, sendBatchEmails, type ScheduledEventEmailKind } from "./email";
import { formatEventWhen, fromNairobiParts, toNairobiParts } from "./nairobi-time";
import { hasCustomEventPage } from "./public-events";

const DAY_MS = 24 * 60 * 60 * 1000;
// People who signed up in the last few hours already have a fresh confirmation email.
const RECENT_SIGNUP_MS = 3 * 60 * 60 * 1000;
// Keeps one run inside the cron function's time limit; anything left goes out on the next run.
const MAX_EMAILS_PER_RUN = 500;

// Each email is sent once per registration and recorded in its metadata under this key.
// "reminderSentAt" is also what the admin roster's "Reminded" badge reads.
export const SCHEDULED_EMAIL_KEYS: Record<ScheduledEventEmailKind, string> = {
  reminder3d: "reminder3dSentAt",
  reminder1d: "reminderSentAt",
  thankYou: "thankYouSentAt",
};

type Metadata = Record<string, unknown>;
const asMetadata = (value: Prisma.JsonValue | null): Metadata => (value && typeof value === "object" && !Array.isArray(value) ? (value as Metadata) : {});

/** Start of the Nairobi calendar day `offset` days from `now`. */
function nairobiDay(now: Date, offset: number) {
  return fromNairobiParts(toNairobiParts(new Date(now.getTime() + offset * DAY_MS)).date, "00:00")!;
}

/**
 * Which events each email covers, as Nairobi calendar days, so a single daily cron run works.
 * Each window spans two days so a missed run catches up the next day instead of skipping.
 */
function windows(now: Date) {
  return {
    // Events starting two to three days from today (and not within the next day).
    reminder3d: { startsAt: { gte: nairobiDay(now, 2), lt: nairobiDay(now, 4) } },
    // Events starting later today or tomorrow.
    reminder1d: { startsAt: { gt: now, lt: nairobiDay(now, 2) } },
    // Events that ended yesterday or the day before.
    thankYou: { endsAt: { gte: nairobiDay(now, -2), lt: nairobiDay(now, 0) } },
  } satisfies Record<ScheduledEventEmailKind, Prisma.CmsEventWhereInput>;
}

/**
 * Sends the 3-day reminder, the day-before reminder and the post-event thank-you to everyone
 * registered (not waitlisted) for events created in the admin. Called by the Vercel cron job.
 */
export async function sendScheduledEventEmails(now = new Date()) {
  const db = getDb();
  const summary: Record<ScheduledEventEmailKind, number> = { reminder3d: 0, reminder1d: 0, thankYou: 0 };
  let failed = 0;
  let budget = MAX_EMAILS_PER_RUN;

  for (const [kind, where] of Object.entries(windows(now)) as [ScheduledEventEmailKind, Prisma.CmsEventWhereInput][]) {
    const key = SCHEDULED_EMAIL_KEYS[kind];
    const events = await db.cmsEvent.findMany({
      where: { ...where, status: { in: kind === "thankYou" ? ["published", "completed"] : ["published"] } },
      include: {
        registrations: {
          where: {
            status: "registered",
            ...(kind === "thankYou" ? { attendanceStatus: { not: "no_show" } } : { createdAt: { lt: new Date(now.getTime() - RECENT_SIGNUP_MS) } }),
          },
        },
      },
    });
    for (const event of events) {
      // Hand-built event pages (graduation, mental health circle) send their own emails.
      if (hasCustomEventPage(event.slug)) continue;
      // An event within a day gets the day-before reminder, not the 3-day one as well.
      if (kind === "reminder3d" && event.startsAt.getTime() - now.getTime() < DAY_MS) continue;
      const due = event.registrations.filter(registration => !asMetadata(registration.metadata)[key]).slice(0, budget);
      if (!due.length) continue;

      // Claim before sending so an overlapping run cannot email the same person twice.
      const claimed: typeof due = [];
      for (const registration of due) {
        const metadata = asMetadata(registration.metadata);
        const result = await db.cmsEventRegistration.updateMany({
          where: { id: registration.id, updatedAt: registration.updatedAt },
          data: { metadata: { ...metadata, [key]: now.toISOString() } as Prisma.InputJsonValue },
        });
        if (result.count === 1) claimed.push(registration);
      }

      const eventDetails = {
        eventTitle: event.title,
        eventDate: formatEventWhen(event.startsAt, event.endsAt),
        location: event.location || event.virtualUrl || undefined,
        eventUrl: `${APP_CONFIG.url}/events/${event.slug}`,
      };
      const results = await sendBatchEmails(claimed.map(registration => ({ to: registration.email, ...buildScheduledEventEmail(kind, { ...eventDetails, to: registration.email, name: registration.fullName }) })));
      for (const [index, ok] of results.entries()) {
        if (ok) {
          summary[kind]++;
          continue;
        }
        failed++;
        // Release the claim so the next run retries this person.
        const registration = claimed[index];
        const current = await db.cmsEventRegistration.findUnique({ where: { id: registration.id }, select: { metadata: true } });
        const { [key]: _released, ...rest } = asMetadata(current?.metadata ?? null);
        await db.cmsEventRegistration.update({ where: { id: registration.id }, data: { metadata: rest as Prisma.InputJsonValue } });
      }
      budget -= claimed.length;
      if (budget <= 0) return { sent: summary, failed, more: true };
    }
  }
  if (summary.reminder3d || summary.reminder1d || summary.thankYou || failed) logger.info("Scheduled event emails processed", { ...summary, failed });
  return { sent: summary, failed, more: false };
}

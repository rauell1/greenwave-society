import "server-only";

import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { registrationWindow } from "./registration";

// Events that have their own hand-built page link there instead of the generic /events/[slug].
const CUSTOM_EVENT_PAGES: Record<string, string> = {
  "graduation-cohort-1-2026": "/events/graduation-cohort-1",
  "suicide-prevention-awareness-2026": "/events/suicide-prevention-2026",
};

export function eventHref(slug: string) {
  return CUSTOM_EVENT_PAGES[slug] ?? `/events/${slug}`;
}

export function hasCustomEventPage(slug: string) {
  return slug in CUSTOM_EVENT_PAGES;
}

const PUBLIC_STATUSES = ["published", "completed", "cancelled"];

export async function getPublicEvents() {
  try {
    const events = await getDb().cmsEvent.findMany({
      where: { status: { in: PUBLIC_STATUSES } },
      orderBy: { startsAt: "desc" },
      take: 100,
      include: { _count: { select: { registrations: { where: { status: "registered" } } } } },
    });
    const now = new Date();
    return {
      upcoming: events.filter(event => event.status === "published" && event.endsAt >= now).reverse(),
      past: events.filter(event => event.status !== "published" || event.endsAt < now),
    };
  } catch (error) {
    logger.warn("Database unavailable when listing public events", { error });
    return { upcoming: [], past: [] };
  }
}

export async function getPublicEvent(slug: string) {
  const event = await getDb().cmsEvent.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: { where: { status: "registered" } } } } },
  });
  if (!event || !PUBLIC_STATUSES.includes(event.status)) return null;
  const window = registrationWindow(event);
  const placesLeft = event.capacity === null ? null : Math.max(0, event.capacity - event._count.registrations);
  return { event, window, placesLeft };
}

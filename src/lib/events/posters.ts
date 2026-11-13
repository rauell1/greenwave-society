import "server-only";

import { z } from "zod";
import { getDb } from "@/lib/db";
import { isAllowedImageSrc } from "@/lib/media/image-src";
import { POSTER_HEIGHT, POSTER_WIDTH, posterFor } from "./campaign-2026";

// Admins replace or remove an event's poster from its admin page. The choice is stored as a CMS
// content row (type "event-poster", slug = event id, so it survives slug renames) to avoid a
// schema migration; the campaign posters bundled in code are the fallback.
const CONTENT_TYPE = "event-poster";

export interface EventPoster {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const storedPosterSchema = z.union([
  z.object({ hidden: z.literal(true) }),
  z.object({ src: z.string().refine(isAllowedImageSrc), alt: z.string().max(300), width: z.number().int().positive().optional(), height: z.number().int().positive().optional() }),
]);
type StoredPoster = z.infer<typeof storedPosterSchema>;

function parseStored(metadata: string | null): StoredPoster | null {
  try {
    const result = storedPosterSchema.safeParse(metadata ? JSON.parse(metadata) : null);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function bundledPoster(event: { slug: string; title: string; startsAt: Date }): EventPoster | null {
  const poster = posterFor(event);
  return poster ? { ...poster, width: POSTER_WIDTH, height: POSTER_HEIGHT } : null;
}

function resolve(event: { slug: string; title: string; startsAt: Date }, stored: StoredPoster | null): EventPoster | null {
  if (stored && "hidden" in stored) return null;
  if (stored) return { src: stored.src, alt: stored.alt || `${event.title} poster`, width: stored.width ?? POSTER_WIDTH, height: stored.height ?? POSTER_HEIGHT };
  return bundledPoster(event);
}

/** Posters for several events at once, keyed by event id (events without one are left out). */
export async function getEventPosters(events: { id: string; slug: string; title: string; startsAt: Date }[]) {
  const rows = events.length
    ? await getDb().cmsContent.findMany({ where: { type: CONTENT_TYPE, slug: { in: events.map(event => event.id) } }, select: { slug: true, metadata: true } }).catch(() => [])
    : [];
  const stored = new Map(rows.map(row => [row.slug, parseStored(row.metadata)]));
  const posters = new Map<string, EventPoster>();
  for (const event of events) {
    const poster = resolve(event, stored.get(event.id) ?? null);
    if (poster) posters.set(event.id, poster);
  }
  return posters;
}

export async function getEventPoster(event: { id: string; slug: string; title: string; startsAt: Date }) {
  return (await getEventPosters([event])).get(event.id) ?? null;
}

/** What the admin poster panel shows: the current poster, and whether a bundled one exists. */
export async function getEventPosterState(event: { id: string; slug: string; title: string; startsAt: Date }) {
  const row = await getDb().cmsContent.findUnique({ where: { type_slug: { type: CONTENT_TYPE, slug: event.id } }, select: { metadata: true } });
  const stored = parseStored(row?.metadata ?? null);
  return {
    poster: resolve(event, stored),
    hidden: Boolean(stored && "hidden" in stored),
    customised: Boolean(stored),
    hasBundled: Boolean(bundledPoster(event)),
  };
}

export const posterChangeSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set"), src: z.string().trim().refine(isAllowedImageSrc, "Use an image uploaded to the Media library"), alt: z.string().trim().max(300).default(""), width: z.number().int().positive().optional(), height: z.number().int().positive().optional() }),
  z.object({ action: z.literal("remove") }),
  z.object({ action: z.literal("reset") }),
]);

export async function changeEventPoster(event: { id: string; title: string }, change: z.infer<typeof posterChangeSchema>, adminId: string) {
  const db = getDb();
  const where = { type_slug: { type: CONTENT_TYPE, slug: event.id } };
  if (change.action === "reset") {
    await db.cmsContent.deleteMany({ where: { type: CONTENT_TYPE, slug: event.id } });
    return;
  }
  const metadata = JSON.stringify(change.action === "remove" ? { hidden: true } : { src: change.src, alt: change.alt || `${event.title} poster`, width: change.width, height: change.height });
  await db.cmsContent.upsert({
    where,
    create: { type: CONTENT_TYPE, slug: event.id, title: `Poster: ${event.title}`, body: "Event poster setting.", metadata, status: "published", publishedAt: new Date(), createdById: adminId, updatedById: adminId },
    update: { title: `Poster: ${event.title}`, metadata, updatedById: adminId },
  });
}

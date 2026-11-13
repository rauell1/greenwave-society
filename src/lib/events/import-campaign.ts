import "server-only";

import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { CAMPAIGN_2026_EVENTS, TRIVIA_DATE } from "./campaign-2026";
import { fromNairobiParts } from "./nairobi-time";

/** Draft Trivia & Games Night events created by hand in the admin for 18 November. */
export async function unpublishedTriviaDrafts() {
  const dayStart = fromNairobiParts(TRIVIA_DATE, "00:00")!;
  const dayEnd = fromNairobiParts(TRIVIA_DATE, "23:59")!;
  return getDb().cmsEvent.findMany({ where: { status: "draft", title: { contains: "trivia", mode: "insensitive" }, startsAt: { gte: dayStart, lte: dayEnd } }, select: { id: true, title: true } });
}

export async function missingCampaignEvents() {
  const existing = await getDb().cmsEvent.findMany({ where: { slug: { in: CAMPAIGN_2026_EVENTS.map(event => event.slug) } }, select: { slug: true } });
  const have = new Set(existing.map(event => event.slug));
  return CAMPAIGN_2026_EVENTS.filter(event => !have.has(event.slug));
}

/** Creates any campaign events that are not in the database yet, published so sign-up opens. */
export async function importCampaignEvents(admin: { id: string; email: string }) {
  const created: string[] = [];
  for (const event of await missingCampaignEvents()) {
    const startsAt = fromNairobiParts(event.date, event.startTime ?? "00:00")!;
    const endsAt = fromNairobiParts(event.date, event.endTime ?? "23:59")!;
    await getDb().$transaction(async tx => {
      const row = await tx.cmsEvent.create({
        data: { slug: event.slug, title: event.title, description: event.description, location: null, timezone: "Africa/Nairobi", startsAt, endsAt, status: "published", publishedAt: new Date(), createdById: admin.id, updatedById: admin.id },
      });
      await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.EVENT_CREATED, actor: admin.email, actorUserId: admin.id, resourceType: "cms_event", resourceId: row.id, outcome: "SUCCESS", afterState: JSON.stringify({ slug: row.slug, title: row.title, status: row.status, source: "campaign-2026" }) } });
    });
    created.push(event.title);
  }
  for (const draft of await unpublishedTriviaDrafts()) {
    await getDb().$transaction(async tx => {
      const result = await tx.cmsEvent.updateMany({ where: { id: draft.id, status: "draft" }, data: { status: "published", publishedAt: new Date(), updatedById: admin.id } });
      if (result.count !== 1) return;
      await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.EVENT_STATUS_CHANGED, actor: admin.email, actorUserId: admin.id, resourceType: "cms_event", resourceId: draft.id, outcome: "SUCCESS", beforeState: JSON.stringify({ status: "draft" }), afterState: JSON.stringify({ status: "published", source: "campaign-2026" }) } });
    });
    created.push(`${draft.title} (published)`);
  }
  return created;
}

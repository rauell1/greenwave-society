import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { changeEventPoster, posterChangeSchema } from "@/lib/events/posters";
import { eventHref } from "@/lib/events/public-events";

// Replace, remove or restore the poster shown on an event's public card and page.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_UPDATE);
  if (!auth.ok) return auth.response;
  const parsed = posterChangeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid poster change", issues: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  const event = await getDb().cmsEvent.findUnique({ where: { id }, select: { id: true, slug: true, title: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  await changeEventPoster(event, parsed.data, auth.admin.id);
  await getDb().auditLog.create({ data: { action: AUDIT_ACTIONS.EVENT_UPDATED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_event", resourceId: id, outcome: "SUCCESS", afterState: JSON.stringify({ poster: parsed.data.action, ...(parsed.data.action === "set" ? { src: parsed.data.src } : {}) }) } });
  revalidatePath("/events");
  revalidatePath(eventHref(event.slug));
  return NextResponse.json({ ok: true });
}

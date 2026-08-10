import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { eventInputSchema } from "@/lib/events/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function GET() { const auth = await authorizeRoute(PERMISSIONS.EVENTS_READ); if (!auth.ok) return auth.response; const events = await getDb().cmsEvent.findMany({ orderBy: { startsAt: "desc" }, include: { _count: { select: { registrations: true, legacyBaraza: true } } } }); return NextResponse.json({ events }); }
export async function POST(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_CREATE); if (!auth.ok) return auth.response;
  const parsed = eventInputSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid event", issues: parsed.error.flatten() }, { status: 400 });
  const event = await getDb().$transaction(async tx => { const created = await tx.cmsEvent.create({ data: { ...parsed.data, virtualUrl: parsed.data.virtualUrl || null, createdById: auth.admin.id, updatedById: auth.admin.id } }); await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.EVENT_CREATED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_event", resourceId: created.id, outcome: "SUCCESS", afterState: JSON.stringify({ slug: created.slug, title: created.title, status: created.status }) } }); return created; });
  return NextResponse.json({ event: { id: event.id, slug: event.slug, title: event.title, status: event.status } }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { canTransitionEvent } from "@/lib/events/validation";
const schema = z.object({ status: z.enum(["published", "cancelled", "completed"]) });
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_PUBLISH); if (!auth.ok) return auth.response;
  const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { id } = await params; const before = await getDb().cmsEvent.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!canTransitionEvent(before.status, parsed.data.status)) return NextResponse.json({ error: `Cannot move an event from ${before.status} to ${parsed.data.status}.` }, { status: 409 });
  if (parsed.data.status === "completed" && new Date() < before.endsAt) return NextResponse.json({ error: "An event cannot be completed before its end time." }, { status: 409 });
  const changed = await getDb().$transaction(async tx => { const result = await tx.cmsEvent.updateMany({ where: { id, status: before.status }, data: { status: parsed.data.status, publishedAt: parsed.data.status === "published" ? new Date() : before.publishedAt, updatedById: auth.admin.id } }); if (result.count !== 1) return false; await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.EVENT_STATUS_CHANGED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_event", resourceId: id, outcome: "SUCCESS", beforeState: JSON.stringify({ status: before.status }), afterState: JSON.stringify({ status: parsed.data.status }) } }); return true; });
  return changed ? NextResponse.json({ status: parsed.data.status }) : NextResponse.json({ error: "Event changed in another request" }, { status: 409 });
}

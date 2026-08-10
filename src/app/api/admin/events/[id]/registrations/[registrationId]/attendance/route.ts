import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { attendanceSchema } from "@/lib/events/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; registrationId: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_MANAGE_ATTENDANCE); if (!auth.ok) return auth.response;
  const parsed = attendanceSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid attendance" }, { status: 400 });
  const { id, registrationId } = await params;
  const updated = await getDb().$transaction(async tx => {
    const event = await tx.cmsEvent.findUnique({ where: { id }, select: { status: true } }); if (!event || !["published", "completed"].includes(event.status)) return "EVENT_CLOSED" as const;
    const registration = await tx.cmsEventRegistration.findFirst({ where: { id: registrationId, eventId: id }, select: { status: true } }); if (!registration) return "NOT_FOUND" as const;
    if (registration.status !== "registered") return "NOT_CONFIRMED" as const;
    await tx.cmsEventRegistration.update({ where: { id: registrationId }, data: { attendanceStatus: parsed.data.attendanceStatus, checkedInAt: parsed.data.attendanceStatus === "checked_in" ? new Date() : null, checkedInBy: parsed.data.attendanceStatus === "checked_in" ? auth.admin.email : null } });
    await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.EVENT_ATTENDANCE_UPDATED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_event_registration", resourceId: registrationId, outcome: "SUCCESS", afterState: JSON.stringify({ attendanceStatus: parsed.data.attendanceStatus }) } }); return "OK" as const;
  });
  if (updated === "OK") return NextResponse.json({ success: true });
  return NextResponse.json({ error: updated === "NOT_FOUND" ? "Registration not found" : updated === "NOT_CONFIRMED" ? "Only confirmed attendees can receive attendance status." : "Attendance cannot be changed for this event state." }, { status: updated === "NOT_FOUND" ? 404 : 409 });
}

import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { attendeeSchema } from "@/lib/events/validation";
import { registerAttendee } from "@/lib/events/registration";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_MANAGE_ATTENDANCE);
  if (!auth.ok) return auth.response;
  const parsed = attendeeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid attendee", issues: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  const result = await registerAttendee({ id }, parsed.data, { email: auth.admin.email, id: auth.admin.id });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ attendee: { id: result.registration.id, status: result.registration.status } }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_MANAGE_ATTENDANCE);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "clean_test_records") {
    const deleted = await getDb().cmsEventRegistration.deleteMany({
      where: {
        eventId: id,
        OR: [
          { fullName: { contains: "test", mode: "insensitive" } },
          { email: { contains: "test", mode: "insensitive" } },
        ],
      },
    });

    await getDb().auditLog.create({
      data: {
        action: AUDIT_ACTIONS.EVENT_ATTENDEE_DELETED,
        actor: auth.admin.email,
        actorUserId: auth.admin.id,
        resourceType: "cms_event",
        resourceId: id,
        outcome: "SUCCESS",
        afterState: JSON.stringify({ action: "clean_test_records", count: deleted.count }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned ${deleted.count} test registration(s).`,
      count: deleted.count,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { csvCell } from "@/lib/members/validation";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_EXPORT); if (!auth.ok) return auth.response;
  const { id } = await params;
  const event = await getDb().cmsEvent.findUnique({ where: { id }, include: { registrations: { orderBy: { createdAt: "asc" } } } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  await getDb().auditLog.create({ data: { action: "EVENT_ATTENDEES_EXPORTED", actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_event", resourceId: id, outcome: "SUCCESS", detail: `Exported ${event.registrations.length} attendee records` } });
  const header = ["Name", "Email", "Phone", "Organization", "Registration status", "Attendance", "Checked in at"];
  const rows = event.registrations.map(item => [item.fullName, item.email, item.phone, item.organization, item.status, item.attendanceStatus, item.checkedInAt?.toISOString()].map(csvCell).join(","));
  return new NextResponse([header.map(csvCell).join(","), ...rows].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${event.slug}-attendees.csv"`, "Cache-Control": "no-store" } });
}

import { NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_READ); 
  if (!auth.ok) return auth.response;

  const { id } = await params; 
  const db = getDb();
  
  const event = await db.cmsEvent.findUnique({
    where: { id },
    include: {
      registrations: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Convert to CSV
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Organization",
    "Status",
    "Attendance",
    "Emergency Contact Name",
    "Emergency Contact Phone",
    "Dietary Restrictions",
    "Liability Consent",
    "Attended Before",
    "Expectations",
    "Makes You Happy",
    "Accessibility Needs",
    "Suicidal Ideation",
    "Knows Someone Attempted",
    "Stigma Reason",
    "Registered At"
  ];

  const rows = event.registrations.map(reg => {
    const meta = (reg.metadata as Record<string, any>) || {};
    
    return [
      reg.fullName,
      reg.email,
      reg.phone || "",
      reg.organization || "",
      reg.status,
      reg.attendanceStatus,
      meta.emergencyContactName || "",
      meta.emergencyContactPhone || "",
      meta.dietaryRestrictions || "",
      meta.liabilityConsent ? "Yes" : "No",
      meta.attendedBefore || "",
      meta.expectations || "",
      meta.makesYouHappy || "",
      meta.accessibilityNeeds || "",
      meta.suicidalIdeation || "",
      meta.knowsSomeoneAttempted || "",
      meta.stigmaReason || "",
      reg.createdAt.toISOString()
    ].map(field => {
      // Escape quotes and wrap in quotes to ensure valid CSV
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  await db.auditLog.create({
    data: {
      action: AUDIT_ACTIONS.EVENT_ATTENDEES_EXPORTED,
      actor: auth.admin.email,
      actorUserId: auth.admin.id,
      resourceType: "cms_event_registrations",
      resourceId: id,
      outcome: "SUCCESS",
      detail: `Exported ${event.registrations.length} registrations`
    }
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="event_${event.slug}_attendees.csv"`,
    }
  });
}

import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_READ); 
  if (!auth.ok) return auth.response;

  const { id } = await params; 
  const { searchParams } = new URL(req.url);
  const segment = searchParams.get("segment")?.toLowerCase().trim(); // "all" | "graduands" | "vendors" | "guests"

  const db = getDb();
  
  const event = await db.cmsEvent.findUnique({
    where: { id },
    include: {
      registrations: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let registrations = event.registrations;

  if (segment && segment !== "all") {
    registrations = registrations.filter(r => {
      const meta = (r.metadata as Record<string, any>) || {};
      const isVendor = Boolean(meta.vendorName);
      const isGraduand = meta.role === "graduand";
      if (segment === "graduands") return isGraduand;
      if (segment === "vendors") return isVendor;
      if (segment === "guests") return !isGraduand && !isVendor;
      return true;
    });
  }

  const headers = [
    "Ticket Number",
    "Full Name",
    "Email",
    "Phone",
    "Organization / Brand",
    "Registration Type",
    "Role / Category",
    "Headcount",
    "Registration Status",
    "Attendance Status",
    "Checked In At",
    "Checked In By",
    "Dietary / Notes / Description",
    "Registered At"
  ];

  const rows = registrations.map(reg => {
    const meta = (reg.metadata as Record<string, any>) || {};
    
    const ticketNumber = `GW-${reg.id.slice(-6).toUpperCase()}`;
    const isVendor = Boolean(meta.vendorName);
    const isGraduand = meta.role === "graduand";
    const regType = isVendor ? "Market Vendor" : isGraduand ? "Empower 360 Graduand" : "Guest / Supporter";
    const roleOrCategory = meta.category || meta.role || (isVendor ? "Vendor" : "Attendee");
    const headcount = meta.guestCount || 1;
    const notes = meta.dietaryOrNotes || meta.productDescription || meta.dietaryRestrictions || "";
    const checkedInAt = reg.checkedInAt ? reg.checkedInAt.toISOString() : "";
    const checkedInBy = reg.checkedInBy || "";

    return [
      ticketNumber,
      reg.fullName,
      reg.email,
      reg.phone || "",
      reg.organization || meta.vendorName || "",
      regType,
      roleOrCategory,
      headcount,
      reg.status,
      reg.attendanceStatus,
      checkedInAt,
      checkedInBy,
      notes,
      reg.createdAt.toISOString()
    ].map(field => {
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
      detail: `Exported ${registrations.length} registrations (${segment || "all"})`
    }
  });

  const filePrefix = segment && segment !== "all" ? `event_${event.slug}_${segment}` : `event_${event.slug}_all`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filePrefix}_roster.csv"`,
    }
  });
}

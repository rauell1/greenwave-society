import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function buildRegistrationPayload(reg: any, meta: Record<string, any>) {
  const isVendor = Boolean(meta.vendorName);
  const isGraduand = meta.role === "graduand";
  
  let roleTitle = "Guest";
  let specialInstructions = "Issue Guest Pass. Direct to General Seating and Community Market.";

  if (isGraduand) {
    roleTitle = "Empower 360 Graduand (Cohort I)";
    specialInstructions = "Issue Graduation Certificate & Honor Badge. Escort to Front Reserved Graduand Seating.";
  } else if (isVendor) {
    roleTitle = `Market Vendor (${meta.category || "Sustainable Goods"})`;
    specialInstructions = `Confirm Vendor Category (${meta.category || "General"}). Escort to Assigned Table & Chairs at Ubunifu Hub Market Area.`;
  } else if (meta.role === "family_friend") {
    roleTitle = "Family & Supporter";
    specialInstructions = "Welcome family member. Guide to Family Reserved Rows adjacent to Graduands.";
  } else if (meta.role === "partner_collaborator") {
    roleTitle = "Partner & Mentor";
    specialInstructions = "Welcome partner or mentor. Guide to Partner Networking & Reserved Seating.";
  }

  return {
    id: reg.id,
    fullName: reg.fullName,
    email: reg.email,
    phone: reg.phone || "",
    organization: reg.organization || meta.vendorName || "",
    attendanceStatus: reg.attendanceStatus,
    checkedInAt: reg.checkedInAt,
    role: roleTitle,
    rawRole: meta.role || (isVendor ? "vendor" : "guest"),
    isGraduand,
    isVendor,
    vendorCategory: meta.category || null,
    vendorName: meta.vendorName || null,
    guestCount: meta.guestCount || 1,
    ticketNumber: `GW-${reg.id.slice(-6).toUpperCase()}`,
    specialInstructions,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token");

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const db = getDb();
    const registration = await db.cmsEventRegistration.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startsAt: true,
            location: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration pass not found" }, { status: 404 });
    }

    const meta = (registration.metadata as Record<string, any>) || {};

    // Validate security token if token was issued
    if (meta.checkInToken && token && meta.checkInToken !== token) {
      return NextResponse.json({ error: "Invalid check-in token or ticket signature" }, { status: 403 });
    }

    // Check if already checked in
    if (registration.attendanceStatus === "checked_in") {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        registration: buildRegistrationPayload(registration, meta),
        event: registration.event,
      });
    }

    // Mark as checked in
    const updated = await db.cmsEventRegistration.update({
      where: { id },
      data: {
        attendanceStatus: "checked_in",
        checkedInAt: new Date(),
        checkedInBy: "door_qr_scanner",
      },
    });

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      registration: buildRegistrationPayload(updated, meta),
      event: registration.event,
    });
  } catch (error) {
    console.error("[EVENT_CHECK_IN_GET]", error);
    return NextResponse.json(
      { error: "Failed to process attendance check-in" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, token, status = "checked_in" } = body;

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const db = getDb();
    const registration = await db.cmsEventRegistration.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const meta = (registration.metadata as Record<string, any>) || {};

    if (meta.checkInToken && token && meta.checkInToken !== token) {
      return NextResponse.json({ error: "Invalid check-in token" }, { status: 403 });
    }

    const newAttendanceStatus = status === "not_checked_in" ? "not_checked_in" : "checked_in";
    const checkedInAt = newAttendanceStatus === "checked_in" ? new Date() : null;

    const updated = await db.cmsEventRegistration.update({
      where: { id },
      data: {
        attendanceStatus: newAttendanceStatus,
        checkedInAt,
        checkedInBy: newAttendanceStatus === "checked_in" ? "door_manual_toggle" : null,
      },
    });

    return NextResponse.json({
      success: true,
      registration: buildRegistrationPayload(updated, meta),
    });
  } catch (error) {
    console.error("[EVENT_CHECK_IN_POST]", error);
    return NextResponse.json(
      { error: "Failed to update attendance status" },
      { status: 500 }
    );
  }
}

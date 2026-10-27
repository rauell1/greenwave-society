import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { isExecutiveCommitteeMember } from "@/lib/careers-admin";

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
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Greenwave Society admin session required." },
        { status: 401 }
      );
    }

    const isExecutive = await isExecutiveCommitteeMember(admin);
    if (!isExecutive) {
      return NextResponse.json(
        { error: "Forbidden: Only Executive Committee members are authorized to scan and verify attendee passes." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token");

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const db = getDb();
    let registration = await db.cmsEventRegistration.findUnique({
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
      const cleanId = id.trim();
      const suffix = cleanId.replace(/^GW-/i, "").toLowerCase();
      registration = await db.cmsEventRegistration.findFirst({
        where: {
          OR: [
            { id: { endsWith: suffix } },
            { email: { equals: cleanId, mode: "insensitive" } },
            { phone: { equals: cleanId } },
          ],
        },
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
    }

    if (!registration) {
      return NextResponse.json({ error: "Registration pass not found" }, { status: 404 });
    }

    const meta = (registration.metadata as Record<string, any>) || {};

    // Validate security token if present in registration metadata and provided
    const expectedToken = meta.checkInToken || meta.ticketToken;
    if (token && expectedToken && expectedToken !== token) {
      return NextResponse.json(
        { error: "Invalid or missing ticket security token" },
        { status: 403 }
      );
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
        checkedInBy: admin.email || "admin_door_scanner",
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
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Greenwave Society admin session required." },
        { status: 401 }
      );
    }

    const isExecutive = await isExecutiveCommitteeMember(admin);
    if (!isExecutive) {
      return NextResponse.json(
        { error: "Forbidden: Only Executive Committee members are authorized to scan and verify attendee passes." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { id, token, status = "checked_in" } = body;

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const db = getDb();
    let registration = await db.cmsEventRegistration.findUnique({
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
      const cleanId = id.trim();
      const suffix = cleanId.replace(/^GW-/i, "").toLowerCase();
      registration = await db.cmsEventRegistration.findFirst({
        where: {
          OR: [
            { id: { endsWith: suffix } },
            { email: { equals: cleanId, mode: "insensitive" } },
            { phone: { equals: cleanId } },
          ],
        },
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
    }

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const meta = (registration.metadata as Record<string, any>) || {};

    const expectedToken = meta.checkInToken || meta.ticketToken;
    if (token && expectedToken && expectedToken !== token) {
      return NextResponse.json(
        { error: "Invalid ticket security token" },
        { status: 403 }
      );
    }

    const isCheckingIn = status === "checked_in";
    const updated = await db.cmsEventRegistration.update({
      where: { id: registration.id },
      data: {
        attendanceStatus: status,
        checkedInAt: isCheckingIn ? new Date() : null,
        checkedInBy: isCheckingIn ? (admin.email || "admin_door_scanner") : null,
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

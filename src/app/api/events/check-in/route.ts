import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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
        registration: {
          id: registration.id,
          fullName: registration.fullName,
          email: registration.email,
          phone: registration.phone,
          organization: registration.organization,
          attendanceStatus: registration.attendanceStatus,
          checkedInAt: registration.checkedInAt,
          role: meta.role || (meta.vendorName ? "Vendor" : "Guest"),
          guestCount: meta.guestCount || 1,
          ticketNumber: `GW-${registration.id.slice(-6).toUpperCase()}`,
        },
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
      registration: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        organization: updated.organization,
        attendanceStatus: updated.attendanceStatus,
        checkedInAt: updated.checkedInAt,
        role: meta.role || (meta.vendorName ? "Vendor" : "Guest"),
        guestCount: meta.guestCount || 1,
        ticketNumber: `GW-${updated.id.slice(-6).toUpperCase()}`,
      },
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
      registration: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        organization: updated.organization,
        attendanceStatus: updated.attendanceStatus,
        checkedInAt: updated.checkedInAt,
        role: meta.role || (meta.vendorName ? "Vendor" : "Guest"),
        guestCount: meta.guestCount || 1,
        ticketNumber: `GW-${updated.id.slice(-6).toUpperCase()}`,
      },
    });
  } catch (error) {
    console.error("[EVENT_CHECK_IN_POST]", error);
    return NextResponse.json(
      { error: "Failed to update attendance status" },
      { status: 500 }
    );
  }
}

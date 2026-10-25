import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "graduation-cohort-1-2026";
    const search = searchParams.get("q")?.toLowerCase().trim();

    const db = getDb();
    const event = await db.cmsEvent.findUnique({
      where: { slug },
      include: {
        registrations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let registrations = event.registrations.map((r) => {
      const meta = (r.metadata as Record<string, any>) || {};
      return {
        id: r.id,
        fullName: r.fullName,
        email: r.email,
        phone: r.phone || "",
        organization: r.organization || "",
        status: r.status,
        attendanceStatus: r.attendanceStatus,
        checkedInAt: r.checkedInAt,
        role: meta.role || (meta.vendorName ? "Vendor" : "Guest"),
        guestCount: Number(meta.guestCount || 1),
        ticketNumber: `GW-${r.id.slice(-6).toUpperCase()}`,
        checkInToken: meta.checkInToken || "",
      };
    });

    if (search) {
      registrations = registrations.filter(
        (r) =>
          r.fullName.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search) ||
          r.phone.toLowerCase().includes(search) ||
          r.ticketNumber.toLowerCase().includes(search) ||
          r.organization.toLowerCase().includes(search)
      );
    }

    const totalRegistrations = event.registrations.length;
    const checkedInCount = event.registrations.filter((r) => r.attendanceStatus === "checked_in").length;
    const pendingCount = totalRegistrations - checkedInCount;
    
    // Total headcount including +1s
    const totalExpectedHeadcount = event.registrations.reduce((acc, r) => {
      const meta = (r.metadata as Record<string, any>) || {};
      return acc + (Number(meta.guestCount) || 1);
    }, 0);

    const checkedInHeadcount = event.registrations
      .filter((r) => r.attendanceStatus === "checked_in")
      .reduce((acc, r) => {
        const meta = (r.metadata as Record<string, any>) || {};
        return acc + (Number(meta.guestCount) || 1);
      }, 0);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        startsAt: event.startsAt,
        location: event.location,
      },
      stats: {
        totalRegistrations,
        checkedInCount,
        pendingCount,
        totalExpectedHeadcount,
        checkedInHeadcount,
      },
      registrations,
    });
  } catch (error) {
    console.error("[EVENT_CHECK_IN_LIST_GET]", error);
    return NextResponse.json(
      { error: "Failed to load attendees list" },
      { status: 500 }
    );
  }
}

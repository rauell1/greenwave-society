import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Greenwave Society admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "graduation-cohort-1-2026";
    const search = searchParams.get("q")?.toLowerCase().trim();
    const segment = searchParams.get("segment")?.toLowerCase().trim(); // "all" | "graduands" | "vendors" | "guests"

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
      const isVendor = Boolean(meta.vendorName);
      const isGraduand = meta.role === "graduand";

      let segmentType: "graduand" | "vendor" | "guest" = "guest";
      if (isGraduand) segmentType = "graduand";
      else if (isVendor) segmentType = "vendor";

      return {
        id: r.id,
        fullName: r.fullName,
        email: r.email,
        phone: r.phone || "",
        organization: r.organization || meta.vendorName || "",
        status: r.status,
        attendanceStatus: r.attendanceStatus,
        checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : null,
        role: isGraduand
          ? "Empower 360 Graduand"
          : isVendor
          ? `Market Vendor (${meta.category || "General"})`
          : meta.role === "family_friend"
          ? "Family & Supporter"
          : meta.role === "partner_collaborator"
          ? "Partner & Mentor"
          : "Community Guest",
        rawRole: meta.role || (isVendor ? "vendor" : "guest"),
        segmentType,
        isGraduand,
        isVendor,
        vendorCategory: meta.category || null,
        guestCount: meta.guestCount || 1,
        ticketNumber: `GW-${r.id.slice(-6).toUpperCase()}`,
      };
    });

    // Segment Filter
    if (segment && segment !== "all") {
      if (segment === "graduand" || segment === "graduands") {
        registrations = registrations.filter((r) => r.isGraduand);
      } else if (segment === "vendor" || segment === "vendors") {
        registrations = registrations.filter((r) => r.isVendor);
      } else if (segment === "guest" || segment === "guests") {
        registrations = registrations.filter((r) => !r.isGraduand && !r.isVendor);
      }
    }

    // Search query filter
    if (search) {
      registrations = registrations.filter(
        (r) =>
          r.fullName.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search) ||
          r.phone.includes(search) ||
          r.ticketNumber.toLowerCase().includes(search) ||
          r.organization.toLowerCase().includes(search)
      );
    }

    // Stats
    const totalRegistrations = event.registrations.length;
    const checkedInCount = event.registrations.filter((r) => r.attendanceStatus === "checked_in").length;
    const pendingCount = totalRegistrations - checkedInCount;

    // Graduand stats
    const allGraduands = event.registrations.filter((r) => {
      const meta = (r.metadata as Record<string, any>) || {};
      return meta.role === "graduand";
    });
    const checkedInGraduands = allGraduands.filter((r) => r.attendanceStatus === "checked_in").length;

    // Vendor stats
    const allVendors = event.registrations.filter((r) => {
      const meta = (r.metadata as Record<string, any>) || {};
      return Boolean(meta.vendorName);
    });
    const checkedInVendors = allVendors.filter((r) => r.attendanceStatus === "checked_in").length;

    // Guest stats
    const totalGuests = totalRegistrations - allGraduands.length - allVendors.length;
    const checkedInGuests = checkedInCount - checkedInGraduands - checkedInVendors;

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
        totalGraduands: allGraduands.length,
        checkedInGraduands,
        totalVendors: allVendors.length,
        checkedInVendors,
        totalGuests,
        checkedInGuests,
      },
      registrations,
    });
  } catch (error) {
    console.error("[EVENT_CHECK_IN_LIST]", error);
    return NextResponse.json(
      { error: "Failed to load check-in list" },
      { status: 500 }
    );
  }
}

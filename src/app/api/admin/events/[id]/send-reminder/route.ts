import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/policy";
import { isExecutiveCommitteeMember } from "@/lib/careers-admin";
import { sendOneDayEventReminder } from "@/lib/events/email";
import { SITE_URL } from "@/lib/email-template";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasEventsPermission =
      hasPermission(admin, PERMISSIONS.EVENTS_UPDATE) ||
      hasPermission(admin, PERMISSIONS.COMMUNICATIONS_SEND);
    const isExecutive = await isExecutiveCommitteeMember(admin);

    if (!hasEventsPermission && !isExecutive) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to broadcast event reminders." },
        { status: 403 }
      );
    }

    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const segment = body.segment || "all"; // "all" | "graduands" | "vendors" | "guests"
    const forceResend = Boolean(body.forceResend);

    const db = getDb();
    const event = await db.cmsEvent.findUnique({
      where: { id },
      include: {
        registrations: {
          where: {
            status: { not: "cancelled" },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Filter registrations by segment
    const targetRegistrations = event.registrations.filter((r) => {
      const meta = (r.metadata as Record<string, any>) || {};
      const isGraduand = meta.role === "graduand";
      const isVendor = Boolean(meta.vendorName || meta.type === "vendor");

      if (segment === "graduands") return isGraduand;
      if (segment === "vendors") return isVendor;
      if (segment === "guests") return !isGraduand && !isVendor;
      return true; // "all"
    });

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const reg of targetRegistrations) {
      const meta = (reg.metadata as Record<string, any>) || {};
      
      // Skip if already sent and forceResend is false
      if (!forceResend && meta.reminderSentAt) {
        skippedCount++;
        continue;
      }

      const isGraduand = meta.role === "graduand";
      const isVendor = Boolean(meta.vendorName || meta.type === "vendor");

      const checkInToken = meta.checkInToken || meta.ticketToken || crypto.randomUUID();
      const ticketNumber = `GW-${reg.id.slice(-6).toUpperCase()}`;
      const checkInUrl = `${SITE_URL}/events/check-in?id=${reg.id}&token=${checkInToken}`;

      let roleType: "graduand" | "vendor" | "guest" | "family_friend" | "partner_collaborator" | "community_guest" = "guest";
      if (isGraduand) {
        roleType = "graduand";
      } else if (isVendor) {
        roleType = "vendor";
      } else if (meta.role === "family_friend") {
        roleType = "family_friend";
      } else if (meta.role === "partner_collaborator") {
        roleType = "partner_collaborator";
      } else if (meta.role === "community_guest") {
        roleType = "community_guest";
      }

      try {
        await sendOneDayEventReminder({
          to: reg.email,
          name: reg.fullName,
          role: roleType,
          isVendor,
          ticketNumber,
          checkInUrl,
          passUrl: `${SITE_URL}/events/pass?id=${reg.id}&token=${checkInToken}`,
          vendorName: meta.vendorName,
          category: meta.category,
          vendorCategory: meta.category,
          guestCount: meta.guestCount || 1,
          eventDate: "Friday, 30th October 2026, 10:00 AM - 3:00 PM EAT (Vendor Setup 9:30 AM)",
          location: event.location || "Ubunifu Hub, Garden Estate, Nairobi",
        });

        // Record reminder timestamp in metadata
        await db.cmsEventRegistration.update({
          where: { id: reg.id },
          data: {
            metadata: {
              ...meta,
              checkInToken,
              ticketToken: checkInToken,
              reminderSentAt: new Date().toISOString(),
              reminderSentBy: admin.email || "admin",
            },
          },
        });

        sentCount++;
      } catch (err) {
        console.error(`[REMINDER_SEND_ERROR] Failed for ${reg.email}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      segment,
      totalTargeted: targetRegistrations.length,
      sentCount,
      skippedCount,
      errorCount,
      message: `Dispatched ${sentCount} reminders (${skippedCount} skipped, ${errorCount} errors) for segment: ${segment}.`,
    });
  } catch (error) {
    console.error("[EVENT_SEND_REMINDER_POST]", error);
    return NextResponse.json(
      { error: "Failed to broadcast 1-day reminders" },
      { status: 500 }
    );
  }
}

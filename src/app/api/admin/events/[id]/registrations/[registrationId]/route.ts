import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { isExecutiveCommitteeMember } from "@/lib/careers-admin";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { sendOneDayEventReminder } from "@/lib/events/email";
import { SITE_URL } from "@/lib/email-template";
import crypto from "crypto";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isExecutive = await isExecutiveCommitteeMember(admin);
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_MANAGE_ATTENDANCE);

  if (!auth.ok && !isExecutive) {
    return auth.response;
  }

  const { id: eventId, registrationId } = await params;

  try {
    const deleted = await getDb().$transaction(async (tx) => {
      const registration = await tx.cmsEventRegistration.findFirst({
        where: { id: registrationId, eventId },
        select: { id: true, fullName: true, email: true, status: true },
      });

      if (!registration) {
        return null;
      }

      await tx.cmsEventRegistration.delete({
        where: { id: registrationId },
      });

      await tx.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.EVENT_ATTENDEE_DELETED,
          actor: admin.email,
          actorUserId: admin.id,
          resourceType: "cms_event_registration",
          resourceId: registrationId,
          outcome: "SUCCESS",
          beforeState: JSON.stringify({
            fullName: registration.fullName,
            email: registration.email,
            status: registration.status,
          }),
        },
      });

      return registration;
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Registration record not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted registration for ${deleted.fullName} (${deleted.email}).`,
    });
  } catch (error: any) {
    console.error("[EVENT_REGISTRATION_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete registration record." },
      { status: 500 }
    );
  }
}

// POST: On-demand dispatch of digital pass with scannable QR code for this specific attendee
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isExecutive = await isExecutiveCommitteeMember(admin);
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_MANAGE_ATTENDANCE);

  if (!auth.ok && !isExecutive) {
    return auth.response;
  }

  const { id: eventId, registrationId } = await params;
  const db = getDb();

  const reg = await db.cmsEventRegistration.findFirst({
    where: { id: registrationId, eventId },
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

  if (!reg) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const meta = (reg.metadata as Record<string, any>) || {};
  const isGraduand = meta.role === "graduand";
  const isVendor = Boolean(meta.vendorName || meta.type === "vendor");

  const checkInToken = meta.checkInToken || meta.ticketToken || crypto.randomUUID();
  const ticketNumber = `GW-${reg.id.slice(-6).toUpperCase()}`;
  const checkInUrl = `${SITE_URL}/events/check-in?id=${reg.id}&token=${checkInToken}`;
  const passUrl = `${SITE_URL}/events/pass?id=${reg.id}&token=${checkInToken}`;

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
    const sent = await sendOneDayEventReminder({
      to: reg.email,
      name: reg.fullName,
      role: roleType,
      isVendor,
      ticketNumber,
      checkInUrl,
      passUrl,
      vendorName: meta.vendorName,
      category: meta.category,
      vendorCategory: meta.category,
      guestCount: meta.guestCount || 1,
      eventDate: "Friday, 30th October 2026, 10:00 AM - 3:00 PM EAT (Vendor Setup 9:30 AM)",
      location: reg.event?.location || "Ubunifu Hub, Garden Estate, Nairobi",
    });

    if (sent) {
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
    }

    return NextResponse.json({
      success: true,
      message: `Digital pass and event details dispatched to ${reg.email}.`,
    });
  } catch (err: any) {
    console.error("[SEND_SINGLE_PASS_ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch digital pass email." },
      { status: 500 }
    );
  }
}

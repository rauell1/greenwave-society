import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendGraduationGuestConfirmation } from "@/lib/events/email";
import { generateQrDataUrl } from "@/lib/events/qr";
import { SITE_URL } from "@/lib/email-template";
import { z } from "zod";
import crypto from "crypto";

const guestRsvpSchema = z.object({
  fullName: z.string().trim().min(2, "Your full name is required").max(100),
  email: z.string().trim().email("Please provide a valid email address").max(120),
  phone: z.string().trim().min(5, "Please provide a valid WhatsApp or phone number").max(25),
  role: z.enum([
    "graduand",
    "family_friend",
    "partner_collaborator",
    "community_guest",
  ], {
    message: "Please choose your role for this event",
  }),
  guestCount: z.coerce.number().int().min(1, "At least 1 attendee is required").max(6, "Maximum 6 attendees per reservation").default(1),
  organization: z.string().trim().max(100).optional(),
  dietaryOrNotes: z.string().trim().max(500).optional(),
});

const EVENT_SLUG = "graduation-cohort-1-2026";
const EVENT_TITLE = "Empower 360: Ad Hoc Cohort I Graduation & Community Market";
const EVENT_LOCATION = "Ubunifu Hub, Nairobi, Kenya";
const EVENT_DATE_STR = "Friday, 30th October 2026, 10:30 AM EAT";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parsed = guestRsvpSchema.safeParse(json);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError, details: parsed.error.issues }, { status: 400 });
    }

    const {
      fullName,
      email,
      phone,
      role,
      guestCount,
      organization,
      dietaryOrNotes,
    } = parsed.data;

    const db = getDb();

    // Ensure event exists
    let event = await db.cmsEvent.findUnique({
      where: { slug: EVENT_SLUG },
    });

    if (!event) {
      const admin = await db.adminUser.findFirst();
      if (admin) {
        event = await db.cmsEvent.create({
          data: {
            slug: EVENT_SLUG,
            title: EVENT_TITLE,
            description: "Graduation celebration for Greenwave Society Empower 360 Ad Hoc Cohort I changemakers and community market.",
            location: EVENT_LOCATION,
            startsAt: new Date("2026-10-30T10:30:00+03:00"),
            endsAt: new Date("2026-10-30T15:00:00+03:00"),
            status: "published",
            capacity: 100,
            createdById: admin.id,
            updatedById: admin.id,
          },
        });
      } else {
        return NextResponse.json({ error: "System initialization pending. Please contact info@greenwavesociety.org." }, { status: 500 });
      }
    }

    // Check if user is already registered for this event
    const existing = await db.cmsEventRegistration.findUnique({
      where: {
        eventId_email: {
          eventId: event.id,
          email,
        },
      },
    });

    let registrationId: string;
    let checkInToken: string;
    let isExisting = false;

    if (existing) {
      registrationId = existing.id;
      const meta = (existing.metadata as Record<string, any>) || {};
      checkInToken = meta.checkInToken || crypto.randomUUID();

      // If token wasn't in metadata yet, persist it
      if (!meta.checkInToken) {
        await db.cmsEventRegistration.update({
          where: { id: existing.id },
          data: {
            metadata: {
              ...meta,
              checkInToken,
            },
          },
        });
      }
      isExisting = true;
    } else {
      checkInToken = crypto.randomUUID();
      const created = await db.cmsEventRegistration.create({
        data: {
          eventId: event.id,
          fullName,
          email,
          phone,
          organization: organization || null,
          status: "registered",
          attendanceStatus: "not_checked_in",
          metadata: {
            type: "guest",
            role,
            guestCount,
            dietaryOrNotes: dietaryOrNotes || null,
            checkInToken,
            ticketToken: checkInToken,
            registeredAt: new Date().toISOString(),
          },
        },
      });
      registrationId = created.id;
    }

    // Generate check-in verification URL
    const checkInUrl = `${SITE_URL}/events/check-in?id=${registrationId}&token=${checkInToken}`;
    
    // Generate QR code Data URL
    const qrCodeDataUrl = await generateQrDataUrl(checkInUrl, {
      width: 320,
      margin: 1,
      darkColor: "#064e3b", // Deep emerald
      lightColor: "#ffffff",
    });

    // Send confirmation email
    sendGraduationGuestConfirmation({
      to: email,
      name: fullName,
      role,
      guestCount,
      ticketNumber: `GW-${registrationId.slice(-6).toUpperCase()}`,
      checkInUrl,
      eventDate: EVENT_DATE_STR,
      location: EVENT_LOCATION,
    }).catch(() => {
      // Non-fatal if email provider is unconfigured in local development
    });

    const passUrl = `/events/pass?id=${registrationId}&token=${checkInToken}`;

    return NextResponse.json({
      success: true,
      isExisting,
      ticketNumber: `GW-${registrationId.slice(-6).toUpperCase()}`,
      registrationId,
      checkInUrl,
      passUrl,
      qrCodeDataUrl,
      role,
      guestCount,
      fullName,
      message: isExisting
        ? "We found your existing RSVP! Here is your digital entry ticket."
        : "RSVP Confirmed! Your digital entry pass and check-in QR code have been generated.",
    });
  } catch (error) {
    console.error("[GRADUATION_RSVP_POST]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your RSVP. Please try again or reach out to info@greenwavesociety.org." },
      { status: 500 }
    );
  }
}

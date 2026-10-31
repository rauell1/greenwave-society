import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendGraduationVendorConfirmation } from "@/lib/events/email";
import { generateQrDataUrl } from "@/lib/events/qr";
import { SITE_URL } from "@/lib/email-template";
import { z } from "zod";
import crypto from "crypto";

const vendorSchema = z.object({
  vendorName: z.string().trim().min(2, "Vendor/Brand name is required").max(100),
  contactPerson: z.string().trim().min(2, "Contact person name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(120),
  phone: z.string().trim().min(5, "Valid phone number is required").max(20),
  category: z.enum([
    "refreshments",
    "books",
    "accessories",
    "lifestyle",
    "other",
  ], {
    message: "Please select a valid vendor category",
  }),
  productDescription: z.string().trim().min(10, "Please describe the products or services you will offer (minimum 10 characters)").max(1000),
  socialOrWebsite: z.string().trim().max(200).optional(),
  singleUsePlasticAgreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to our zero single-use plastics policy.",
  }),
});

const EVENT_SLUG = "graduation-cohort-1-2026";
const EVENT_TITLE = "Empower 360 Ad Hoc Cohort I Graduation & Community Market";
const EVENT_LOCATION = "Ubunifu Hub, Nairobi, Kenya";
const EVENT_DATE_STR = "Friday, 30th October 2026, 10:30 AM EAT (Setup 9:30 AM)";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parsed = vendorSchema.safeParse(json);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError, details: parsed.error.issues }, { status: 400 });
    }

    const {
      vendorName,
      contactPerson,
      email,
      phone,
      category,
      productDescription,
      socialOrWebsite,
      singleUsePlasticAgreement,
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
            description: "Graduation celebration for Greenwave Society Empower 360 Ad Hoc Cohort I changemakers and curated community vendor showcase.",
            location: EVENT_LOCATION,
            startsAt: new Date("2026-10-30T10:30:00+03:00"),
            endsAt: new Date("2026-10-30T15:00:00+03:00"),
            status: "published",
            capacity: 50,
            createdById: admin.id,
            updatedById: admin.id,
          },
        });
      }
    }

    if (!event) {
      return NextResponse.json({ error: "System initialization pending. Please contact info@greenwavesociety.org." }, { status: 500 });
    }

    // Check duplicate or existing registration
    const existing = await db.cmsEventRegistration.findUnique({
      where: {
        eventId_email: {
          eventId: event.id,
          email,
        },
      },
    });

    const isClosed =
      event.status === "completed" ||
      event.status === "cancelled" ||
      (event.registrationClosesAt && new Date() > event.registrationClosesAt);

    if (isClosed && !existing) {
      return NextResponse.json(
        {
          error:
            "Vendor applications have closed. The Empower 360 Cohort I Community Market has concluded.",
          isClosed: true,
        },
        { status: 400 }
      );
    }

    let registrationId: string;
    let checkInToken: string;
    let isExisting = false;

    if (existing) {
      registrationId = existing.id;
      const meta = (existing.metadata as Record<string, any>) || {};
      checkInToken = meta.checkInToken || crypto.randomUUID();

      if (!meta.checkInToken || !meta.ticketToken) {
        await db.cmsEventRegistration.update({
          where: { id: existing.id },
          data: {
            metadata: {
              ...meta,
              checkInToken,
              ticketToken: checkInToken,
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
          fullName: contactPerson,
          email,
          phone,
          organization: vendorName,
          status: "registered",
          attendanceStatus: "not_checked_in",
          metadata: {
            type: "vendor",
            vendorName,
            contactPerson,
            category,
            productDescription,
            socialOrWebsite: socialOrWebsite || null,
            singleUsePlasticAgreement,
            feePolicy: "KES 1,000 baseline stall commitment fee (tables and chairs provided)",
            checkInToken,
            ticketToken: checkInToken,
            submittedAt: new Date().toISOString(),
          },
        },
      });
      registrationId = created.id;
    }

    const ticketNumber = `GW-${registrationId.slice(-6).toUpperCase()}`;
    const checkInUrl = `${SITE_URL}/events/check-in?id=${registrationId}&token=${checkInToken}`;
    const passUrl = `${SITE_URL}/events/pass?id=${registrationId}&token=${checkInToken}`;

    const qrCodeDataUrl = await generateQrDataUrl(checkInUrl, {
      width: 320,
      margin: 1,
      darkColor: "#064e3b",
      lightColor: "#ffffff",
    });

    // Send vendor confirmation email with scannable QR ticket
    sendGraduationVendorConfirmation({
      to: email,
      name: contactPerson,
      vendorName,
      category,
      ticketNumber,
      checkInUrl,
      eventDate: EVENT_DATE_STR,
      location: EVENT_LOCATION,
    }).catch(() => {
      // Non-fatal if email service is unconfigured
    });

    return NextResponse.json({
      success: true,
      isExisting,
      ticketNumber,
      registrationId,
      checkInUrl,
      passUrl,
      qrCodeDataUrl,
      vendorName,
      contactPerson,
      category,
      message: isExisting
        ? "We found your existing vendor registration! Here is your digital vendor pass."
        : "Vendor application confirmed! Your vendor stall pass and check-in QR code have been issued.",
    });
  } catch (error) {
    console.error("[GRADUATION_VENDOR_POST]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again or reach out to info@greenwavesociety.org." },
      { status: 500 }
    );
  }
}

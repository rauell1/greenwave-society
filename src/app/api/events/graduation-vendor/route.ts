import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEventRegistrationConfirmation } from "@/lib/events/email";
import { z } from "zod";

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

const EVENT_SLUG = "graduation-cohort-2-2026";
const EVENT_TITLE = "Ad Hoc Cohort II Graduation & Community Market";
const EVENT_LOCATION = "Ubunifu Hub, Nairobi, Kenya";
const EVENT_DATE_STR = "Friday, 30th October 2026, 10:30 AM EAT";

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
            description: "Graduation celebration for Greenwave Society Ad Hoc Cohort II changemakers and curated community vendor showcase.",
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

    if (event) {
      // Check duplicate registration
      const existing = await db.cmsEventRegistration.findUnique({
        where: {
          eventId_email: {
            eventId: event.id,
            email,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A registration with this email address has already been submitted." },
          { status: 409 }
        );
      }

      await db.cmsEventRegistration.create({
        data: {
          eventId: event.id,
          fullName: contactPerson,
          email,
          phone,
          organization: vendorName,
          status: "pending", // Pending curation/confirmation
          attendanceStatus: "not_checked_in",
          metadata: {
            vendorName,
            contactPerson,
            category,
            productDescription,
            socialOrWebsite: socialOrWebsite || null,
            singleUsePlasticAgreement,
            feePolicy: "KES 1,000 baseline stall commitment fee (tables and chairs provided)",
            submittedAt: new Date().toISOString(),
          },
        },
      });
    }

    // Send confirmation email
    await sendEventRegistrationConfirmation({
      to: email,
      name: contactPerson,
      eventTitle: `${EVENT_TITLE} (Vendor Application)`,
      eventDate: EVENT_DATE_STR,
      location: EVENT_LOCATION,
    }).catch(() => {
      // Non-fatal if email service is unconfigured
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your vendor application has been received. Our team will review your category and contact you with setup details.",
    });
  } catch (error) {
    console.error("[GRADUATION_VENDOR_POST]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again or reach out to info@greenwavesociety.org." },
      { status: 500 }
    );
  }
}

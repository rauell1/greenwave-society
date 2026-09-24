import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEventRegistrationConfirmation } from "@/lib/events/email";
import { format } from "date-fns";

const db = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, email, phone, organization, eventSlug, 
      attendedBefore, expectations, makesYouHappy, accessibilityNeeds,
      suicidalIdeation, knowsSomeoneAttempted, stigmaReason,
      emergencyContactName, emergencyContactPhone, dietaryRestrictions, liabilityConsent
    } = body;

    if (!fullName || !email || !eventSlug || !phone || !attendedBefore || !expectations || !makesYouHappy || !accessibilityNeeds || !suicidalIdeation || !knowsSomeoneAttempted || !stigmaReason || !emergencyContactName || !emergencyContactPhone || liabilityConsent !== true) {
      return NextResponse.json({ error: "Missing required fields or consent" }, { status: 400 });
    }

    const event = await db.cmsEvent.findUnique({
      where: { slug: eventSlug },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "published") {
      return NextResponse.json({ error: "Registration is not currently open for this event." }, { status: 400 });
    }

    if (event.capacity && event._count.registrations >= event.capacity) {
      return NextResponse.json({ error: "This event has reached its maximum capacity. Please look out for our next session." }, { status: 400 });
    }

    // Check if user is already registered for this event
    const existingRegistration = await db.cmsEventRegistration.findUnique({
      where: {
        eventId_email: {
          eventId: event.id,
          email,
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: "You are already registered for this event with this email." }, { status: 400 });
    }

    // Attempt to link to existing member registration if applicable
    const member = await db.memberRegistration.findFirst({
      where: { email }
    });

    const registration = await db.cmsEventRegistration.create({
      data: {
        eventId: event.id,
        memberRegistrationId: member?.id || null,
        fullName,
        email,
        phone,
        organization,
        metadata: {
          attendedBefore,
          expectations,
          makesYouHappy,
          accessibilityNeeds,
          suicidalIdeation,
          knowsSomeoneAttempted,
          stigmaReason,
          emergencyContactName,
          emergencyContactPhone,
          dietaryRestrictions,
          liabilityConsent
        },
        status: "registered",
        attendanceStatus: "not_checked_in"
      }
    });

    // Send confirmation email
    const eventDateStr = format(event.startsAt, "EEEE, do MMMM yyyy, h:mm a");
    await sendEventRegistrationConfirmation({
      to: email,
      name: fullName,
      eventTitle: event.title,
      eventDate: eventDateStr,
      location: event.location || "To be confirmed. The final venue will be shared directly with you via email.",
      isMentalHealthEvent: event.slug === "suicide-prevention-awareness-2026",
    });

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error("[EVENT_REGISTER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

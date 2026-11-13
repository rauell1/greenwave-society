import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { APP_CONFIG } from "@/config/app.config";
import { logger } from "@/lib/logger";
import { sendEventRegistrationConfirmation } from "@/lib/events/email";
import { formatNairobi } from "@/lib/events/nairobi-time";
import { registerAttendee } from "@/lib/events/registration";
import { publicAttendeeSchema } from "@/lib/events/validation";

// Generic sign-up for any event published from the admin. The hand-built event pages keep their
// own routes (/api/events/register, graduation-rsvp, graduation-vendor) and form fields.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const parsed = publicAttendeeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form and try again.", issues: parsed.error.flatten() }, { status: 400 });
  const { website, ...attendee } = parsed.data;
  // Bots fill the hidden "website" field; pretend success so they do not retry.
  if (website) return NextResponse.json({ status: "registered" }, { status: 201 });

  const { slug } = await params;
  const member = await getDb().memberRegistration.findFirst({ where: { email: attendee.email }, select: { id: true } });
  const result = await registerAttendee(
    { slug },
    { ...attendee, memberRegistrationId: member?.id ?? null },
    null,
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const { event, registration } = result;
  if (registration.status === "registered") {
    await sendEventRegistrationConfirmation({
      to: registration.email,
      name: registration.fullName,
      eventTitle: event.title,
      eventDate: formatNairobi(event.startsAt),
      location: event.location || event.virtualUrl || undefined,
      eventUrl: `${APP_CONFIG.url}/events/${event.slug}`,
    }).catch(error => logger.error("Event confirmation email failed", error as Error, { eventId: event.id }));
  }
  return NextResponse.json({ status: registration.status }, { status: 201 });
}

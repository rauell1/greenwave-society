import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { attendeeSchema, registrationStatus } from "@/lib/events/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeRoute(PERMISSIONS.EVENTS_MANAGE_ATTENDANCE); if (!auth.ok) return auth.response;
  const parsed = attendeeSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid attendee" }, { status: 400 });
  const { id } = await params;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const attendee = await getDb().$transaction(async tx => {
        const event = await tx.cmsEvent.findUnique({ where: { id } }); if (!event) throw new Error("EVENT_NOT_FOUND");
        const now = new Date();
        if (event.status !== "published") throw new Error("EVENT_NOT_OPEN");
        if (event.registrationOpensAt && now < event.registrationOpensAt) throw new Error("REGISTRATION_NOT_OPEN");
        const registrationCutoff = event.registrationClosesAt && event.registrationClosesAt < event.endsAt ? event.registrationClosesAt : event.endsAt;
        if (now > registrationCutoff) throw new Error("REGISTRATION_CLOSED");
        const confirmed = await tx.cmsEventRegistration.count({ where: { eventId: id, status: "registered" } });
        const status = registrationStatus(event.capacity, confirmed);
        const created = await tx.cmsEventRegistration.create({ data: { ...parsed.data, eventId: id, status } });
        await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.EVENT_ATTENDEE_ADDED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_event", resourceId: id, outcome: "SUCCESS", afterState: JSON.stringify({ registrationId: created.id, status }) } }); return created;
      }, { isolationLevel: "Serializable" });
      return NextResponse.json({ attendee: { id: attendee.id, status: attendee.status } }, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 3) continue;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "This email is already registered for the event." }, { status: 409 });
      const message = error instanceof Error ? error.message : "";
      const errors: Record<string, [string, number]> = { EVENT_NOT_FOUND: ["Event not found", 404], EVENT_NOT_OPEN: ["Registrations require a published event.", 409], REGISTRATION_NOT_OPEN: ["Registration has not opened.", 409], REGISTRATION_CLOSED: ["Registration is closed.", 409] };
      const mapped = errors[message]; return NextResponse.json({ error: mapped?.[0] ?? "Unable to add attendee." }, { status: mapped?.[1] ?? 409 });
    }
  }
  return NextResponse.json({ error: "Unable to allocate capacity after retrying." }, { status: 409 });
}

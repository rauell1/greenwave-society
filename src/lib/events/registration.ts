import "server-only";

import { Prisma, type CmsEvent, type CmsEventRegistration } from "@prisma/client";
import { getDb } from "@/lib/db";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";
import { registrationStatus } from "./validation";

export interface AttendeeInput {
  fullName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  memberRegistrationId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export type RegistrationResult =
  | { ok: true; registration: CmsEventRegistration; event: CmsEvent }
  | { ok: false; error: string; status: number };

const ERRORS: Record<string, [string, number]> = {
  EVENT_NOT_FOUND: ["Event not found.", 404],
  EVENT_NOT_OPEN: ["Registration is not open for this event.", 409],
  REGISTRATION_NOT_OPEN: ["Registration has not opened yet.", 409],
  REGISTRATION_CLOSED: ["Registration for this event has closed.", 409],
};

export function registrationWindow(event: Pick<CmsEvent, "status" | "endsAt" | "registrationOpensAt" | "registrationClosesAt">, now = new Date()) {
  if (event.status !== "published") return "EVENT_NOT_OPEN";
  if (event.registrationOpensAt && now < event.registrationOpensAt) return "REGISTRATION_NOT_OPEN";
  const cutoff = event.registrationClosesAt && event.registrationClosesAt < event.endsAt ? event.registrationClosesAt : event.endsAt;
  if (now > cutoff) return "REGISTRATION_CLOSED";
  return "OPEN";
}

/**
 * Registers someone for an event, putting them on the waiting list once capacity is reached.
 * Shared by the admin "Add attendee" form and the public event sign-up form. Runs serializably
 * and retries so two people taking the last place at once cannot both be confirmed.
 */
export async function registerAttendee(
  where: { id: string } | { slug: string },
  attendee: AttendeeInput,
  actor: { email: string; id?: string } | null,
): Promise<RegistrationResult> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await getDb().$transaction(async tx => {
        const event = await tx.cmsEvent.findUnique({ where });
        if (!event) throw new Error("EVENT_NOT_FOUND");
        const window = registrationWindow(event);
        if (window !== "OPEN") throw new Error(window);
        const confirmed = await tx.cmsEventRegistration.count({ where: { eventId: event.id, status: "registered" } });
        const status = registrationStatus(event.capacity, confirmed);
        const registration = await tx.cmsEventRegistration.create({ data: { ...attendee, eventId: event.id, status } });
        await tx.auditLog.create({
          data: {
            action: AUDIT_ACTIONS.EVENT_ATTENDEE_ADDED,
            actor: actor?.email ?? attendee.email,
            actorUserId: actor?.id,
            resourceType: "cms_event",
            resourceId: event.id,
            outcome: "SUCCESS",
            afterState: JSON.stringify({ registrationId: registration.id, status, source: actor ? "admin" : "public" }),
          },
        });
        return { registration, event };
      }, { isolationLevel: "Serializable" });
      return { ok: true, ...result };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 3) continue;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: false, error: "This email is already registered for the event.", status: 409 };
      const mapped = ERRORS[error instanceof Error ? error.message : ""];
      if (!mapped) throw error;
      return { ok: false, error: mapped[0], status: mapped[1] };
    }
  }
  return { ok: false, error: "Unable to allocate a place after retrying. Please try again.", status: 409 };
}

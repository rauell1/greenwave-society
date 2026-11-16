import type { Prisma } from "@prisma/client";

// Volunteers (imported from the Google Form with registeredAs "Volunteer") help run the event, so
// they never take one of its places and are never waitlisted. Shared by the website sign-up
// (registration.ts) and scripts/import-form-registrations.ts so both count places the same way.
export const VOLUNTEER = "Volunteer";

export function isVolunteer(metadata: unknown): boolean {
  return typeof metadata === "object" && metadata !== null && (metadata as Record<string, unknown>).registeredAs === VOLUNTEER;
}

/** Confirmed registrations that take a place: everyone "registered" except volunteers. */
export async function placesTaken(tx: Pick<Prisma.TransactionClient, "cmsEventRegistration">, eventId: string): Promise<number> {
  const registered = await tx.cmsEventRegistration.count({ where: { eventId, status: "registered" } });
  const volunteers = await tx.cmsEventRegistration.count({ where: { eventId, status: "registered", metadata: { path: ["registeredAs"], equals: VOLUNTEER } } });
  return registered - volunteers;
}

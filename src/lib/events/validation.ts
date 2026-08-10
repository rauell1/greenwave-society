import { z } from "zod";

export const EVENT_STATUSES = ["draft", "published", "cancelled", "completed"] as const;
export const eventInputSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string().trim().min(2).max(180), description: z.string().trim().min(1).max(50_000),
  location: z.string().trim().max(300).optional().nullable(), virtualUrl: z.union([z.string().url().max(1000), z.literal("")]).optional().nullable(), timezone: z.literal("Africa/Nairobi").default("Africa/Nairobi"),
  startsAt: z.coerce.date(), endsAt: z.coerce.date(), capacity: z.number().int().positive().max(100_000).optional().nullable(), registrationOpensAt: z.coerce.date().optional().nullable(), registrationClosesAt: z.coerce.date().optional().nullable(),
})
  .refine(value => value.endsAt > value.startsAt, { message: "End time must be after start time", path: ["endsAt"] })
  .refine(value => !value.registrationOpensAt || !value.registrationClosesAt || value.registrationClosesAt > value.registrationOpensAt, { message: "Registration close must follow registration open", path: ["registrationClosesAt"] })
  .refine(value => !value.registrationOpensAt || value.registrationOpensAt <= value.startsAt, { message: "Registration must open by the event start", path: ["registrationOpensAt"] })
  .refine(value => !value.registrationClosesAt || value.registrationClosesAt <= value.endsAt, { message: "Registration cannot close after the event ends", path: ["registrationClosesAt"] });
export const attendeeSchema = z.object({ fullName: z.string().trim().min(2).max(180), email: z.string().trim().toLowerCase().email().max(254), phone: z.string().trim().max(40).optional().nullable(), organization: z.string().trim().max(180).optional().nullable(), memberRegistrationId: z.string().optional().nullable() });
export const attendanceSchema = z.object({ attendanceStatus: z.enum(["not_checked_in", "checked_in", "no_show"]) });
export function registrationStatus(capacity: number | null, confirmedCount: number) { return capacity !== null && confirmedCount >= capacity ? "waitlisted" : "registered"; }
const EVENT_TRANSITIONS: Record<string, readonly string[]> = { draft: ["published", "cancelled"], published: ["cancelled", "completed"], cancelled: [], completed: [] };
export function canTransitionEvent(from: string, to: string) { return EVENT_TRANSITIONS[from]?.includes(to) ?? false; }

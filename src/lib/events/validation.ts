import { z } from "zod";

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

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
// Public sign-up asks for name, email and phone, and whether the person is attending or coming
// as a vendor (vendors add a business name). "website" is a hidden honeypot field. Members are
// recognised by email, so they register the same way.
export const publicAttendeeSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(180),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  registerAs: z.enum(["attendee", "vendor"]).default("attendee"),
  businessName: z.string().trim().max(180).optional(),
  website: z.string().max(200).optional(),
}).refine(value => value.registerAs !== "vendor" || Boolean(value.businessName && value.businessName.length >= 2), { message: "Enter your business name", path: ["businessName"] });
export const attendanceSchema = z.object({ attendanceStatus: z.enum(["not_checked_in", "checked_in", "no_show"]) });
export function registrationStatus(capacity: number | null, confirmedCount: number) { return capacity !== null && confirmedCount >= capacity ? "waitlisted" : "registered"; }
const EVENT_TRANSITIONS: Record<string, readonly string[]> = { draft: ["published", "cancelled"], published: ["cancelled", "completed"], cancelled: [], completed: [] };
export function canTransitionEvent(from: string, to: string) { return EVENT_TRANSITIONS[from]?.includes(to) ?? false; }

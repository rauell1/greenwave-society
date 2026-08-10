import { z } from "zod";

export const MEMBER_STATUSES = ["pending", "approved", "rejected", "suspended", "inactive"] as const;
export const memberStatusSchema = z.object({ status: z.enum(MEMBER_STATUSES), reason: z.string().trim().max(2000).optional().default("") });
export const memberNoteSchema = z.object({ body: z.string().trim().min(1).max(5000) });

const TRANSITIONS: Record<string, readonly string[]> = {
  pending: ["approved", "rejected"],
  approved: ["suspended", "inactive"],
  rejected: ["pending"],
  suspended: ["approved", "inactive"],
  inactive: ["approved"],
};

export function canTransitionMember(from: string, to: string): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function csvCell(value: unknown): string {
  const raw = String(value ?? "");
  const safe = /^[\u0000-\u0020]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

import { z } from "zod";

export const createAdminSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254), roleIds: z.array(z.string().min(1)).min(1).max(10) });
export const updateAdminSchema = z.object({ isActive: z.boolean(), roleIds: z.array(z.string().min(1)).min(1).max(10) });

export function wouldRemoveFinalOwner(input: { targetIsOwner: boolean; nextIsOwner: boolean; activeOwnerCount: number; nextIsActive: boolean }) {
  return input.targetIsOwner && input.activeOwnerCount <= 1 && (!input.nextIsOwner || !input.nextIsActive);
}

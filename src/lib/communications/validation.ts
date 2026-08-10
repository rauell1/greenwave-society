import { z } from "zod";

export const campaignInputSchema = z.object({
  name: z.string().trim().min(3).max(120),
  subject: z.string().trim().min(3).max(180),
  preheader: z.string().trim().max(200).optional().nullable(),
  eyebrow: z.string().trim().min(2).max(80).default("Greenwave Update"),
  htmlBody: z.string().trim().min(10).max(100_000),
});

export function canSendCampaign(status: string): boolean {
  return status === "draft" || status === "failed";
}

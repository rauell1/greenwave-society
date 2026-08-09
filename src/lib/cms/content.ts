import { z } from "zod";

export const CONTENT_TYPES = ["page", "program", "story", "announcement"] as const;
export const CONTENT_STATUSES = ["draft", "review", "published", "archived"] as const;

export const contentInputSchema = z.object({
  type: z.enum(CONTENT_TYPES).default("page"),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(2).max(180),
  excerpt: z.string().trim().max(500).optional().nullable(),
  body: z.string().trim().min(1).max(100_000),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  status: z.enum(["draft", "review"]).default("draft"),
});

export function serializeMetadata(value: Record<string, unknown> | null | undefined) {
  return value ? JSON.stringify(value) : null;
}

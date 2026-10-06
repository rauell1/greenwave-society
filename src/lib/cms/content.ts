import { z } from "zod";

export const NEWS_CONTENT_TYPES = ["news", "article", "story", "announcement"] as const;
export const CONTENT_TYPES = ["page", "program", ...NEWS_CONTENT_TYPES, "activity", "impact"] as const;
export const CONTENT_STATUSES = ["draft", "review", "published", "archived"] as const;

export const impactStatsSchema = z.object({
  youthReached: z.number().int().nonnegative(),
  communitiesServed: z.number().int().nonnegative(),
  treesPlanted: z.number().int().nonnegative(),
  eventsOrganized: z.number().int().nonnegative(),
  workshopsDelivered: z.number().int().nonnegative(),
  wasteRecycled: z.number().nonnegative(),
});
export type ImpactStats = z.infer<typeof impactStatsSchema>;

export const activityMetadataSchema = z.object({
  date: z.iso.date(),
  category: z.string().trim().min(1).max(80),
  mediaUrl: z.string().trim().max(2000).refine(value =>
    /^\/(?!\/)[^\\\s]*$/.test(value) || /^https:\/\/[^\s\\]+$/.test(value),
  "Use a local path or an HTTPS URL"),
});

export const contentInputSchema = z.object({
  type: z.enum(CONTENT_TYPES).default("page"),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(2).max(180),
  excerpt: z.string().trim().max(500).optional().nullable(),
  body: z.string().trim().min(1).max(100_000),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  status: z.enum(["draft", "review"]).default("draft"),
}).superRefine((input, context) => {
  if (input.type !== "activity" && input.type !== "impact") return;
  const schema = input.type === "activity" ? activityMetadataSchema : impactStatsSchema;
  const result = schema.safeParse(input.metadata);
  if (!result.success) {
    for (const issue of result.error.issues) context.addIssue({ code: "custom", path: ["metadata", ...issue.path], message: issue.message });
  }
  if (input.type === "impact" && input.slug !== "impact-stats") {
    context.addIssue({ code: "custom", path: ["slug"], message: "Impact figures must use the slug impact-stats" });
  }
});

export function serializeMetadata(value: Record<string, unknown> | null | undefined) {
  return value ? JSON.stringify(value) : null;
}

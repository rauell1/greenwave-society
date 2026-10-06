import "server-only";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { IMPACT_STATS } from "@/config/app.config";
import { DEFAULT_ACTIVITIES, type Activity } from "./activity-defaults";
import { activityMetadataSchema, impactStatsSchema, type ImpactStats } from "./content";
import { logger } from "@/lib/logger";

function parseMetadata(value: string | null): unknown {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}

export const getPublicHomepageContent = cache(async (): Promise<{ impact: ImpactStats; activities: Activity[] }> => {
  const fallback = { impact: { ...IMPACT_STATS }, activities: DEFAULT_ACTIVITIES };
  try {
    const entries = await getDb().cmsContent.findMany({
      where: { type: { in: ["activity", "impact"] }, status: "published", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: { type: true, slug: true, title: true, excerpt: true, body: true, metadata: true },
    });
    const impactEntry = entries.find(entry => entry.type === "impact" && entry.slug === "impact-stats");
    const impact = impactStatsSchema.safeParse(parseMetadata(impactEntry?.metadata ?? null));
    const activities = entries.flatMap(entry => {
      if (entry.type !== "activity") return [];
      const metadata = activityMetadataSchema.safeParse(parseMetadata(entry.metadata));
      if (!metadata.success) return [];
      return [{ title: entry.title, desc: entry.excerpt || entry.body, date: metadata.data.date, type: metadata.data.category, mediaUrl: metadata.data.mediaUrl }];
    }).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
    return { impact: impact.success ? impact.data : fallback.impact, activities: activities.length ? activities : fallback.activities };
  } catch (error) {
    logger.error("Unable to load published homepage content", error as Error);
    return fallback;
  }
});

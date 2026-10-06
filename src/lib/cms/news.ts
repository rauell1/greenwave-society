import "server-only";
import { getDb } from "@/lib/db";
import { NEWS_CONTENT_TYPES } from "./content";

export function getPublishedNews() {
  return getDb().cmsContent.findMany({
    where: { type: { in: [...NEWS_CONTENT_TYPES] }, status: "published", publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export function getPublishedArticle(slug: string) {
  return getDb().cmsContent.findFirst({
    where: { slug, type: { in: [...NEWS_CONTENT_TYPES] }, status: "published", publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });
}

import { NEWS_CONTENT_TYPES } from "@/lib/cms/content";
import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app.config";
import { getDb } from "@/lib/db";
import { CAREER_SLUGS } from "@/lib/careers";
import { DEFAULT_NEWS_ARTICLES } from "@/lib/cms/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_CONFIG.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/impact`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/events/graduation-cohort-1`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/events/graduation-cohort-1/album`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/events/community-market`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/events/suicide-prevention-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/media-kit`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/careers`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...CAREER_SLUGS.map((slug): MetadataRoute.Sitemap[number] => ({
      url: `${baseUrl}/careers/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const newsMap = new Map<string, { url: string; lastModified: Date; changeFrequency: "monthly"; priority: number }>();

  // Add all curated default news articles first
  for (const article of DEFAULT_NEWS_ARTICLES) {
    newsMap.set(article.slug, {
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Merge with live database articles if available
  try {
    const articles = await getDb().cmsContent.findMany({
      where: {
        type: { in: [...NEWS_CONTENT_TYPES] },
        status: "published",
        publishedAt: { not: null },
      },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 200,
    });

    for (const article of articles) {
      newsMap.set(article.slug, {
        url: `${baseUrl}/news/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // If DB is offline at build time, curated articles still guarantee complete coverage
  }

  const newsRoutes: MetadataRoute.Sitemap = Array.from(newsMap.values());

  return [...staticRoutes, ...newsRoutes];
}

export const revalidate = 3600;

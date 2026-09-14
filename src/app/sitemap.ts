import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app.config";
import { getDb } from "@/lib/db";
import { CAREER_SLUGS } from "@/lib/careers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_CONFIG.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/impact`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
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

  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await getDb().cmsContent.findMany({
      where: { OR: [{ type: "news" }, { type: "article" }], status: "published", publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 200,
    });
    newsRoutes = articles.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable at build time — ship the static routes rather than fail the whole sitemap.
  }

  return [...staticRoutes, ...newsRoutes];
}

export const revalidate = 3600;

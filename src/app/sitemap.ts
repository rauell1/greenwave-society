import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.url;
  const lastModified = new Date();

  const routes: Array<{ path: string; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"; priority: number }> = [
    { path: "", changeFrequency: "daily", priority: 1.0 },
    { path: "/about", changeFrequency: "weekly", priority: 0.9 },
    { path: "/programs", changeFrequency: "weekly", priority: 0.9 },
    { path: "/impact", changeFrequency: "weekly", priority: 0.9 },
    { path: "/join", changeFrequency: "weekly", priority: 0.9 },
    { path: "/team", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
export const dynamic = "force-static";


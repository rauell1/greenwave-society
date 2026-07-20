import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.url;
  const lastModified = new Date();

  const routes = [
    "",
    "/about",
    "/programs",
    "/impact",
    "/team",
    "/contact",
    "/join",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
export const dynamic = "force-static";

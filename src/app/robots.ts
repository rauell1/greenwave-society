import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app.config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = APP_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/member/",
          "/sign/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
export const dynamic = "force-static";


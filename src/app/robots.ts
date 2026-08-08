import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app.config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = APP_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/member/", "/sign/", "/api/", "/_next/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/member/", "/sign/", "/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/logo.png", "/favicon.ico"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/member/", "/sign/", "/api/"],
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
        disallow: ["/admin/", "/member/", "/sign/"],
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
        disallow: ["/admin/", "/member/", "/sign/"],
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
        disallow: ["/admin/", "/member/", "/sign/"],
      },
      {
        userAgent: "WhatsApp",
        allow: "/",
        disallow: ["/admin/", "/member/", "/sign/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
export const dynamic = "force-static";


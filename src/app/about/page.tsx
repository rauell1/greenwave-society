import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { About } from "@/components/sections/About";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "About Us | Mission, Vision & Global SDG Alignment",
  description: "Learn about the mission, vision, and core values of Greenwave Society. We empower youth in Kenya to conserve ecosystems, aligned with UN SDGs 13, 14, 15, and 17.",
  keywords: [
    "About Greenwave Society",
    "Youth climate organization Kenya",
    "Environmental NGO Nairobi",
    "UN SDGs 13 14 15 17 Kenya",
    "Martin Kyalo founder",
    "Community conservation Kenya",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/about`,
  },
  openGraph: {
    title: "About Greenwave Society | Youth & Environmental Conservation",
    description: "Learn about the mission, vision, and core values of Greenwave Society. Empowering youth across Kenya.",
    url: `${APP_CONFIG.url}/about`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "About Greenwave Society Kenya" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Greenwave Society",
    description: "Empowering Kenyan youth to conserve ecosystems and lead sustainable change.",
    images: ["/images/hero.png"],
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${APP_CONFIG.url}/about/#webpage`,
        "url": `${APP_CONFIG.url}/about`,
        "name": "About Greenwave Society",
        "description": "Learn about the mission, vision, and core values of Greenwave Society in Kenya.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
        "about": { "@id": `${APP_CONFIG.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/about/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "About Us", "item": `${APP_CONFIG.url}/about` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <About />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}


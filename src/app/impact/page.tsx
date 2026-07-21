import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Impact } from "@/components/sections/Impact";
import { Activities } from "@/components/sections/Activities";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Our Impact & Key Activities | Measurable Ecological Metrics",
  description: "Explore the impact metrics of Greenwave Society: over 10,000 trees planted, 500+ youth empowered, 25+ communities served, and ongoing projects across Nairobi, Ngong, and Machakos.",
  keywords: [
    "Greenwave Society impact metrics",
    "Tree planting results Kenya",
    "Youth empowered Nairobi",
    "Maangani Primary School tree planting",
    "Ngong Hills conservation hike",
    "Environmental outreach Kenya",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/impact`,
  },
  openGraph: {
    title: "Our Impact & Key Activities | Greenwave Society",
    description: "10,000+ trees planted, 500+ youth empowered. See our conservation milestones in Kenya.",
    url: `${APP_CONFIG.url}/impact`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "Greenwave Society Impact Metrics" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact & Activities | Greenwave Society",
    description: "Measurable ecological results: 10,000+ trees planted across Kenya.",
    images: ["/images/hero.png"],
  },
};

export default function ImpactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemPage",
        "@id": `${APP_CONFIG.url}/impact/#webpage`,
        "url": `${APP_CONFIG.url}/impact`,
        "name": "Greenwave Society Impact & Activities",
        "description": "Measurable conservation impact and community outreach milestones across Kenya.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/impact/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Impact", "item": `${APP_CONFIG.url}/impact` },
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
        <Impact />
        <Activities />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}


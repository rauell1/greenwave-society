import { serializeJsonLd } from "@/lib/seo";
import { getPublicHomepageContent } from "@/lib/cms/public-content";
import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Impact } from "@/components/sections/Impact";
import { Activities } from "@/components/sections/Activities";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export async function generateMetadata(): Promise<Metadata> {
  const { impact } = await getPublicHomepageContent();
  const title = 'Our Impact | Greenwave Society Kenya';
  const description = `Greenwave Society has empowered ${impact.youthReached}+ youth, planted ${impact.treesPlanted}+ trees, served ${impact.communitiesServed}+ communities, organised ${impact.eventsOrganized}+ events, delivered ${impact.workshopsDelivered}+ workshops, and recycled ${impact.wasteRecycled} tons of waste across Kenya.`;
  return {
    title, description,
    alternates: { canonical: `${APP_CONFIG.url}/impact` },
    openGraph: { title, description, url: `${APP_CONFIG.url}/impact`, siteName: 'Greenwave Society', type: 'website', images: [{ url: '/images/IMG_9415.jpg', width: 1200, height: 630, alt: 'Greenwave Society community impact in Kenya' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/images/IMG_9415.jpg'] },
  };
}

export const revalidate = 60;

export default async function ImpactPage() {
  const { impact, activities } = await getPublicHomepageContent();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemPage",
        "@id": `${APP_CONFIG.url}/impact/#webpage`,
        "url": `${APP_CONFIG.url}/impact`,
        "name": "Greenwave Society Impact in Kenya",
        "description": `Greenwave Society has empowered ${impact.youthReached}+ youth, planted ${impact.treesPlanted}+ trees, served ${impact.communitiesServed}+ communities, and delivered ${impact.workshopsDelivered}+ workshops across Kenya.`,
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
      {
        "@type": "ItemList",
        "@id": `${APP_CONFIG.url}/impact/#metrics`,
        "name": "Greenwave Society Impact Metrics",
        "description": "Quantitative impact achieved by Greenwave Society in Kenya",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "QuantitativeValue",
              "name": "Youth Empowered",
              "value": impact.youthReached,
              "minValue": impact.youthReached,
              "unitText": "youth",
              "description": "Young Kenyans engaged in hands-on skills training, mentorship, and leadership initiatives.",
            },
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "QuantitativeValue",
              "name": "Trees Planted",
              "value": impact.treesPlanted,
              "minValue": impact.treesPlanted,
              "unitText": "trees",
              "description": "Trees reforested across schools, community parks, and local ecological zones in Kenya.",
            },
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "QuantitativeValue",
              "name": "Communities Served",
              "value": impact.communitiesServed,
              "minValue": impact.communitiesServed,
              "unitText": "communities",
              "description": "Local areas across Nairobi and Kenya empowered with sanitation, education, and restoration programmes.",
            },
          },
          {
            "@type": "ListItem",
            "position": 4,
            "item": {
              "@type": "QuantitativeValue",
              "name": "Events Organised",
              "value": impact.eventsOrganized,
              "minValue": impact.eventsOrganized,
              "unitText": "events",
              "description": "Community clean-ups, youth leadership summits, and conservation hikes.",
            },
          },
          {
            "@type": "ListItem",
            "position": 5,
            "item": {
              "@type": "QuantitativeValue",
              "name": "Workshops Delivered",
              "value": impact.workshopsDelivered,
              "minValue": impact.workshopsDelivered,
              "unitText": "workshops",
              "description": "Practical sessions on environmental literacy, skills development, and UN SDG awareness.",
            },
          },
          {
            "@type": "ListItem",
            "position": 6,
            "item": {
              "@type": "QuantitativeValue",
              "name": "Waste Recycled",
              "value": impact.wasteRecycled,
              "unitCode": "TNE",
              "unitText": "metric tons",
              "description": "Diverted from local landfills through youth-led collection and sorting programmes.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <Impact impact={impact} />
        <Activities activities={activities} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}



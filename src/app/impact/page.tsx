import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Impact } from "@/components/sections/Impact";
import { Activities } from "@/components/sections/Activities";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Our Impact | 500+ Youth, 10,000+ Trees, 25+ Communities in Kenya",
  description: "Greenwave Society has empowered 500+ young Kenyans, planted 10,000+ trees, served 25+ communities, organised 50+ events, delivered 30+ workshops, and recycled 5 tons of waste. Real, measurable impact across Nairobi, Ngong, Kangemi, and beyond.",
  keywords: [
    "Greenwave Society impact Kenya",
    "youth empowered Nairobi results",
    "10000 trees planted Kenya",
    "community development impact Nairobi",
    "conservation results Kenya",
    "environmental NGO impact Kenya",
    "youth workshops Kenya results",
    "waste recycled Kenya programme",
    "Kangemi restoration impact",
    "Ngong Hills conservation",
    "Maangani Primary School trees",
    "SDG impact metrics Kenya",
    "youth led conservation results",
    "social enterprise impact Kenya",
    "mental health youth programme results Kenya",
    "community outreach Nairobi results",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/impact`,
  },
  openGraph: {
    title: "Our Impact | Greenwave Society Kenya",
    description: "500+ youth empowered, 10,000+ trees planted, 25+ communities served. Real measurable change across Kenya by Greenwave Society.",
    url: `${APP_CONFIG.url}/impact`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "Greenwave Society impact metrics Kenya 500 youth 10000 trees" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact | Greenwave Society Kenya",
    description: "500+ youth, 10,000+ trees, 25+ communities, 50+ events. Greenwave Society's measurable impact in Kenya.",
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
        "name": "Greenwave Society Impact | 500+ Youth, 10,000+ Trees in Kenya",
        "description": "Greenwave Society has empowered 500+ youth, planted 10,000+ trees, served 25+ communities, and delivered 30+ workshops across Kenya.",
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
              "value": 500,
              "minValue": 500,
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
              "value": 10000,
              "minValue": 10000,
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
              "value": 25,
              "minValue": 25,
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
              "value": 50,
              "minValue": 50,
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
              "value": 30,
              "minValue": 30,
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
              "value": 5,
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


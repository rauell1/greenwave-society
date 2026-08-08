import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { About } from "@/components/sections/About";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "About Greenwave Society | Mission, Vision & Strategy in Kenya",
  description: "Greenwave Society exists to close the gaps that hold young Kenyans back, in skills, opportunity, and wellbeing, by building leaders who serve their communities and drive lasting change. Learn our mission, vision, and four strategic pillars.",
  keywords: [
    "About Greenwave Society Kenya",
    "Greenwave Society mission",
    "Greenwave Society vision",
    "youth organisation Nairobi mission",
    "youth leadership strategy Kenya",
    "Martin Kyalo founder Greenwave",
    "Njeri Njoroge COO Greenwave",
    "Eugene Shadrack CIO Greenwave",
    "environmental NGO Nairobi",
    "community-led wellbeing Kenya",
    "youth mental health Kenya",
    "skills mismatch Kenya strategy",
    "SDG 3 SDG 4 SDG 8 Kenya NGO",
    "SDG 13 SDG 15 SDG 17 Kenya",
    "environment as classroom Kenya",
    "partnerships accountability NGO Kenya",
    "youth inclusion Kenya aged 15 to 35",
    "social enterprise Kenya",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/about`,
  },
  openGraph: {
    title: "About Greenwave Society | Mission, Vision & Strategy in Kenya",
    description: "We exist to close the gaps that hold young Kenyans back. Discover our mission, four strategic pillars, and the leaders driving change.",
    url: `${APP_CONFIG.url}/about`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "About Greenwave Society Kenya mission and vision" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Greenwave Society | Mission, Vision & Strategy",
    description: "Closing the gaps in skills, opportunity, and wellbeing for young Kenyans. Learn our strategy and the team behind the mission.",
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
        "name": "About Greenwave Society | Mission, Vision & Strategy in Kenya",
        "description": "Greenwave Society exists to close the gaps that hold young Kenyans back, in skills, opportunity, and wellbeing, by building leaders who serve their communities and drive lasting change.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
        "about": { "@id": `${APP_CONFIG.url}/#organization` },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", "h2", ".mission-text"],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/about/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "About Us", "item": `${APP_CONFIG.url}/about` },
        ],
      },
      {
        "@type": "Person",
        "@id": `${APP_CONFIG.url}/#martin-kyalo`,
        "name": "Martin Kyalo",
        "jobTitle": "Founder & Chief Executive Officer",
        "description": "Dedicated to designing and implementing impactful environmental programs, steering organizational growth, and uniting volunteers, youth changemakers, and strategic partners across Kenya.",
        "worksFor": { "@id": `${APP_CONFIG.url}/#organization` },
        "sameAs": ["https://www.linkedin.com/in/martin-kyalo-9373982b7/"],
        "knowsAbout": ["Youth empowerment", "Environmental conservation", "Social enterprise", "Community leadership"],
        "nationality": { "@type": "Country", "name": "Kenya" },
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


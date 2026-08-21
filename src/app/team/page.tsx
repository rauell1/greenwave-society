import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Team } from "@/components/sections/Team";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Our Team | Martin Kyalo, Njeri Njoroge, Eugene Shadrack & Roy Okola",
  description: "Meet the Greenwave Society leadership team: Founder Martin Kyalo (CEO), Njeri Njoroge (COO), Eugene Shadrack (CIO), and Roy Okola Otieno (Head of Design), building the next generation of Kenyan leaders and changemakers.",
  keywords: [
    "Martin Kyalo Greenwave Society founder CEO",
    "Njeri Njoroge COO Greenwave Kenya",
    "Eugene Shadrack CIO Greenwave Society",
    "Roy Okola Otieno Head of Design Greenwave",
    "Greenwave Society leadership team Kenya",
    "social enterprise leadership Nairobi",
    "think tank team Kenya",
    "youth social enterprise founders Kenya",
    "Martin Kyalo LinkedIn Kenya",
    "social enterprise leadership Kenya",
    "community development team Nairobi",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/team`,
  },
  openGraph: {
    title: "Our Team | Greenwave Society Kenya",
    description: "Meet Martin Kyalo, Njeri Njoroge, Eugene Shadrack, and Roy Okola, the team behind Greenwave Society's mission to equip young Kenyans to lead, build, and connect.",
    url: `${APP_CONFIG.url}/team`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Greenwave Society leadership team Kenya" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Team | Greenwave Society Kenya",
    description: "Meet the team building youth leadership, enterprise skills, and conservation across Kenya.",
    images: ["/images/IMG_9415.jpg"],
  },
};

export default function TeamPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemPage",
        "@id": `${APP_CONFIG.url}/team/#webpage`,
        "url": `${APP_CONFIG.url}/team`,
        "name": "Greenwave Society Team | Kenya",
        "description": "The leadership, operations, and creative team behind Greenwave Society's mission to equip young Kenyans to lead, build, and connect.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/team/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Team", "item": `${APP_CONFIG.url}/team` },
        ],
      },
      {
        "@type": "Person",
        "@id": `${APP_CONFIG.url}/#martin-kyalo`,
        "name": "Martin Kyalo",
        "givenName": "Martin",
        "familyName": "Kyalo",
        "jobTitle": "Founder & Chief Executive Officer",
        "description": "Dedicated to designing and implementing impactful environmental programs, steering organizational growth, and uniting volunteers, youth changemakers, and strategic partners across Kenya.",
        "worksFor": { "@id": `${APP_CONFIG.url}/#organization` },
        "sameAs": [APP_CONFIG.social.linkedin],
        "nationality": { "@type": "Country", "name": "Kenya" },
        "knowsAbout": ["Youth empowerment", "Environmental conservation", "Social enterprise", "Community leadership", "Climate action"],
      },
      {
        "@type": "Person",
        "@id": `${APP_CONFIG.url}/#njeri-njoroge`,
        "name": "Njeri Njoroge",
        "givenName": "Njeri",
        "familyName": "Njoroge",
        "jobTitle": "Chief Operating Officer",
        "description": "Oversees daily operations, organizational workflows, and institutional governance to ensure seamless execution of environmental initiatives at Greenwave Society.",
        "worksFor": { "@id": `${APP_CONFIG.url}/#organization` },
        "nationality": { "@type": "Country", "name": "Kenya" },
      },
      {
        "@type": "Person",
        "@id": `${APP_CONFIG.url}/#eugene-shadrack`,
        "name": "Eugene Shadrack",
        "givenName": "Eugene",
        "familyName": "Shadrack",
        "jobTitle": "Chief Innovation Officer",
        "description": "Spearheads technological integration and digital transformation, fostering creative solutions to scale climate action and youth engagement at Greenwave Society.",
        "worksFor": { "@id": `${APP_CONFIG.url}/#organization` },
        "nationality": { "@type": "Country", "name": "Kenya" },
      },
      {
        "@type": "Person",
        "@id": `${APP_CONFIG.url}/#roy-okola`,
        "name": "Roy Okola Otieno",
        "givenName": "Roy",
        "familyName": "Okola",
        "jobTitle": "Head of Design",
        "description": "Directs brand identity, UI/UX design systems, and digital media architecture to amplify Greenwave Society's visual impact and mission awareness.",
        "worksFor": { "@id": `${APP_CONFIG.url}/#organization` },
        "nationality": { "@type": "Country", "name": "Kenya" },
        "knowsAbout": ["UI/UX Design", "Brand Identity", "Digital Media", "Visual Communication"],
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
        <Team />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}


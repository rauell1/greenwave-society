import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Team } from "@/components/sections/Team";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Leadership & Team | Martin Kyalo & Conservation Leaders",
  description: "Meet the leadership team behind Greenwave Society, including Founder Martin Kyalo (Programs Director), spearheading environmental restoration in Kenya.",
  keywords: [
    "Martin Kyalo Greenwave Society",
    "Martin Kyalo Kenya climate director",
    "Greenwave Society leadership team",
    "Environmental conservation leaders Kenya",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/team`,
  },
  openGraph: {
    title: "Leadership & Team | Greenwave Society Kenya",
    description: "Meet Founder Martin Kyalo and the leadership team driving youth-led environmental action in Kenya.",
    url: `${APP_CONFIG.url}/team`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/team-martin-kyalo.jpg", width: 800, height: 800, alt: "Martin Kyalo Founder Greenwave Society" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet Our Leadership | Greenwave Society",
    description: "Driven by passion for youth empowerment and ecological conservation.",
    images: ["/images/team-martin-kyalo.jpg"],
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
        "name": "Greenwave Society Leadership Team",
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
        "name": "Martin Kyalo",
        "jobTitle": "Founder & Programs Director",
        "worksFor": { "@id": `${APP_CONFIG.url}/#organization` },
        "sameAs": [APP_CONFIG.social.linkedin],
        "image": `${APP_CONFIG.url}/images/team-martin-kyalo.jpg`,
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


import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Programs } from "@/components/sections/Programs";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Our Programs & Initiatives | Climate Action & Youth Leadership",
  description: "Explore Greenwave Society's initiatives in Kenya: Climate Advocacy training, Ecosystem Restoration, Youth Empowerment workshops, and Sustainable Agriculture.",
  keywords: [
    "Climate advocacy training Kenya",
    "Ecosystem restoration projects Nairobi",
    "Youth empowerment workshops Kenya",
    "Sustainable agriculture initiatives Kenya",
    "Tree planting programs Kenya",
    "Maangani Primary School project",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/programs`,
  },
  openGraph: {
    title: "Programs & Initiatives | Greenwave Society Kenya",
    description: "Discover our key conservation programs empowering communities and youth across Kenya.",
    url: `${APP_CONFIG.url}/programs`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/program-conservation.png", width: 1200, height: 630, alt: "Greenwave Society Initiatives" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Programs & Initiatives | Greenwave Society",
    description: "Driving climate action and empowering youth leaders across Kenya.",
    images: ["/images/program-conservation.png"],
  },
};

export default function ProgramsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemPage",
        "@id": `${APP_CONFIG.url}/programs/#webpage`,
        "url": `${APP_CONFIG.url}/programs`,
        "name": "Greenwave Society Programs & Initiatives",
        "description": "Exploration of Greenwave Society programs in climate action, restoration, and youth empowerment.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/programs/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Programs", "item": `${APP_CONFIG.url}/programs` },
        ],
      },
      {
        "@type": "ItemList",
        "name": "Greenwave Society Core Programs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Youth Climate Advocacy",
            "description": "Equipping youth with advocacy skills to influence environmental policy and action.",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Ecosystem & Tree Restoration",
            "description": "Community tree planting and habitat restoration across degraded landscapes in Kenya.",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Sustainable Agriculture & Education",
            "description": "Promoting sustainable food systems and eco-education at local primary schools.",
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
        <Programs />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}


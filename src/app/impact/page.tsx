import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Impact } from "@/components/sections/Impact";
import { Activities } from "@/components/sections/Activities";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Our Impact & Activities | Climate Restoration Metrics",
  description: "See the measurable impact of Greenwave Society: over 10,000 trees planted, 500+ youth empowered, and ecological activities across Nairobi, Ngong, and Kangemi.",
  alternates: {
    canonical: "/impact",
  },
};

export default function ImpactPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": APP_CONFIG.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Our Impact",
        "item": `${APP_CONFIG.url}/impact`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 sm:pt-20">
          <Impact />
          <Activities />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

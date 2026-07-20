import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Team } from "@/components/sections/Team";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Meet the Team | Founder & Leadership",
  description: "Meet the leadership team behind Greenwave Society, including Founder Martin Kyalo (Programs Director), directing environmental conservation in Kenya.",
  alternates: {
    canonical: "/team",
  },
};

export default function TeamPage() {
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
        "name": "Meet the Team",
        "item": `${APP_CONFIG.url}/team`,
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
          <Team />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

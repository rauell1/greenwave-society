import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { PrivacySection } from "@/components/sections/PrivacySection";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Rights | Greenwave Society",
  description: "Learn about Greenwave Society's privacy policy, data protection standards, data export, and self-service right to erasure.",
  keywords: [
    "Greenwave Society privacy policy",
    "Data protection compliance Kenya",
    "Right to erasure GDPR",
    "Data export compliance",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy & Data Rights | Greenwave Society",
    description: "Your privacy rights, data export, and account erasure options.",
    url: `${APP_CONFIG.url}/privacy`,
    siteName: "Greenwave Society",
    type: "website",
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${APP_CONFIG.url}/privacy/#webpage`,
        "url": `${APP_CONFIG.url}/privacy`,
        "name": "Privacy Policy & Data Rights",
        "description": "Privacy policy and data erasure request tools for Greenwave Society.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/privacy/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Privacy", "item": `${APP_CONFIG.url}/privacy` },
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
        <PrivacySection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Contact Greenwave Society | Nairobi, Kenya | Email & WhatsApp",
  description: "Contact Greenwave Society in Nairobi, Kenya. Reach us by email at info@greenwavesociety.org or WhatsApp at +254 700 519 130. Whether you want to volunteer, partner, or learn more about our youth leadership and conservation programmes, we would love to hear from you.",
  keywords: [
    "Contact Greenwave Society Kenya",
    "Greenwave Society Nairobi contact",
    "Greenwave Society email info@greenwavesociety.org",
    "Greenwave Society WhatsApp Kenya",
    "volunteer Nairobi youth programme contact",
    "partner environmental NGO Kenya",
    "NGO contact Nairobi Kenya",
    "youth organisation contact Kenya",
    "social enterprise Kenya contact",
    "community programme contact Nairobi",
    "environmental conservation contact Kenya",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/contact`,
  },
  openGraph: {
    title: "Contact Greenwave Society | Nairobi, Kenya",
    description: "Email, WhatsApp, or fill out our contact form. We would love to hear from volunteers, partners, and anyone passionate about youth leadership and conservation in Kenya.",
    url: `${APP_CONFIG.url}/contact`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "Contact Greenwave Society Nairobi Kenya" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Greenwave Society | Kenya",
    description: "Email info@greenwavesociety.org or WhatsApp +254 700 519 130. Volunteers and partners welcome.",
    images: ["/images/hero.png"],
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${APP_CONFIG.url}/contact/#webpage`,
        "url": `${APP_CONFIG.url}/contact`,
        "name": "Contact Greenwave Society | Nairobi, Kenya",
        "description": "Email, WhatsApp, or contact form for Greenwave Society. Based in Nairobi, Kenya.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/contact/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${APP_CONFIG.url}/contact` },
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${APP_CONFIG.url}/#local-business`,
        "name": "Greenwave Society",
        "description": APP_CONFIG.description,
        "url": APP_CONFIG.url,
        "telephone": APP_CONFIG.contact.phone,
        "email": APP_CONFIG.contact.email,
        "priceRange": "Free",
        "currenciesAccepted": "KES",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Nairobi",
          "addressRegion": "Nairobi County",
          "addressCountry": "KE",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -1.2921,
          "longitude": 36.8219,
        },
        "areaServed": { "@type": "Country", "name": "Kenya" },
        "sameAs": [
          APP_CONFIG.social.instagram,
          APP_CONFIG.social.twitter,
          APP_CONFIG.social.facebook,
        ],
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:00",
            "closes": "17:00",
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
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}


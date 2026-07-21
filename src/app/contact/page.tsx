import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Contact Us | Connect & Volunteer in Kenya",
  description: "Get in touch with Greenwave Society in Nairobi, Kenya. Reach out via Email, WhatsApp, or our form to volunteer, partner, or sponsor climate action.",
  keywords: [
    "Contact Greenwave Society Kenya",
    "Volunteer climate organization Nairobi",
    "Greenwave Society phone email WhatsApp",
    "Partner environmental NGO Kenya",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/contact`,
  },
  openGraph: {
    title: "Contact Us | Greenwave Society Kenya",
    description: "Connect with us to volunteer, partner, or support climate conservation across Kenya.",
    url: `${APP_CONFIG.url}/contact`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "Contact Greenwave Society Kenya" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Greenwave Society",
    description: "Reach out to Greenwave Society via email or WhatsApp.",
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
        "name": "Contact Greenwave Society",
        "description": "Contact information and inquiries form for Greenwave Society in Kenya.",
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


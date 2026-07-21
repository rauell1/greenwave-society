import { Metadata } from "next";
import { JoinForm } from "@/components/forms/JoinForm";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Join Greenwave Society | Membership Application & Volunteer Intake",
  description: "Apply for membership at Greenwave Society Kenya. Open to youth aged 15-35 passionate about climate action, environmental conservation, and community leadership.",
  keywords: [
    "Join Greenwave Society Kenya",
    "Youth climate membership Kenya",
    "Volunteer application Nairobi",
    "Environmental organization intake Kenya",
    "Kenya youth empowerment program",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/join`,
  },
  openGraph: {
    title: "Join Greenwave Society | Membership Application",
    description: "Apply to become a youth changemaker with Greenwave Society in Kenya.",
    url: `${APP_CONFIG.url}/join`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/hero.png", width: 1200, height: 630, alt: "Join Greenwave Society" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Greenwave Society",
    description: "Membership intake application for Kenyan youth aged 15-35.",
    images: ["/images/hero.png"],
  },
};

export default function JoinPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${APP_CONFIG.url}/join/#webpage`,
        "url": `${APP_CONFIG.url}/join`,
        "name": "Greenwave Society Membership Application",
        "description": "Expression of interest form for joining Greenwave Society youth network.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/join/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Join Us", "item": `${APP_CONFIG.url}/join` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JoinForm />
    </>
  );
}

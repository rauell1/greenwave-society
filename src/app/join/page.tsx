import { Metadata } from "next";
import { JoinForm } from "@/components/forms/JoinForm";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Join Greenwave Society | Apply to Lead, Build & Connect in Kenya",
  description: "Apply to join Greenwave Society in Kenya. Open to youth aged 15-35 who want to build enterprise skills, engage in conservation, support mental health in their communities, and lead lasting change. Fill out our membership application today.",
  keywords: [
    "join Greenwave Society Kenya",
    "Greenwave Society membership application",
    "volunteer youth Kenya aged 15 35",
    "volunteer Nairobi organisation",
    "social enterprise membership Kenya",
    "youth leadership programme join Kenya",
    "youth volunteer application Nairobi",
    "environmental conservation volunteer Kenya",
    "apply youth empowerment programme Kenya",
    "The 50 Percent programme apply",
    "Young People Pulse YPP apply Kenya",
    "community volunteer Nairobi",
    "skills training programme application Kenya",
    "mental health youth volunteer Kenya",
    "changemakers application Kenya",
    "NGO membership Kenya youth",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/join`,
  },
  openGraph: {
    title: "Join Greenwave Society | Apply Now | Kenya",
    description: "Open to youth aged 15-35 in Kenya. Apply to build enterprise skills, lead in your community, and be part of Greenwave Society's mission to close the gaps in skills, opportunity, and wellbeing.",
    url: `${APP_CONFIG.url}/join`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Join Greenwave Society youth leadership Kenya" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Greenwave Society | Apply to Lead in Kenya",
    description: "Youth aged 15-35 in Kenya: apply for membership and be part of enterprise training, conservation, and community leadership.",
    images: ["/images/IMG_9415.jpg"],
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
        "name": "Join Greenwave Society | Apply to Lead in Kenya",
        "description": "Membership application form for Greenwave Society. Open to youth aged 15-35 in Kenya passionate about leadership, enterprise skills, conservation, and mental health.",
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
      {
        "@type": "VolunteerAction",
        "@id": `${APP_CONFIG.url}/join/#volunteer-action`,
        "name": "Join Greenwave Society as a Volunteer or Member",
        "description": "Apply to volunteer or become a member of Greenwave Society. Youth aged 15-35 in Kenya are invited to join programmes in enterprise skills, conservation, and community leadership.",
        "agent": { "@id": `${APP_CONFIG.url}/#organization` },
        "object": {
          "@type": "Organization",
          "@id": `${APP_CONFIG.url}/#organization`,
        },
        "location": {
          "@type": "Place",
          "name": "Nairobi, Kenya",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Nairobi",
            "addressCountry": "KE",
          },
        },
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

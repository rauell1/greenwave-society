import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Programs } from "@/components/sections/Programs";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";
import { getPublicImagePlacements } from "@/lib/cms/placements";
import { getPublicHomepageContent } from "@/lib/cms/public-content";

export const metadata: Metadata = {
  title: "Our Programmes | Empower 360, Intergenerational Summit, Systems Thinking & More | Kenya",
  description: "Six interconnected programmes from Greenwave Society in Kenya: Empower 360 (flagship youth leadership and mentorship), Intergenerational Summit, Young Person's Guide to Systems Thinking (in partnership with The 50 Percent), Conservation & Restoration, Youth Pulse Program, and Sustainability & Urban Resilience.",
  alternates: {
    canonical: `${APP_CONFIG.url}/programs`,
  },
  openGraph: {
    title: "Our Programmes | Greenwave Society Kenya",
    description: "Six interconnected programmes closing the gaps in skills, leadership, and wellbeing for young Kenyans aged 15-35, from our flagship Empower 360 initiative to conservation and systems thinking.",
    url: `${APP_CONFIG.url}/programs`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Greenwave Society programmes Kenya youth enterprise conservation" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Programmes | Greenwave Society Kenya",
    description: "Empower 360 flagship leadership, Intergenerational Summit, Young Person's Guide to Systems Thinking in partnership with The 50 Percent, Conservation with Tatu City and Jessie K, Youth Pulse Program, and Sustainability & Urban Resilience.",
    images: ["/images/IMG_9415.jpg"],
  },
};

export default async function ProgramsPage() {
  const [placements, content] = await Promise.all([
    getPublicImagePlacements(),
    getPublicHomepageContent(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemPage",
        "@id": `${APP_CONFIG.url}/programs/#webpage`,
        "url": `${APP_CONFIG.url}/programs`,
        "name": "Greenwave Society Programmes | Kenya",
        "description": "Six interconnected programmes addressing skills gaps, leadership, mental health, and environmental degradation for young Kenyans aged 15-35.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/programs/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Programmes", "item": `${APP_CONFIG.url}/programs` },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${APP_CONFIG.url}/programs/#programme-list`,
        "name": "Greenwave Society Programmes",
        "numberOfItems": 6,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Service",
              "name": "Empower 360: Youth Leadership & Mentorship",
              "description": "Flagship initiative equipping emerging changemakers with leadership facilitation, systems-change tools, vocational mentorship, and community project leadership.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Youth Leadership & Mentorship",
              "areaServed": { "@type": "Country", "name": "Kenya" },
              "audience": { "@type": "Audience", "audienceType": "Youth aged 15-35" },
            },
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Service",
              "name": "Intergenerational Summit",
              "description": "Signature policy dialogue and mentorship convening connecting Kenya's youth changemakers with seasoned civic, environmental, and industry leaders.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Policy Dialogue & Mentorship",
              "areaServed": { "@type": "Country", "name": "Kenya" },
            },
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Service",
              "name": "Young Person's Guide to Systems Thinking",
              "description": "Ad hoc training in partnership with The 50 Percent, equipping youth to map complex root causes, navigate systemic challenges, and design actionable community solutions.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Systems Thinking Training",
              "areaServed": { "@type": "Country", "name": "Kenya" },
              "audience": { "@type": "Audience", "audienceType": "Youth aged 18-35" },
            },
          },
          {
            "@type": "ListItem",
            "position": 4,
            "item": {
              "@type": "Service",
              "name": "Conservation & Restoration",
              "description": "Hands-on ecological restoration including tree-planting with Tatu City and community clean-ups with Jessie K and the Nairobi County Environment.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Environmental Conservation",
              "areaServed": { "@type": "City", "name": "Nairobi" },
            },
          },
          {
            "@type": "ListItem",
            "position": 5,
            "item": {
              "@type": "Service",
              "name": "Youth Pulse Program",
              "description": "Youth-volunteer initiative centred on intergenerational connection, mental health awareness, and community accountability across Kenya.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Mental Health & Community Volunteering",
              "areaServed": { "@type": "Country", "name": "Kenya" },
              "audience": { "@type": "Audience", "audienceType": "Youth aged 15-35" },
            },
          },
          {
            "@type": "ListItem",
            "position": 6,
            "item": {
              "@type": "Service",
              "name": "Sustainability & Urban Resilience",
              "description": "Practical sustainable models reducing donor dependency through lean programme delivery, shared community infrastructure, and urban ecosystem design.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Environmental & Urban Resilience Education",
              "areaServed": { "@type": "Country", "name": "Kenya" },
            },
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
        <Programs
          placements={placements}
          content={{
            sectionTitle: content.programsSection.title,
            sectionBody: content.programsSection.body,
            items: content.programs,
          }}
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

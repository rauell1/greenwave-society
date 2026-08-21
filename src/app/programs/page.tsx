import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Programs } from "@/components/sections/Programs";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Our Programmes | The 50 Percent, YPP, Conservation & More | Kenya",
  description: "Six interconnected programmes from Greenwave Society in Kenya: The 50 Percent (flagship enterprise training), Young People Pulse (YPP), Climate Action, Conservation, Youth Empowerment, and Sustainability Education, all addressing skills gaps, unemployment, and mental health for youth aged 15-35.",
  keywords: [
    "The 50 Percent social enterprise programme Kenya",
    "Young People Pulse YPP Kenya",
    "Greenwave Society programmes Kenya",
    "social enterprise training Nairobi",
    "youth enterprise skills Kenya",
    "climate action programme Kenya",
    "ecosystem conservation programme Nairobi",
    "Kangemi restoration programme Kenya",
    "youth empowerment programme Nairobi",
    "sustainability education schools Kenya",
    "Maangani Primary School programme",
    "skills mismatch Kenya programme",
    "youth mental health programme Kenya",
    "intergenerational volunteer programme Kenya",
    "community leadership programme Nairobi",
    "SDG 4 SDG 8 SDG 13 Kenya programmes",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/programs`,
  },
  openGraph: {
    title: "Our Programmes | Greenwave Society Kenya",
    description: "Six interconnected programmes closing the gaps in skills, employment, and wellbeing for young Kenyans aged 15-35, from flagship enterprise training to conservation and mental health.",
    url: `${APP_CONFIG.url}/programs`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Greenwave Society programmes Kenya youth enterprise conservation" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Programmes | Greenwave Society Kenya",
    description: "The 50 Percent, YPP, Climate Action, Conservation, Youth Empowerment, Sustainability Education, six programmes building the next generation of Kenyan leaders.",
    images: ["/images/IMG_9415.jpg"],
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
        "name": "Greenwave Society Programmes | Kenya",
        "description": "Six interconnected programmes addressing skills gaps, unemployment, mental health, and environmental degradation for young Kenyans aged 15-35.",
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
              "name": "The 50 Percent: Social Enterprise",
              "description": "Flagship programme addressing youth unemployment and skills mismatch through enterprise-skills training built on five pillars: who we train, how we train, where we train, what skills we build, and why.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Social Enterprise Training",
              "areaServed": { "@type": "Country", "name": "Kenya" },
              "audience": { "@type": "Audience", "audienceType": "Youth aged 15-35" },
            },
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Service",
              "name": "Young People Pulse (YPP)",
              "description": "Youth-volunteer initiative centred on intergenerational connection, mental health awareness, and community accountability across Kenya.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Mental Health & Community Volunteering",
              "areaServed": { "@type": "Country", "name": "Kenya" },
              "audience": { "@type": "Audience", "audienceType": "Youth aged 15-35" },
            },
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Service",
              "name": "Climate Action Programme",
              "description": "Direct climate education and advocacy training empowering young Kenyans to influence environmental policy and take action on climate change.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Climate Education & Advocacy",
              "areaServed": { "@type": "Country", "name": "Kenya" },
            },
          },
          {
            "@type": "ListItem",
            "position": 4,
            "item": {
              "@type": "Service",
              "name": "Conservation & Ecosystem Restoration",
              "description": "Hands-on ecological restoration including tree planting, the Kangemi riverbank restoration project, and school greening initiatives across Nairobi.",
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
              "name": "Youth Empowerment Programme",
              "description": "Leadership mentorship, skill-building workshops, and career development pathways for young Kenyans to build confidence and community impact.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Youth Leadership & Mentorship",
              "areaServed": { "@type": "Country", "name": "Kenya" },
              "audience": { "@type": "Audience", "audienceType": "Youth aged 15-35" },
            },
          },
          {
            "@type": "ListItem",
            "position": 6,
            "item": {
              "@type": "Service",
              "name": "Sustainability Education",
              "description": "Practical sustainable agriculture and eco-literacy curriculum delivered at primary and secondary schools, including Maangani Primary School in Kenya.",
              "provider": { "@id": `${APP_CONFIG.url}/#organization` },
              "serviceType": "Environmental Education",
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
        <Programs />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}


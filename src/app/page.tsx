import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app.config";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Programs } from "@/components/sections/Programs";
import { Impact } from "@/components/sections/Impact";
import { Team } from "@/components/sections/Team";
import { Activities } from "@/components/sections/Activities";
import { VolunteerCTA } from "@/components/sections/VolunteerCTA";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const metadata: Metadata = {
  title: "Greenwave Society | Equipping Youth to Lead, Build & Connect in Kenya",
  description: "Greenwave Society equips young Kenyans aged 15-35 to lead, build, and connect, closing the gaps in skills, employment, and wellbeing through enterprise training, conservation, and community-led programmes in Nairobi and across Kenya.",
  keywords: [
    "Greenwave Society Kenya",
    "youth empowerment Nairobi",
    "social enterprise training Kenya",
    "The 50 Percent programme Kenya",
    "Young People Pulse YPP",
    "youth unemployment Kenya",
    "skills training Nairobi",
    "mental health youth Kenya",
    "community leadership Kenya",
    "environmental conservation Nairobi",
    "Martin Kyalo Greenwave",
    "NGO Nairobi youth",
    "volunteer Kenya",
    "youth leadership Africa",
    "ecosystem restoration Kenya",
    "climate action Kenya youth",
  ],
  alternates: {
    canonical: APP_CONFIG.url,
  },
  openGraph: {
    title: "Greenwave Society | Equipping Youth to Lead, Build & Connect in Kenya",
    description: "Closing the gaps in skills, opportunity, and wellbeing for young Kenyans. Enterprise training, environmental action, and community-led programmes.",
    url: APP_CONFIG.url,
    siteName: "Greenwave Society",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Greenwave Society youth leadership and community development in Kenya",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenwave Society | Youth Leadership & Skills in Kenya",
    description: "Closing the gaps in skills, opportunity, and wellbeing for young Kenyans aged 15-35.",
    images: ["/images/hero.png"],
    creator: "@greenwaveke",
    site: "@greenwaveke",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Greenwave Society?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Greenwave Society is a youth-led organisation based in Nairobi, Kenya. We equip young people aged 15-35 to lead, build, and connect by closing the gaps in skills, opportunity, and wellbeing through enterprise training, environmental action, and community-led programmes.",
      },
    },
    {
      "@type": "Question",
      "name": "Who can join Greenwave Society?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Greenwave Society is open to youth aged 15-35 in Kenya who are passionate about leadership, community development, environmental conservation, skills building, and social enterprise. Apply at greenwavesociety.org/join.",
      },
    },
    {
      "@type": "Question",
      "name": "What is The 50 Percent programme?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The 50 Percent is Greenwave Society's flagship social enterprise training programme. It addresses youth unemployment and skills mismatch by expanding thinking and adding value to organisations and communities through five training pillars: who we train, how we train, where we train, what skills we build, and why.",
      },
    },
    {
      "@type": "Question",
      "name": "What is Young People Pulse (YPP)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Young People Pulse (YPP) is a youth-volunteer initiative centred on intergenerational connection, mental health awareness, and community accountability. YPP brings young Kenyans together to support one another and drive grassroots change.",
      },
    },
    {
      "@type": "Question",
      "name": "Where does Greenwave Society operate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Greenwave Society is based in Nairobi, Kenya and operates across multiple communities including Kangemi, Ngong, Maangani, and surrounding areas. We partner with schools, community groups, and organisations across the country.",
      },
    },
    {
      "@type": "Question",
      "name": "How can I volunteer with Greenwave Society?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Apply to volunteer with Greenwave Society by filling out our membership application form at greenwavesociety.org/join, or contact us via email at info@greenwavesociety.org or WhatsApp at +254 700 519 130.",
      },
    },
    {
      "@type": "Question",
      "name": "What impact has Greenwave Society made?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Greenwave Society has empowered over 500 youth, planted 10,000+ trees, served 25+ communities, organised 50+ events, delivered 30+ workshops, and recycled 5 tons of waste across Kenya.",
      },
    },
    {
      "@type": "Question",
      "name": "How does Greenwave Society address mental health?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Through the Young People Pulse (YPP) initiative and our Community-Led Wellbeing pillar, Greenwave Society integrates mental health awareness and peer support into all community programmes, recognising mental health as a core part of youth development and aligned with SDG 3.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Programs />
        <Impact />
        <Team />
        <Activities />
        <VolunteerCTA />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

import { getDb } from "@/lib/db";
import { SuicidePreventionRegistrationForm } from "./RegistrationForm";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";
import { serializeJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mental Health Circle: Suicide Prevention Month (Concluded) | Greenwave Society",
  description:
    "Commemorating World Suicide Prevention Month: Greenwave Society hosted a safe-space youth mental health circle on Saturday, 3rd October 2026 in Nairobi.",
  alternates: {
    canonical: `${APP_CONFIG.url}/events/suicide-prevention-2026`,
  },
  openGraph: {
    title: "Mental Health Circle: Suicide Prevention Month (Concluded) | Greenwave Society",
    description:
      "Commemorating World Suicide Prevention Month: Safe-space youth mental health circle conducted on Saturday, 3rd October 2026 in Nairobi.",
    url: `${APP_CONFIG.url}/events/suicide-prevention-2026`,
    siteName: "Greenwave Society",
    images: [
      {
        url: "/images/g-3.jpg",
        width: 1200,
        height: 630,
        alt: "Youth Mental Health Circle Session in Nairobi",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mental Health Circle: Suicide Prevention Month (Concluded)",
    description:
      "Safe-space youth mental health circle conducted by Greenwave Society.",
    images: ["/images/g-3.jpg"],
  },
};

export const dynamic = "force-dynamic";

export default async function SuicidePreventionEventPage() {
  const db = getDb();

  let event = null;
  try {
    event = await db.cmsEvent.findUnique({
      where: { slug: "suicide-prevention-awareness-2026" },
    });
  } catch {
    // If DB is offline
  }

  // Event concluded on Saturday, 3 Oct 2026
  const isRegistrationOpen = event?.status === "published" && new Date() < new Date("2026-10-04T00:00:00Z");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Greenwave Society Mental Health Circle: Suicide Prevention Month",
    "startDate": "2026-10-03T10:00:00+03:00",
    "endDate": "2026-10-03T13:00:00+03:00",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventCompleted",
    "location": {
      "@type": "Place",
      "name": "Greenwave Community Space",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE",
      },
    },
    "description":
      "Safe-space youth mental health circle and peer crisis support session held in solidarity with World Suicide Prevention Month.",
    "organizer": {
      "@type": "Organization",
      "name": "Greenwave Society",
      "url": APP_CONFIG.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <SuicidePreventionRegistrationForm isRegistrationOpen={Boolean(isRegistrationOpen)} />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { getGraduationPhotos } from "@/lib/cms/graduation-photos";
import { APP_CONFIG } from "@/config/app.config";
import { GraduationAlbumClient } from "./GraduationAlbumClient";

export const metadata: Metadata = {
  title: "Official Photo Album: Empower 360 Cohort I Graduation (296 Photos) | Greenwave Society",
  description: "Browse and download all 296 high-resolution ceremony photographs from the Empower 360 Cohort I Graduation on Friday, 30th October 2026 at Ubunifu Hub, Nairobi. Self-hosted on Greenwave CDN.",
  alternates: {
    canonical: `${APP_CONFIG.url}/events/graduation-cohort-1/album`,
  },
  openGraph: {
    title: "Official Photo Album: Empower 360 Cohort I Graduation | Greenwave Society",
    description: "All 296 celebration photographs from Friday, 30th October 2026 at Ubunifu Hub, Nairobi. Self-hosted on Greenwave Society high-speed CDN.",
    url: `${APP_CONFIG.url}/events/graduation-cohort-1/album`,
    siteName: "Greenwave Society",
    images: [
      {
        url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_001.webp",
        width: 1600,
        height: 1067,
        alt: "Empower 360 Cohort I Graduation Celebration at Ubunifu Hub",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Official Photo Album: Empower 360 Cohort I Graduation",
    description: "296 authentic high-resolution celebration photographs. Self-hosted on Greenwave Society CDN.",
    images: ["https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_001.webp"],
  },
};

export default async function GraduationAlbumPage() {
  const photos = await getGraduationPhotos();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${APP_CONFIG.url}/events/graduation-cohort-1/album/#webpage`,
        "url": `${APP_CONFIG.url}/events/graduation-cohort-1/album`,
        "name": "Official Photo Album: Empower 360 Cohort I Graduation",
        "description": "All 296 high-resolution celebration photographs from Friday, 30th October 2026 at Ubunifu Hub, Nairobi.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/events/graduation-cohort-1/album/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Events", "item": `${APP_CONFIG.url}/events` },
          { "@type": "ListItem", "position": 3, "name": "Graduation Cohort I", "item": `${APP_CONFIG.url}/events/graduation-cohort-1` },
          { "@type": "ListItem", "position": 4, "name": "Official Photo Album", "item": `${APP_CONFIG.url}/events/graduation-cohort-1/album` },
        ],
      },
      {
        "@type": "ImageGallery",
        "@id": `${APP_CONFIG.url}/events/graduation-cohort-1/album/#gallery`,
        "name": "Empower 360 Cohort I Ceremony Photos",
        "numberOfItems": photos.length,
        "image": photos.slice(0, 30).map((p) => p.webUrl),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-24 pb-20">
        <GraduationAlbumClient photos={photos} />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

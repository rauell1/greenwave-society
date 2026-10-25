import { Metadata } from "next";
import { APP_CONFIG } from "@/config/app.config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getPublicGalleryImages } from "@/lib/cms/gallery";

export const metadata: Metadata = {
  title: "Photo Gallery | Greenwave Society Impact in Kenya",
  description: "Browse photos from Greenwave Society's youth leadership workshops, tree-planting and conservation drives, community barazas, and enterprise training across Nairobi and Kenya.",
  keywords: [
    "Greenwave Society photo gallery",
    "youth leadership Kenya photos",
    "conservation Kenya photos",
    "Nairobi community events",
    "tree planting Kenya",
    "youth empowerment gallery",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/gallery`,
  },
  openGraph: {
    title: "Photo Gallery | Greenwave Society Impact in Kenya",
    description: "A visual journey through Greenwave Society's systems-thinking workshops, community barazas, and conservation efforts across Kenya.",
    url: `${APP_CONFIG.url}/gallery`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Greenwave Society photo gallery" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Gallery | Greenwave Society Impact in Kenya",
    description: "A visual journey through Greenwave Society's workshops, conservation efforts, and community events across Kenya.",
    images: ["/images/IMG_9415.jpg"],
  },
};



export default async function GalleryPage() {
  const galleryImages = await getPublicGalleryImages();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${APP_CONFIG.url}/gallery/#webpage`,
        "url": `${APP_CONFIG.url}/gallery`,
        "name": "Photo Gallery | Greenwave Society Impact in Kenya",
        "description": "A visual journey through Greenwave Society's systems-thinking workshops, community barazas, and conservation efforts across Kenya.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/gallery/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "Gallery", "item": `${APP_CONFIG.url}/gallery` },
        ],
      },
      {
        "@type": "ImageGallery",
        "@id": `${APP_CONFIG.url}/gallery/#imagegallery`,
        "name": "Greenwave Society Photo Gallery",
        "image": galleryImages.map((img) => `${APP_CONFIG.url}${img.src}`),
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
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <header className="mb-12 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-foreground mb-4">
              Our Impact in <span className="text-primary italic font-normal">Pictures</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              A visual journey of our systems thinking workshops, community barazas, and conservation efforts across Kenya.
            </p>
          </header>

          <GalleryGrid images={galleryImages} />
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

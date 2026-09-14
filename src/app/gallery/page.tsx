import { Metadata } from "next";
import { APP_CONFIG } from "@/config/app.config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { GalleryGrid, type GalleryImage } from "@/components/gallery/GalleryGrid";

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

const galleryImages: GalleryImage[] = [
  { src: "/images/20241214_135952.jpg", alt: "Community engagement event in 2024" },
  { src: "/images/g-59.jpg", alt: "Youth leadership workshop" },
  { src: "/images/g-191.jpg", alt: "Tree planting and conservation" },
  { src: "/images/g-54.jpg", alt: "Mentorship session" },
  { src: "/images/g.jpg", alt: "Community baraza" },
  { src: "/images/20241214_130327.jpg", alt: "Greenwave volunteers" },
  { src: "/images/g-155.jpg", alt: "Environmental education" },
  { src: "/images/g-230.jpg", alt: "Team building activities" },
  { src: "/images/g-211.jpg", alt: "Local community meeting" },
  { src: "/images/20250215_174908.jpg", alt: "Wellness picnic 2025" },
  { src: "/images/20241214_180058.jpg", alt: "Conservation training" },
  { src: "/images/20250401_100800.jpg", alt: "Kangemi restoration efforts" },
  { src: "/images/g-202.jpg", alt: "Youth enterprise training" },
  { src: "/images/20240706135832_IMG_2321.JPG", alt: "Ngong hike participants" },
  { src: "/images/g-101.jpg", alt: "Group discussion" },
  { src: "/images/20241214_180212.jpg", alt: "School outreach program" },
  { src: "/images/g-221.jpg", alt: "Greenwave strategic meeting" },
  { src: "/images/g-3.jpg", alt: "Mental health awareness" },
  { src: "/images/g-83.jpg", alt: "Field activities" },
  { src: "/images/g-102.jpg", alt: "Volunteer appreciation" },
  { src: "/images/g-136.jpg", alt: "Capacity building session" },
  { src: "/images/g-84.jpg", alt: "Project implementation" },
  { src: "/images/DSC_8039.jpg", alt: "Team planning" },
  { src: "/images/IMG_9411.jpg", alt: "Impact overview" },
  { src: "/images/20250404_134814.jpg", alt: "Community dialogue" },
  { src: "/images/20250726_183058.jpg", alt: "Environmental action day" },
  { src: "/images/g-143.jpg", alt: "Youth leaders network" },
  { src: "/images/g-216.jpg", alt: "Partnership meeting" },
  { src: "/images/20250215_170104.jpg", alt: "Program launch" },
  { src: "/images/20250404_134529.jpg", alt: "Field research" },
  { src: "/images/20250215_173437.jpg", alt: "Awareness campaign" },
  { src: "/images/g-188.jpg", alt: "Community engagement" },
  { src: "/images/20241214_135825.jpg", alt: "Training workshop" },
  { src: "/images/20240706180132_IMG_2493.jpg", alt: "Ngong hike summit" },
  { src: "/images/20240706123308_IMG_2070.jpg", alt: "Ngong hike trail" },
];

export default function GalleryPage() {
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

import Image from "next/image";
import { APP_CONFIG } from "@/config/app.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impact Gallery | Greenwave Society Kenya",
  description: "Explore our impact in pictures. A gallery of Greenwave Society's community barazas, conservation efforts, and youth enterprise workshops across Kenya.",
  alternates: {
    canonical: `${APP_CONFIG.url}/gallery`,
  },
};

const galleryImages = [
  "/images/20241214_135952.jpg",
  "/images/g-59.jpg",
  "/images/g-191.jpg",
  "/images/g-54.jpg",
  "/images/g.jpg",
  "/images/20241214_130327.jpg",
  "/images/g-155.jpg",
  "/images/g-230.jpg",
  "/images/g-211.jpg",
  "/images/20250215_174908.jpg",
  "/images/20241214_180058.jpg",
  "/images/20250401_100800.jpg",
  "/images/g-202.jpg",
  "/images/20240706135832_IMG_2321.JPG",
  "/images/g-101.jpg",
  "/images/20241214_180212.jpg",
  "/images/g-221.jpg",
  "/images/g-3.jpg",
  "/images/g-83.jpg",
  "/images/g-102.jpg",
  "/images/g-136.jpg",
  "/images/g-84.jpg",
  "/images/DSC_8039.jpg",
  "/images/IMG_9411.jpg",
  "/images/20250404_134814.jpg",
  "/images/20250726_183058.jpg",
  "/images/g-143.jpg",
  "/images/g-216.jpg",
  "/images/20250215_170104.jpg",
  "/images/20250404_134529.jpg",
  "/images/20250215_173437.jpg",
  "/images/g-188.jpg",
  "/images/20241214_135825.jpg",
  "/images/20240706180132_IMG_2493.jpg",
  "/images/20240706123308_IMG_2070.jpg",
];

export default function GalleryPage() {
  return (
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

        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleryImages.map((src, index) => (
            <div key={index} className="break-inside-avoid rounded-2xl overflow-hidden relative group bg-primary/5">
              <Image
                quality={95}
                src={src}
                alt={`Greenwave Society community impact gallery image ${index + 1}`}
                width={600}
                height={800}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

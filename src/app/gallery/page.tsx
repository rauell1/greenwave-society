"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const galleryImages = [
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null ? (prev === 0 ? galleryImages.length - 1 : prev - 1) : null));
  };
  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null ? (prev === galleryImages.length - 1 ? 0 : prev + 1) : null));
  };

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
          {galleryImages.map((img, index) => (
            <div 
              key={index} 
              className="break-inside-avoid rounded-2xl overflow-hidden relative group bg-primary/5 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              onClick={() => openLightbox(index)}
            >
              <Image
                quality={80}
                src={img.src}
                alt={img.alt}
                width={600}
                height={800}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <ZoomIn className="text-white w-8 h-8 opacity-80" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs font-medium truncate">{img.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 bg-black/20 rounded-full"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-3 bg-black/20 hover:bg-black/40 rounded-full"
            onClick={showPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] w-full px-12 sm:px-20 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].alt}
              width={1200}
              height={1200}
              quality={100}
              className="object-contain max-h-[80vh] w-auto rounded-lg shadow-2xl"
              priority
            />
            <p className="text-white/90 text-center mt-4 text-sm font-medium">
              {galleryImages[lightboxIndex].alt}
            </p>
          </div>

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-3 bg-black/20 hover:bg-black/40 rounded-full"
            onClick={showNext}
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </main>
  );
}

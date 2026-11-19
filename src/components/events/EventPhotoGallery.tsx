"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Download, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventAlbumPhoto } from "@/lib/events/event-albums";

interface Props {
  title: string;
  subtitle: string;
  eventTitle: string;
  photos: EventAlbumPhoto[];
}

const INITIAL_BATCH = 24;

export function EventPhotoGallery({ title, subtitle, eventTitle, photos }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      else if (e.key === "ArrowLeft") setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
      else if (e.key === "ArrowRight") setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, photos.length]);

  if (!photos.length) return null;

  const visiblePhotos = photos.slice(0, visibleCount);
  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <section className="mt-14 border-t border-border/60 pt-10" aria-labelledby="event-photos-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Camera className="h-3.5 w-3.5" /> Photo Gallery
          </p>
          <h2 id="event-photos-heading" className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {visibleCount < photos.length && (
          <Button type="button" variant="outline" size="sm" onClick={() => setVisibleCount(photos.length)}>
            Show all {photos.length} photos
          </Button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visiblePhotos.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-primary/10 bg-muted text-left transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary [content-visibility:auto] [contain-intrinsic-size:200px]"
            aria-label={`View ${eventTitle} photo ${photo.index}`}
          >
            <Image
              src={photo.src}
              alt={`${eventTitle} photo ${photo.index}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
              loading="lazy"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      {visibleCount < photos.length && (
        <div className="mt-6 flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisibleCount((c) => Math.min(photos.length, c + 40))}
          >
            Load more ({photos.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      {activePhoto && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${eventTitle} photo ${activePhoto.index}`}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex w-full items-center justify-between text-sm text-white/90">
              <span>
                Photo {activeIndex + 1} of {photos.length}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activePhoto.src}
                  download={activePhoto.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                  aria-label="Close photo viewer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative h-[75vh] w-full overflow-hidden rounded-xl bg-black/40">
              <Image
                src={activePhoto.src}
                alt={`${eventTitle} photo ${activePhoto.index}`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex + 1) % photos.length)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

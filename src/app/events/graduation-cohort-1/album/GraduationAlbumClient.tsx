"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Camera,
  ArrowLeft,
  Search,
  Grid,
  Columns,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  ZoomIn,
  Sparkles,
  Calendar,
  MapPin,
} from "lucide-react";
import type { GraduationPhoto } from "@/lib/cms/graduation-photos";

interface GraduationAlbumClientProps {
  photos: GraduationPhoto[];
}

export function GraduationAlbumClient({ photos }: GraduationAlbumClientProps) {
  const [search, setSearch] = useState("");
  const [aspectFilter, setAspectFilter] = useState<"all" | "landscape" | "portrait">("all");
  const [layoutMode, setLayoutMode] = useState<"grid" | "masonry">("grid");
  const [pageSize, setPageSize] = useState<number>(48);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);

  // Filtered list
  const filteredPhotos = useMemo(() => {
    let result = photos;

    if (aspectFilter !== "all") {
      result = result.filter((p) => p.aspect === aspectFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => {
        return (
          String(p.index).includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.filename.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [photos, aspectFilter, search]);

  // Total pages
  const totalPages = Math.ceil(filteredPhotos.length / pageSize) || 1;

  // Paginated chunk
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPhotos.slice(start, start + pageSize);
  }, [filteredPhotos, currentPage, pageSize]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Lightbox navigation
  const openLightbox = (indexInFiltered: number) => {
    setLightboxIndex(indexInFiltered);
    setIsPlayingSlideshow(false);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setIsPlayingSlideshow(false);
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }
  }, []);

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? filteredPhotos.length - 1 : prev - 1;
    });
  }, [filteredPhotos.length]);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === filteredPhotos.length - 1 ? 0 : prev + 1;
    });
  }, [filteredPhotos.length]);

  // Slideshow ticker
  useEffect(() => {
    if (isPlayingSlideshow && lightboxIndex !== null) {
      slideshowTimerRef.current = setInterval(() => {
        goToNext();
      }, 4000);
    } else if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }

    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    };
  }, [isPlayingSlideshow, lightboxIndex, goToNext]);

  // Auto-scroll filmstrip to active thumbnail
  useEffect(() => {
    if (lightboxIndex !== null && filmstripRef.current) {
      const activeEl = filmstripRef.current.children[lightboxIndex] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [lightboxIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlayingSlideshow((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, goToPrev, goToNext]);

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleCopyAlbumLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setHasCopied(true);
      toast.success("Album link copied to clipboard!");
      setTimeout(() => setHasCopied(false), 3000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎓 Explore the YPG: Young Person's Guide to Systems Change Cohort I Official Photo Album (296 photos) on Greenwave Society: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `🎓 YPG: Young Person's Guide to Systems Change Cohort I Ceremony Photos! Explore all 296 high-resolution photographs hosted on Greenwave Society:`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/events/graduation-cohort-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Event Overview</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAlbumLink}
              className="rounded-xl text-xs gap-1.5"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? "Link Copied!" : "Share Album Link"}</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setLightboxIndex(0);
                setIsPlayingSlideshow(true);
              }}
              className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Slideshow</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gold/15 text-amber-800 dark:text-gold border border-gold/30 rounded-full">
                <Camera className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Self-Hosted Official Album • {photos.length} Photographs
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border rounded-full font-medium">
                Cloudflare CDN Delivery
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-foreground tracking-tight">
              YPG: Young Person&apos;s Guide to Systems Change Cohort I Photo Album
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Friday, 30th October 2026
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Ubunifu Hub, Nairobi, Kenya
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" /> 26 Youth Changemakers Certified
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs text-xs space-y-1.5 shrink-0 sm:max-w-xs">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-gold" />
              <span>Full-Resolution Masters</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Every photograph is available for direct camera-raw download. Click any image in the album to open the viewer and click <strong>&quot;Download Full Res&quot;</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Control & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by photo # (e.g. 24, 150)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        {/* Center: Aspect filter tabs */}
        <div className="inline-flex rounded-xl bg-secondary/50 p-1 border border-border/70 text-xs font-medium shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => {
              setAspectFilter("all");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              aspectFilter === "all"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({photos.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setAspectFilter("landscape");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              aspectFilter === "landscape"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Landscape ({photos.filter((p) => p.aspect === "landscape").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setAspectFilter("portrait");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              aspectFilter === "portrait"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Portrait ({photos.filter((p) => p.aspect === "portrait").length})
          </button>
        </div>

        {/* Right: Layout Switcher & Page size */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <div className="inline-flex rounded-xl bg-secondary/50 p-0.5 border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                layoutMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Square Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("masonry")}
              className={`p-1.5 rounded-lg transition-all ${
                layoutMode === "masonry" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Natural Masonry View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-xl border border-border/70 bg-card text-xs text-foreground focus:outline-hidden"
          >
            <option value={24}>24 / page</option>
            <option value={48}>48 / page</option>
            <option value={96}>96 / page</option>
            <option value={296}>Show All</option>
          </select>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong>{paginatedPhotos.length}</strong> of <strong>{filteredPhotos.length}</strong> photographs
          {search && ` (filtered from ${photos.length})`}
        </span>
        <span className="font-mono text-[11px]">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Main Album Photo Grid */}
      {layoutMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {paginatedPhotos.map((photo, pIdx) => {
            const globalIndex = (currentPage - 1) * pageSize + pIdx;
            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(globalIndex)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border/70 hover:border-primary/60 shadow-xs hover:shadow-xl transition-all duration-300 relative flex flex-col"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={photo.thumbUrl}
                    alt={`YPG Ceremony photograph #${photo.index}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>

                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-mono text-white/95 backdrop-blur-xs">
                      #{photo.index}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] uppercase font-mono text-white/80">
                      {photo.aspect}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Masonry Layout */
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {paginatedPhotos.map((photo, pIdx) => {
            const globalIndex = (currentPage - 1) * pageSize + pIdx;
            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(globalIndex)}
                className="break-inside-avoid group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border/70 hover:border-primary/60 shadow-xs hover:shadow-xl transition-all duration-300 relative flex flex-col"
              >
                <div className="relative w-full overflow-hidden bg-muted">
                  <Image
                    src={photo.thumbUrl}
                    alt={`YPG Ceremony photograph #${photo.index}`}
                    width={photo.width}
                    height={photo.height}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-mono text-white/95 backdrop-blur-xs">
                      #{photo.index}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2 border-t border-border/50">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(p - 1, 1));
              window.scrollTo({ top: 250, behavior: "smooth" });
            }}
            className="rounded-xl text-xs gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
              ) {
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={pageNum === currentPage ? "default" : "ghost"}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 250, behavior: "smooth" });
                    }}
                    className="rounded-xl text-xs w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                return <span key={pageNum} className="text-muted-foreground text-xs px-1">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(p + 1, totalPages));
              window.scrollTo({ top: 250, behavior: "smooth" });
            }}
            className="rounded-xl text-xs gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Full-Screen Immersive Lightbox Modal */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4"
          onClick={closeLightbox}
        >
          {/* Top Navbar */}
          <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-slate-700 text-gold text-xs font-mono">
                Shot #{currentPhoto.index}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                {lightboxIndex! + 1} of {filteredPhotos.length}
              </span>
              <span className="hidden sm:inline text-xs text-slate-500">|</span>
              <span className="hidden sm:inline text-xs text-slate-300 font-medium">
                Friday, 30 Oct 2026 &bull; Ubunifu Hub
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Slideshow button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlayingSlideshow((prev) => !prev)}
                className="rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5 h-8 px-2.5"
                title="Toggle Slideshow (Spacebar)"
              >
                {isPlayingSlideshow ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current text-gold" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-slate-300" />
                    <span className="hidden sm:inline">Play</span>
                  </>
                )}
              </Button>

              {/* Download original button */}
              <Button
                asChild
                size="sm"
                className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs gap-1.5 h-8 shadow-sm"
              >
                <a href={currentPhoto.originalUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download Full Res (JPG)</span>
                  <span className="sm:hidden">Original</span>
                </a>
              </Button>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Close viewer (Escape)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central High-Definition Photo Display */}
          <div
            className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev button */}
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-xl"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Photo */}
            <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
              <Image
                src={currentPhoto.webUrl}
                alt={`YPG Ceremony photograph #${currentPhoto.index}`}
                fill
                sizes="(max-width: 1280px) 100vw, 1600px"
                className="object-contain"
                priority
              />
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-xl"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Filmstrip Scrubber & Details Bar */}
          <div
            className="w-full max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-white space-y-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Filmstrip thumbnails */}
            <div
              ref={filmstripRef}
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700"
            >
              {filteredPhotos.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex
                      ? "border-gold scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={p.thumbUrl}
                    alt={`Thumbnail #${p.index}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Footer row with details and social sharing */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
              <div className="text-slate-300">
                <strong>YPG: Young Person&apos;s Guide to Systems Change Cohort I Graduation Ceremony</strong> &bull; Ubunifu Hub, Nairobi (30 Oct 2026)
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Share Shot #{currentPhoto.index}:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleShareWhatsApp}
                  className="rounded-lg text-[11px] h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
                >
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleShareLinkedIn}
                  className="rounded-lg text-[11px] h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                >
                  LinkedIn
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleShareX}
                  className="rounded-lg text-[11px] h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  X
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

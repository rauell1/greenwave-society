"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Sparkles,
  ExternalLink,
  Download,
  Share2,
  Copy,
  Check,
  ZoomIn,
  X,
  Award,
  Store,
  Users,
  Camera,
  ChevronLeft,
  ChevronRight,
  Grid,
  Search,
} from "lucide-react";
import type { GraduationPhoto } from "@/lib/cms/graduation-photos";

export interface EventPhotoItem {
  id: string;
  title: string;
  description: string;
  category: "certification" | "market" | "fellowship";
  url: string;
  aspect: "landscape" | "portrait";
  originalUrl?: string;
  index?: number;
}

const SELF_HOSTED_ALBUM_URL = "/events/graduation-cohort-1/album";
const PUBLIC_ALBUM_URL = "https://greenwavesociety.org/events/graduation-cohort-1/album";

export const CURATED_MOMENTS: EventPhotoItem[] = [
  {
    id: "AP1GczNOwine1J1HZHRFOx5xIkLVXIq7pY6UzEKrJwbie03PXiVBz-nxEDTpwN8MZSmwAvnWu75x4kqLy52J4VlHRYM3HRDtfstaWAWX1hf3qtKRokeTGiA",
    title: "YPG Cohort I Official Certification",
    description: "Graduand receiving completion honors and certificate recognition on stage.",
    category: "certification",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_001.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_001.jpg",
    aspect: "landscape",
  },
  {
    id: "AP1GczP_mZy27fJKP5_K3pX1OiNhsUABOOFaeZNQH0fYid9apvDYdPgGKH-rKyC49949ghyNbb2zXNnN2nXTdlMK-3A90CSrmh_4XTnZOsbYfsSSDcrnH5o",
    title: "Inspiring Youth Leadership Address",
    description: "Keynote reflection on grassroots environmental action and systems thinking.",
    category: "certification",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_002.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_002.jpg",
    aspect: "landscape",
  },
  {
    id: "AP1GczOX9ZxkEFRZLUTKg6bwSoHTvMVAOTXRZkuh_Ud58Xg-dQLuBsMTU7oQfMmf8Oke6-faMerdLX3egoyduFn_9pmlV0CiL6ydq1E1fUxJGoX0eABhyrU",
    title: "Presentation of Cohort Honors",
    description: "Recognizing outstanding youth leaders executing climate and community interventions.",
    category: "certification",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_003.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_003.jpg",
    aspect: "landscape",
  },
  {
    id: "AP1GczPhBsZdktzcJUXG7wOowtPsY5LxDumnU-IWRTesyHvQiMzTkQAkozk6D1ELN7patWEPRhBeXTCPgPrLj27YAJzQ0Two_QyPJgWeGVNtYVBTqOOBjWw",
    title: "Capstone Solutions & Community Action",
    description: "Graduands presenting actionable interventions addressing local community needs.",
    category: "certification",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_004.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_004.jpg",
    aspect: "landscape",
  },
  {
    id: "AP1GczOEagBFF-o2PeR40Yy1draiYHJSyCtJslUBzazsewtVW6Lz3sv4oWRdZzz2Vq4qveQoOiyNkZP1i-PPohJbaj1aMadmvMJniXyvhQeP-8_trC2mKG4",
    title: "Proud Milestones with Mentors & Peers",
    description: "Heartfelt celebrations marking months of rigorous learning and community leadership.",
    category: "fellowship",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_005.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_005.jpg",
    aspect: "landscape",
  },
  {
    id: "AP1GczNJNbNh_-yIjbc8VMODE6lZ70rKQUohZyVCaDdcOlKcBjLN--p-x0Y0ZcHb7Xx9DV60lxsvIxZurWRSzORNN8CEsqi-1IJYUAktCHVlFFhQaALGtVE",
    title: "Curated Community Market Showcase",
    description: "Eco-conscious market stalls with healthy snacks, books, and lifestyle creations.",
    category: "market",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_006.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_006.jpg",
    aspect: "landscape",
  },
  {
    id: "graduation_cohort_1_014",
    title: "Zero Single-Use Plastics Artisan Stalls",
    description: "Local vendors and sustainable creators exhibiting handcrafted goods, books, and eco-friendly refreshments.",
    category: "market",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_014.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_014.jpg",
    aspect: "landscape",
  },
  {
    id: "graduation_cohort_1_022",
    title: "Engaged Audience & Changemaker Dialogue",
    description: "Families, mentors, civic leaders, and community guests gathered at Ubunifu Hub in Nairobi.",
    category: "fellowship",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_022.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_022.jpg",
    aspect: "landscape",
  },
  {
    id: "graduation_cohort_1_078",
    title: "Certificate Handover & Honors",
    description: "Celebrating personal milestones and the spirit of youth changemaking on the main stage.",
    category: "certification",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_078.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_078.jpg",
    aspect: "landscape",
  },
  {
    id: "graduation_cohort_1_055",
    title: "Networking & Future Leadership Synergy",
    description: "Building lifelong partnerships for climate resilience, wellness, and youth development.",
    category: "fellowship",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_055.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_055.jpg",
    aspect: "landscape",
  },
  {
    id: "graduation_cohort_1_105",
    title: "Smiles, Milestones & Fellowship",
    description: "Shared joy, gratitude, and community connection at the graduation ceremony.",
    category: "fellowship",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_105.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_105.jpg",
    aspect: "landscape",
  },
  {
    id: "graduation_cohort_1_290",
    title: "The YPG Inaugural Cohort",
    description: "The 12 graduands and peers of YPG: Young Person's Guide to Systems Change Cohort I standing together at Ubunifu Hub.",
    category: "fellowship",
    url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp",
    originalUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/original/graduation_cohort_1_290.jpg",
    aspect: "landscape",
  },
];

const CELEBRATION_POST_TEXT = `🎓 Celebrating Greenwave Society's YPG: Young Person's Guide to Systems Change Cohort I Graduation!

On Friday, 30th October 2026 at Ubunifu Hub, Nairobi, 12 youth changemakers officially graduated after rigorous hands-on training in systems thinking, grassroots climate action, and community leadership through the Young Person's Guide to Systems Change (YPG) program in partnership with The 50 Percent (from an initial cohort of 28 members).

Alongside the ceremony, our zero single-use plastic Community Market connected local artisans, book publishers, and eco-innovators with hundreds of attendees.

📸 Explore the official 296 celebration photo album:
${PUBLIC_ALBUM_URL}

Recap & event details:
https://greenwavesociety.org/events/graduation-cohort-1

#GreenwaveSociety #YPG #YoungPersonsGuide #SystemsChange #YouthLeadership #ClimateAction #CommunityFirst`;

interface GraduationMomentsGalleryProps {
  allPhotos?: GraduationPhoto[];
}

export function GraduationMomentsGallery({ allPhotos = [] }: GraduationMomentsGalleryProps) {
  const [activeTab, setActiveTab] = useState<"curated" | "archive">("curated");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "certification" | "market" | "fellowship">("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<EventPhotoItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxList, setLightboxList] = useState<EventPhotoItem[]>([]);
  const [hasCopied, setHasCopied] = useState(false);
  
  // Archive view state
  const [archiveSearch, setArchiveSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);

  const filteredCurated = useMemo(() => {
    return selectedFilter === "all"
      ? CURATED_MOMENTS
      : CURATED_MOMENTS.filter((item) => item.category === selectedFilter);
  }, [selectedFilter]);

  const filteredArchive = useMemo(() => {
    if (!archiveSearch.trim()) return allPhotos;
    const q = archiveSearch.toLowerCase().trim();
    return allPhotos.filter((p) => {
      return (
        String(p.index).includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.filename.toLowerCase().includes(q)
      );
    });
  }, [allPhotos, archiveSearch]);

  const paginatedArchive = useMemo(() => {
    return filteredArchive.slice(0, visibleCount);
  }, [filteredArchive, visibleCount]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(CELEBRATION_POST_TEXT);
      setHasCopied(true);
      toast.success("Celebration post text copied to clipboard! Ready to paste into LinkedIn, Instagram, or WhatsApp.");
      setTimeout(() => setHasCopied(false), 3000);
    } catch {
      toast.error("Failed to copy text. Please select and copy manually.");
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(CELEBRATION_POST_TEXT);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent("https://greenwavesociety.org/events/graduation-cohort-1");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleShareX = () => {
    const text = encodeURIComponent("🎓 Celebrating Greenwave Society's YPG: Young Person's Guide to Systems Change Cohort I Graduation! 12 graduands certified on 30 Oct 2026 at Ubunifu Hub, Nairobi (from 28 cohort members). View the 296 photo album here:");
    const url = encodeURIComponent(PUBLIC_ALBUM_URL);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const openLightboxFromCurated = (index: number) => {
    setLightboxList(filteredCurated);
    setLightboxIndex(index);
    setLightboxPhoto(filteredCurated[index]);
  };

  const openLightboxFromArchive = (photo: GraduationPhoto, indexInArchive: number) => {
    const photoItem: EventPhotoItem = {
      id: photo.id,
      title: `YPG Ceremony • Photograph #${photo.index}`,
      description: `Authentic photograph captured during the graduation ceremony on Friday, 30th October 2026 at Ubunifu Hub.`,
      category: "fellowship",
      url: photo.webUrl,
      originalUrl: photo.originalUrl,
      aspect: photo.aspect,
      index: photo.index,
    };

    const mappedList: EventPhotoItem[] = filteredArchive.map((p) => ({
      id: p.id,
      title: `YPG Ceremony • Photograph #${p.index}`,
      description: `Authentic photograph captured during the graduation ceremony on Friday, 30th October 2026 at Ubunifu Hub.`,
      category: "fellowship",
      url: p.webUrl,
      originalUrl: p.originalUrl,
      aspect: p.aspect,
      index: p.index,
    }));

    setLightboxList(mappedList);
    setLightboxIndex(indexInArchive);
    setLightboxPhoto(photoItem);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxList.length <= 1) return;
    const nextIdx = lightboxIndex === 0 ? lightboxList.length - 1 : lightboxIndex - 1;
    setLightboxIndex(nextIdx);
    setLightboxPhoto(lightboxList[nextIdx]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxList.length <= 1) return;
    const nextIdx = lightboxIndex === lightboxList.length - 1 ? 0 : lightboxIndex + 1;
    setLightboxIndex(nextIdx);
    setLightboxPhoto(lightboxList[nextIdx]);
  };

  return (
    <section className="py-16 sm:py-20 border-b border-border/50 bg-secondary/10 relative overflow-hidden" id="photos">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-full">
                <Camera className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Celebration Gallery • {allPhotos.length > 0 ? `${allPhotos.length} Photos` : "290+ Photos"}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border rounded-full font-medium">
                Friday, 30 Oct 2026 • Ubunifu Hub
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-foreground tracking-tight">
              Moments from Celebration Day
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Relive the milestone moments at Ubunifu Hub, Nairobi. From certificate presentations and capstone showcases to our zero-plastic community market.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              asChild
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs shadow-md gap-2"
            >
              <Link href={SELF_HOSTED_ALBUM_URL}>
                <Camera className="w-3.5 h-3.5" />
                <span>Open Self-Hosted Album (296 Photos)</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              className="rounded-xl border-border text-xs font-semibold gap-1.5"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? "Copied Celebration Post!" : "Copy Post Caption"}</span>
            </Button>
          </div>
        </div>

        {/* View Switcher: Curated Highlights vs Complete Archive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="inline-flex rounded-xl bg-secondary/60 p-1 border border-border/70 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("curated")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "curated"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Curated Highlights ({CURATED_MOMENTS.length})</span>
            </button>

            {allPhotos.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("archive")}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "archive"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-emerald-600" />
                <span>Complete Archive ({allPhotos.length} Shots)</span>
              </button>
            )}
          </div>

          {activeTab === "curated" ? (
            /* Subcategory Filters for Curated Moments */
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant={selectedFilter === "all" ? "default" : "ghost"}
                onClick={() => setSelectedFilter("all")}
                className="rounded-lg text-xs h-8"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={selectedFilter === "certification" ? "default" : "ghost"}
                onClick={() => setSelectedFilter("certification")}
                className="rounded-lg text-xs h-8 gap-1"
              >
                <Award className="w-3 h-3 text-gold" />
                Stage & Certifications
              </Button>
              <Button
                size="sm"
                variant={selectedFilter === "market" ? "default" : "ghost"}
                onClick={() => setSelectedFilter("market")}
                className="rounded-lg text-xs h-8 gap-1"
              >
                <Store className="w-3 h-3 text-emerald-500" />
                Market
              </Button>
              <Button
                size="sm"
                variant={selectedFilter === "fellowship" ? "default" : "ghost"}
                onClick={() => setSelectedFilter("fellowship")}
                className="rounded-lg text-xs h-8 gap-1"
              >
                <Users className="w-3 h-3 text-blue-500" />
                Fellowship
              </Button>
            </div>
          ) : (
            /* Search input for Complete Archive */
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search photo # (e.g. 42)..."
                value={archiveSearch}
                onChange={(e) => {
                  setArchiveSearch(e.target.value);
                  setVisibleCount(24);
                }}
                className="pl-8 h-8 text-xs rounded-xl"
              />
            </div>
          )}
        </div>

        {/* TAB 1: CURATED HIGHLIGHTS GRID */}
        {activeTab === "curated" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCurated.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => openLightboxFromCurated(idx)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5" /> Enlarge Photo
                    </span>
                    <Badge variant="outline" className="border-white/40 text-white bg-black/40 text-[10px] uppercase">
                      {photo.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {photo.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
                    <span className="font-mono">Cohort I &bull; 30 Oct 2026</span>
                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:underline">
                      View <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: COMPLETE PHOTO ARCHIVE GRID (Ultra-Lightweight 21KB WebP Thumbnails) */}
        {activeTab === "archive" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Showing <strong>{paginatedArchive.length}</strong> of <strong>{filteredArchive.length}</strong> photographs
              </span>
              <span className="font-mono text-[11px]">
                Pre-compressed WebP CDN delivery
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {paginatedArchive.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => openLightboxFromArchive(p, idx)}
                  className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border/60 hover:border-primary/60 shadow-xs hover:shadow-md transition-all relative flex flex-col"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    <Image
                      src={p.thumbUrl}
                      alt={`Ceremony photograph #${p.index}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] font-mono text-white/90">
                        #{p.index}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination / Load More */}
            {visibleCount < filteredArchive.length && (
              <div className="text-center pt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredArchive.length))}
                  className="rounded-xl text-xs font-semibold px-6 shadow-sm"
                >
                  Load Next 24 Photos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(filteredArchive.length)}
                  className="rounded-xl text-xs font-medium"
                >
                  Show All {filteredArchive.length} Photos
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Full Album Banner & Social Celebration Kit */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-primary to-emerald-900 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Album Access & Download Info */}
            <div className="lg:col-span-7 space-y-4">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[11px] font-mono tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-gold" /> Complete Event Photography Archive
              </Badge>

              <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
                Access All 296 High-Resolution Event Photographs
              </h3>

              <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
                All 296 authentic camera photographs from Friday, 30th October 2026 are hosted directly on Greenwave Society&apos;s high-speed CDN infrastructure with zero third-party dependencies.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs shadow-lg gap-2"
                >
                  <Link href={SELF_HOSTED_ALBUM_URL}>
                    <Camera className="w-4 h-4" />
                    <span>Open Interactive Photo Album (296 Photos)</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCopyText}
                  className="rounded-xl border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold gap-2"
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopied ? "Text Copied!" : "Copy Celebration Summary"}</span>
                </Button>
              </div>

              <div className="text-[11px] text-white/70 pt-1 flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>
                  <strong>Fast CDN Delivery:</strong> Browse responsive thumbnails with zero lag, switch between grid and masonry views, or open any photograph to inspect in full HD and download the original camera master JPG.
                </span>
              </div>
            </div>

            {/* Right Column: 1-Click Social Sharing Kit */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-gold" />
                <h4 className="font-serif font-bold text-sm text-white">
                  Spread the Word & Celebrate!
                </h4>
              </div>

              <p className="text-white/75 text-[11px] leading-relaxed">
                Congratulate our 12 certified youth leaders across your personal or organizational channels:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  onClick={handleShareWhatsApp}
                  size="sm"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs"
                >
                  WhatsApp
                </Button>

                <Button
                  type="button"
                  onClick={handleShareLinkedIn}
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                >
                  LinkedIn
                </Button>

                <Button
                  type="button"
                  onClick={handleShareX}
                  size="sm"
                  className="rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs"
                >
                  X (Twitter)
                </Button>
              </div>

              <div className="pt-2 border-t border-white/15">
                <div className="text-[10px] text-white/60 uppercase font-mono mb-1.5">Official Hashtags</div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-white/90">
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#GreenwaveSociety</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#YPG</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#SystemsChange</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#YouthLeadership</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#ClimateAction</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="p-3.5 sm:p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-slate-200">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs uppercase">
                  {lightboxPhoto.index ? `Photo #${lightboxPhoto.index}` : lightboxPhoto.category}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {lightboxIndex + 1} of {lightboxList.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 text-xs gap-1.5 h-8"
                >
                  <Link href={SELF_HOSTED_ALBUM_URL}>
                    <Grid className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">All 296 Photos</span>
                  </Link>
                </Button>

                {lightboxPhoto.originalUrl && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 text-xs gap-1.5 h-8"
                  >
                    <a href={lightboxPhoto.originalUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="w-3.5 h-3.5 text-gold" />
                      <span className="hidden sm:inline">Download Full Res</span>
                    </a>
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo view */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black">
              <Image
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-contain"
                priority
              />

              {/* Prev / Next controls */}
              {lightboxList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-md"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-md"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Footer caption */}
            <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                  {lightboxPhoto.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lightboxPhoto.description}
                </p>
              </div>

              {lightboxPhoto.originalUrl && (
                <div className="shrink-0 text-[11px] text-slate-400 font-mono">
                  Origin: Cloudflare CDN
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export interface EventPhotoItem {
  id: string;
  title: string;
  description: string;
  category: "certification" | "market" | "fellowship";
  url: string;
  aspect: "landscape" | "portrait";
}

const GRADUATION_ALBUM_URL = "https://photos.app.goo.gl/9wmows3AZ1XrzS4J6";

export const CURATED_MOMENTS: EventPhotoItem[] = [
  {
    id: "AP1GczNOwine1J1HZHRFOx5xIkLVXIq7pY6UzEKrJwbie03PXiVBz-nxEDTpwN8MZSmwAvnWu75x4kqLy52J4VlHRYM3HRDtfstaWAWX1hf3qtKRokeTGiA",
    title: "Empower 360 Cohort I Official Certification",
    description: "Graduand receiving completion honors and certificate recognition on stage.",
    category: "certification",
    url: "https://lh3.googleusercontent.com/pw/AP1GczNOwine1J1HZHRFOx5xIkLVXIq7pY6UzEKrJwbie03PXiVBz-nxEDTpwN8MZSmwAvnWu75x4kqLy52J4VlHRYM3HRDtfstaWAWX1hf3qtKRokeTGiA=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczP_mZy27fJKP5_K3pX1OiNhsUABOOFaeZNQH0fYid9apvDYdPgGKH-rKyC49949ghyNbb2zXNnN2nXTdlMK-3A90CSrmh_4XTnZOsbYfsSSDcrnH5o",
    title: "Inspiring Youth Leadership Address",
    description: "Keynote reflection on grassroots environmental action and systems thinking.",
    category: "certification",
    url: "https://lh3.googleusercontent.com/pw/AP1GczP_mZy27fJKP5_K3pX1OiNhsUABOOFaeZNQH0fYid9apvDYdPgGKH-rKyC49949ghyNbb2zXNnN2nXTdlMK-3A90CSrmh_4XTnZOsbYfsSSDcrnH5o=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczOX9ZxkEFRZLUTKg6bwSoHTvMVAOTXRZkuh_Ud58Xg-dQLuBsMTU7oQfMmf8Oke6-faMerdLX3egoyduFn_9pmlV0CiL6ydq1E1fUxJGoX0eABhyrU",
    title: "Presentation of Cohort Honors",
    description: "Recognizing outstanding youth leaders executing climate and community interventions.",
    category: "certification",
    url: "https://lh3.googleusercontent.com/pw/AP1GczOX9ZxkEFRZLUTKg6bwSoHTvMVAOTXRZkuh_Ud58Xg-dQLuBsMTU7oQfMmf8Oke6-faMerdLX3egoyduFn_9pmlV0CiL6ydq1E1fUxJGoX0eABhyrU=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczPhBsZdktzcJUXG7wOowtPsY5LxDumnU-IWRTesyHvQiMzTkQAkozk6D1ELN7patWEPRhBeXTCPgPrLj27YAJzQ0Two_QyPJgWeGVNtYVBTqOOBjWw",
    title: "Capstone Solutions & Community Action",
    description: "Graduands presenting actionable interventions addressing local community needs.",
    category: "certification",
    url: "https://lh3.googleusercontent.com/pw/AP1GczPhBsZdktzcJUXG7wOowtPsY5LxDumnU-IWRTesyHvQiMzTkQAkozk6D1ELN7patWEPRhBeXTCPgPrLj27YAJzQ0Two_QyPJgWeGVNtYVBTqOOBjWw=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczOEagBFF-o2PeR40Yy1draiYHJSyCtJslUBzazsewtVW6Lz3sv4oWRdZzz2Vq4qveQoOiyNkZP1i-PPohJbaj1aMadmvMJniXyvhQeP-8_trC2mKG4",
    title: "Proud Milestones with Mentors & Peers",
    description: "Heartfelt celebrations marking months of rigorous learning and community leadership.",
    category: "fellowship",
    url: "https://lh3.googleusercontent.com/pw/AP1GczOEagBFF-o2PeR40Yy1draiYHJSyCtJslUBzazsewtVW6Lz3sv4oWRdZzz2Vq4qveQoOiyNkZP1i-PPohJbaj1aMadmvMJniXyvhQeP-8_trC2mKG4=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczNJNbNh_-yIjbc8VMODE6lZ70rKQUohZyVCaDdcOlKcBjLN--p-x0Y0ZcHb7Xx9DV60lxsvIxZurWRSzORNN8CEsqi-1IJYUAktCHVlFFhQaALGtVE",
    title: "Curated Community Market Showcase",
    description: "Eco-conscious market stalls with healthy snacks, books, and lifestyle creations.",
    category: "market",
    url: "https://lh3.googleusercontent.com/pw/AP1GczNJNbNh_-yIjbc8VMODE6lZ70rKQUohZyVCaDdcOlKcBjLN--p-x0Y0ZcHb7Xx9DV60lxsvIxZurWRSzORNN8CEsqi-1IJYUAktCHVlFFhQaALGtVE=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczMAMPKV1IzkeKeMjWVAqmeHXTNdeNE_c0gPR9lkxhujG4sFtBe5hP2ZCLAQQ4raWlQwvzjiN_VJNingegZ5LczmfPfNXmstXjOWNvp_rucwLkPHn2s",
    title: "Zero Single-Use Plastics Artisan Stalls",
    description: "Local vendors exhibiting sustainable crafts, books, and eco-friendly refreshments.",
    category: "market",
    url: "https://lh3.googleusercontent.com/pw/AP1GczMAMPKV1IzkeKeMjWVAqmeHXTNdeNE_c0gPR9lkxhujG4sFtBe5hP2ZCLAQQ4raWlQwvzjiN_VJNingegZ5LczmfPfNXmstXjOWNvp_rucwLkPHn2s=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczPlzS_581kdQz4MYt4ZzK-vmJDwgoDXK7TQKE25F3_dVnX4vbygci71w0RAz5EnCBC1vp0inE5iWKTfmd2b9gmzDLAgPELekE-VIqe70dWxW9hlEpc",
    title: "Engaged Audience & Changemaker Dialogue",
    description: "Families, mentors, and community guests gathered at Ubunifu Hub in Nairobi.",
    category: "fellowship",
    url: "https://lh3.googleusercontent.com/pw/AP1GczPlzS_581kdQz4MYt4ZzK-vmJDwgoDXK7TQKE25F3_dVnX4vbygci71w0RAz5EnCBC1vp0inE5iWKTfmd2b9gmzDLAgPELekE-VIqe70dWxW9hlEpc=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczNxQde3jf37S0zPjnRMqG26gpsx6frZs3G_KHh1EpEMoMX0lTQ5NxBtHIGZZOwjaxghK5PzCGWgEv2881xkphxfsRnhtYJ27KSB1qLXZLbIMTvuGG8",
    title: "Certificate Handover & Honors",
    description: "Celebrating personal milestones and the spirit of youth changemaking.",
    category: "certification",
    url: "https://lh3.googleusercontent.com/pw/AP1GczNxQde3jf37S0zPjnRMqG26gpsx6frZs3G_KHh1EpEMoMX0lTQ5NxBtHIGZZOwjaxghK5PzCGWgEv2881xkphxfsRnhtYJ27KSB1qLXZLbIMTvuGG8=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczNzjPFbeW4de9iBgb03WyPhiwmuyBTIRgYAdAuK4SvAgT0_ko6Cnc7etj01HD0R-R-kp3pXlIaDB31yunu6W44tkehBlaKgbVxM39oqW6KaeWJ-OwA",
    title: "Networking & Future Leadership Synergy",
    description: "Building lifelong partnerships for climate resilience, wellness, and youth development.",
    category: "fellowship",
    url: "https://lh3.googleusercontent.com/pw/AP1GczNzjPFbeW4de9iBgb03WyPhiwmuyBTIRgYAdAuK4SvAgT0_ko6Cnc7etj01HD0R-R-kp3pXlIaDB31yunu6W44tkehBlaKgbVxM39oqW6KaeWJ-OwA=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczP1JO_iXOfkQ4-LYKWMQMXXQQB7pJd1lOO1kwNsQGXrcXdd3nU3Ozp8albMC3x3bjSvBLGUUKCTqP4dtJu7gy0XysYPyHcmq0hMHekU8ItlpP84dVU",
    title: "Smiles, Milestones & Fellowship",
    description: "Shared joy, gratitude, and community connection at the graduation ceremony.",
    category: "fellowship",
    url: "https://lh3.googleusercontent.com/pw/AP1GczP1JO_iXOfkQ4-LYKWMQMXXQQB7pJd1lOO1kwNsQGXrcXdd3nU3Ozp8albMC3x3bjSvBLGUUKCTqP4dtJu7gy0XysYPyHcmq0hMHekU8ItlpP84dVU=w1200-h800-no",
    aspect: "landscape",
  },
  {
    id: "AP1GczPCqkf5PUDNaeSDBWAoUGSARnDv0o1PpbnkYj5-SvfuziAkQ0DCd24S1vPzalM8cTAQOr-9bp3byHHJ3BADJulXNQinXqSx2YDv8n2xcQb-ZjzTYNg",
    title: "The Empower 360 Inaugural Cohort",
    description: "The 26 changemakers of Empower 360 Cohort I standing together at Ubunifu Hub.",
    category: "fellowship",
    url: "https://lh3.googleusercontent.com/pw/AP1GczPCqkf5PUDNaeSDBWAoUGSARnDv0o1PpbnkYj5-SvfuziAkQ0DCd24S1vPzalM8cTAQOr-9bp3byHHJ3BADJulXNQinXqSx2YDv8n2xcQb-ZjzTYNg=w1200-h800-no",
    aspect: "landscape",
  },
];

const CELEBRATION_POST_TEXT = `🎓 Celebrating Greenwave Society's Empower 360 Cohort I Graduation!

On Friday, 30th October 2026 at Ubunifu Hub, Nairobi, 26 youth changemakers officially graduated after rigorous hands-on training in systems thinking, grassroots climate action, and community leadership.

Alongside the ceremony, our zero single-use plastic Community Market connected local artisans, book publishers, and eco-innovators with hundreds of attendees.

📸 Explore the official 290+ celebration photo album:
${GRADUATION_ALBUM_URL}

Recap & event details:
https://greenwavesociety.org/events/graduation-cohort-1

#GreenwaveSociety #Empower360 #YouthLeadership #ClimateAction #CommunityFirst`;

export function GraduationMomentsGallery() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "certification" | "market" | "fellowship">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const filteredPhotos = selectedFilter === "all"
    ? CURATED_MOMENTS
    : CURATED_MOMENTS.filter((item) => item.category === selectedFilter);

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
    const text = encodeURIComponent("🎓 Celebrating Greenwave Society's Empower 360 Cohort I Graduation! 26 changemakers certified on 30 Oct 2026 at Ubunifu Hub, Nairobi. View the 290+ photo album here:");
    const url = encodeURIComponent(GRADUATION_ALBUM_URL);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section className="py-16 sm:py-20 border-b border-border/50 bg-secondary/10 relative overflow-hidden" id="photos">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-full">
                <Camera className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Official Celebration Gallery &bull; 290+ Photos
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border rounded-full font-medium">
                Friday, 30 Oct 2026
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
              <a href={GRADUATION_ALBUM_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Google Photos Album (290+ Photos)</span>
              </a>
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
          <Button
            size="sm"
            variant={selectedFilter === "all" ? "default" : "outline"}
            onClick={() => setSelectedFilter("all")}
            className="rounded-xl text-xs font-medium"
          >
            All Highlight Moments ({CURATED_MOMENTS.length})
          </Button>

          <Button
            size="sm"
            variant={selectedFilter === "certification" ? "default" : "outline"}
            onClick={() => setSelectedFilter("certification")}
            className="rounded-xl text-xs font-medium gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-gold" />
            Certifications & Stage
          </Button>

          <Button
            size="sm"
            variant={selectedFilter === "market" ? "default" : "outline"}
            onClick={() => setSelectedFilter("market")}
            className="rounded-xl text-xs font-medium gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-emerald-500" />
            Community Market Stalls
          </Button>

          <Button
            size="sm"
            variant={selectedFilter === "fellowship" ? "default" : "outline"}
            onClick={() => setSelectedFilter("fellowship")}
            className="rounded-xl text-xs font-medium gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            Fellowship & Community
          </Button>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(idx)}
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
                Access All 290+ High-Resolution Event Photographs
              </h3>

              <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
                All authentic camera photographs from Friday, 30th October 2026 are published in the shared Google Photos repository. You can browse, bookmark, and download the entire collection in full original resolution.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs shadow-lg gap-2"
                >
                  <a href={GRADUATION_ALBUM_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Google Photos Shared Album</span>
                  </a>
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
                  <strong>Tip to download all:</strong> Open the Google Photos album, click the three dots (<strong>⋮</strong>) in the top-right corner, and select <strong>&quot;Download all&quot;</strong> (or press <strong>Shift + D</strong>) to save the full archive as a single ZIP.
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
                Congratulate our 26 inaugural youth leaders across your personal or organizational channels:
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
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#Empower360</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#YouthLeadership</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10">#ClimateAction</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Dialog */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-slate-200">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs uppercase">
                  {currentPhoto.category}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {lightboxIndex !== null ? `${lightboxIndex + 1} of ${filteredPhotos.length}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
                >
                  <a href={GRADUATION_ALBUM_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1 text-gold" /> Album
                  </a>
                </Button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo view */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black">
              <Image
                src={currentPhoto.url}
                alt={currentPhoto.title}
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-contain"
                priority
              />

              {/* Prev / Next controls */}
              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) =>
                        prev !== null ? (prev === 0 ? filteredPhotos.length - 1 : prev - 1) : null
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) =>
                        prev !== null ? (prev === filteredPhotos.length - 1 ? 0 : prev + 1) : null
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Footer caption */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-1 text-left">
              <h4 className="font-serif font-bold text-base text-white">
                {currentPhoto.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentPhoto.description} &bull; Empower 360 Cohort I Graduation & Community Market at Ubunifu Hub, Nairobi (30 Oct 2026).
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

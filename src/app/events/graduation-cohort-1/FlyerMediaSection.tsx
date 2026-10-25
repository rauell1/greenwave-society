"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Share2, Check, Smartphone, FileText, Sparkles, Store, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FlyerAsset {
  id: string;
  category: "attendee" | "vendor";
  edition: "v1" | "v2";
  format: "standard" | "story";
  title: string;
  badge: string;
  editionBadge: string;
  description: string;
  imageSrc: string;
  downloadSrc: string;
  highResSrc?: string;
  aspectRatio: string;
  dimensions: string;
}

const FLYER_ASSETS: FlyerAsset[] = [
  // --- Edition 1: Community Campaign Posters ---
  {
    id: "attendee-v1-standard",
    category: "attendee",
    edition: "v1",
    format: "standard",
    title: "Empower 360 Cohort I Graduation: Community Campaign Flyer",
    badge: "Edition 1: Community Campaign",
    editionBadge: "Community Campaign Edition",
    description: "Vibrant grassroots targeting poster featuring our arched emerald banners, Greenwave Society circular emblem, welcoming 'Bring a Friend!' invitation, and verified RSVP pass. Ideal for local community groups, youth networks, and WhatsApp circulars.",
    imageSrc: "/posters/v1-empower360-graduation-flyer.png",
    downloadSrc: "/downloads/v1-empower360-graduation-flyer.png",
    highResSrc: "/downloads/v1-empower360-graduation-flyer-2x.png",
    aspectRatio: "aspect-[723/1024]",
    dimensions: "723 × 1024 px (Print 2X: 1446 × 2048 px)",
  },
  {
    id: "attendee-v1-story",
    category: "attendee",
    edition: "v1",
    format: "story",
    title: "Graduation Mobile Story: Community Campaign (9:16)",
    badge: "Edition 1: WhatsApp & IG Story",
    editionBadge: "Community Story Cut",
    description: "Full-bleed 9:16 vertical poster formatted specifically for phone screens and WhatsApp Status updates with high-contrast typography and large scannable QR code.",
    imageSrc: "/posters/v1-empower360-graduation-story.png",
    downloadSrc: "/downloads/v1-empower360-graduation-story.png",
    aspectRatio: "aspect-[9/16]",
    dimensions: "1080 × 1920 px (9:16 Vertical)",
  },
  {
    id: "vendor-v1-standard",
    category: "vendor",
    edition: "v1",
    format: "standard",
    title: "Community Market Call for Vendors: Campaign Flyer",
    badge: "Edition 1: Market Campaign",
    editionBadge: "Community Campaign Edition",
    description: "Official recruitment flyer for sustainable vendors and local artisans. Highlights subsidized KES 1,000 fee, provided tables/chairs, and zero single-use plastics policy.",
    imageSrc: "/posters/v1-empower360-market-vendor-flyer.png",
    downloadSrc: "/downloads/v1-empower360-market-vendor-flyer.png",
    highResSrc: "/downloads/v1-empower360-market-vendor-flyer-2x.png",
    aspectRatio: "aspect-[723/1024]",
    dimensions: "723 × 1024 px (Print 2X available)",
  },
  {
    id: "vendor-v1-story",
    category: "vendor",
    edition: "v1",
    format: "story",
    title: "Vendor Recruitment Mobile Story: Campaign Cut (9:16)",
    badge: "Edition 1: WhatsApp & IG Story",
    editionBadge: "Community Story Cut",
    description: "Full-bleed 9:16 vertical vendor call poster designed for phone screens. Direct QR link to the online vendor application portal with deadline reminders.",
    imageSrc: "/posters/v1-empower360-market-vendor-story.png",
    downloadSrc: "/downloads/v1-empower360-market-vendor-story.png",
    aspectRatio: "aspect-[9/16]",
    dimensions: "1080 × 1920 px (9:16 Vertical)",
  },

  // --- Edition 2: Cinematic Celebration Posters ---
  {
    id: "attendee-v2-standard",
    category: "attendee",
    edition: "v2",
    format: "standard",
    title: "Empower 360 Cohort I Graduation: Cinematic Celebration Poster",
    badge: "Edition 2: Cinematic Stage Poster",
    editionBadge: "Cinematic Celebration Edition",
    description: "Bold, dramatic targeting poster capturing the triumphant commencement atmosphere on stage with emerald and gold lighting, diplomas held high, and verified RSVP pass. Best for Instagram feeds, LinkedIn, and institutional announcements.",
    imageSrc: "/posters/v2-empower360-graduation-stage-flyer.png",
    downloadSrc: "/downloads/v2-empower360-graduation-stage-flyer.png",
    highResSrc: "/downloads/v2-empower360-graduation-stage-flyer-2x.png",
    aspectRatio: "aspect-[723/1024]",
    dimensions: "723 × 1024 px (Print 2X: 1446 × 2048 px)",
  },
  {
    id: "attendee-v2-story",
    category: "attendee",
    edition: "v2",
    format: "story",
    title: "Graduation Mobile Story: Cinematic Celebration (9:16)",
    badge: "Edition 2: WhatsApp & IG Story",
    editionBadge: "Cinematic Story Cut",
    description: "Full-bleed 9:16 vertical story invitation with dramatic stage celebration lighting, crisp typography, and high-contrast scannable QR code.",
    imageSrc: "/posters/v2-empower360-graduation-story.png",
    downloadSrc: "/downloads/v2-empower360-graduation-story.png",
    aspectRatio: "aspect-[9/16]",
    dimensions: "1080 × 1920 px (9:16 Vertical)",
  },
  {
    id: "vendor-v2-standard",
    category: "vendor",
    edition: "v2",
    format: "standard",
    title: "Community Market & Creative Showcase: Atmospheric Poster",
    badge: "Edition 2: Creative Showcase",
    editionBadge: "Atmospheric Showcase Edition",
    description: "Dramatic targeting poster for the open-air courtyard marketplace, featuring eco-creatives and artisans alongside the graduation ceremony.",
    imageSrc: "/posters/v2-empower360-community-market-flyer.png",
    downloadSrc: "/downloads/v2-empower360-community-market-flyer.png",
    highResSrc: "/downloads/v2-empower360-community-market-flyer-2x.png",
    aspectRatio: "aspect-[723/1024]",
    dimensions: "723 × 1024 px (Print 2X available)",
  },
  {
    id: "vendor-v2-story",
    category: "vendor",
    edition: "v2",
    format: "story",
    title: "Vendor Recruitment Mobile Story: Atmospheric Cut (9:16)",
    badge: "Edition 2: WhatsApp & IG Story",
    editionBadge: "Atmospheric Story Cut",
    description: "Full-bleed 9:16 vertical market poster designed for status updates with direct application link.",
    imageSrc: "/posters/v2-empower360-market-vendor-story.png",
    downloadSrc: "/downloads/v2-empower360-market-vendor-story.png",
    aspectRatio: "aspect-[9/16]",
    dimensions: "1080 × 1920 px (9:16 Vertical)",
  },
];

interface FlyerMediaSectionProps {
  categoryFilter?: "attendee" | "vendor" | "all";
}

export function FlyerMediaSection({ categoryFilter = "all" }: FlyerMediaSectionProps) {
  const initialCategory = categoryFilter === "vendor" ? "vendor" : "attendee";
  const [selectedCategory, setSelectedCategory] = useState<"attendee" | "vendor">(initialCategory);
  const [selectedEdition, setSelectedEdition] = useState<"v1" | "v2">("v1");
  const [selectedFormat, setSelectedFormat] = useState<"standard" | "story">("standard");
  const [copied, setCopied] = useState(false);

  const effectiveCategory = categoryFilter === "all" ? selectedCategory : categoryFilter;

  const activeAsset = FLYER_ASSETS.find((asset) => {
    return (
      asset.category === effectiveCategory &&
      asset.edition === selectedEdition &&
      asset.format === selectedFormat
    );
  }) || FLYER_ASSETS[0];

  const handleShareWhatsApp = () => {
    const text = effectiveCategory === "attendee"
      ? "🎓 Join us for Greenwave Society's Empower 360 Ad Hoc Cohort I Graduation on Friday, 30th October 2026 (10:30 AM - 3:00 PM) at Ubunifu Hub, Nairobi! +1s welcome! Details & RSVP: https://greenwavesociety.org/events/graduation-cohort-1"
      : "🛍️ Calling sustainable brands & creatives! Showcase your venture at the Empower 360 Community Market on Friday, 30th October 2026 at Ubunifu Hub, Nairobi. KES 1,000 flat fee, tables & chairs provided, zero single-use plastics rule. Apply online: https://greenwavesociety.org/events/community-market";
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sectionBadge = effectiveCategory === "vendor"
    ? "Official Market Posters & Vendor Call Kit"
    : "Official Graduation Posters & Social Media Kit";

  const sectionTitle = effectiveCategory === "vendor"
    ? "Download & Share the Market Posters"
    : "Download & Share the Event Flyers";

  const sectionDescription = effectiveCategory === "vendor"
    ? "Help spread the word to sustainable local brands, snack creators, authors, and craft artisans! Download high-resolution print graphics or ready-to-post 9:16 mobile story cuts for WhatsApp Status and Instagram."
    : "Help us celebrate our graduating cohort! Grab the official invitations in high-resolution portrait or ready-to-post 9:16 story cuts for WhatsApp Status and Instagram.";

  return (
    <div className="rounded-3xl bg-secondary/15 border border-border/70 p-6 sm:p-8 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold" /> {sectionBadge}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
            {sectionTitle.slice(0, sectionTitle.lastIndexOf(" "))}{" "}
            <span className="italic font-normal text-primary">
              {sectionTitle.slice(sectionTitle.lastIndexOf(" ") + 1)}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            {sectionDescription}
          </p>
        </div>

        {/* Category Selector Tabs only when categoryFilter === "all" */}
        {categoryFilter === "all" && (
          <div className="inline-flex p-1.5 bg-background/80 rounded-2xl border border-border/80 shadow-inner">
            <button
              onClick={() => setSelectedCategory("attendee")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === "attendee"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Graduation Invite
            </button>
            <button
              onClick={() => setSelectedCategory("vendor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === "vendor"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="w-4 h-4" /> Vendor Call Flyer
            </button>
          </div>
        )}
      </div>

      {/* Edition & Format Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-border/50">
        {/* Edition Selector Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Style:
          </span>
          <div className="inline-flex p-1 bg-background/80 rounded-xl border border-border/70 shadow-xs">
            <button
              onClick={() => setSelectedEdition("v1")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedEdition === "v1"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌿 Version 1: Community Campaign
            </button>
            <button
              onClick={() => setSelectedEdition("v2")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedEdition === "v2"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌟 Version 2: Cinematic Celebration
            </button>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Format:
          </span>
          <div className="inline-flex p-1 bg-background/60 rounded-xl border border-border/60">
            <button
              onClick={() => setSelectedFormat("standard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedFormat === "standard"
                  ? "bg-primary/15 text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Portrait Flyer (Print / Feed)
            </button>
            <button
              onClick={() => setSelectedFormat("story")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedFormat === "story"
                  ? "bg-primary/15 text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> 9:16 Mobile Story
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="rounded-xl border-border/70 text-xs gap-1.5 h-8"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? "Link Copied" : "Copy Page Link"}
          </Button>

          <Button
            size="sm"
            onClick={handleShareWhatsApp}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" /> Share to WhatsApp
          </Button>
        </div>
      </div>

      {/* Active Flyer Card Preview & Action Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Visual Poster Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className={`relative w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-border/80 bg-background/40 p-2 group`}>
            <div className={`relative w-full ${activeAsset.aspectRatio} rounded-xl overflow-hidden shadow-inner bg-stone-100`}>
              <Image
                src={activeAsset.imageSrc}
                alt={activeAsset.title}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>
            <div className="mt-2 px-2 py-1 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>{activeAsset.dimensions}</span>
              <span className="text-emerald-600 font-semibold">Ready to Share</span>
            </div>
          </div>
        </div>

        {/* Poster Metadata & 1-Click Downloads */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 rounded-full font-semibold">
                {activeAsset.badge}
              </Badge>
              <Badge variant="secondary" className="text-xs rounded-full font-mono text-muted-foreground">
                {activeAsset.editionBadge}
              </Badge>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
              {activeAsset.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              {activeAsset.description}
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-background/60 border border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground block font-mono uppercase text-[10px]">Date & Venue</span>
              <span className="font-semibold text-foreground">Fri 30 Oct 2026 • Ubunifu Hub</span>
            </div>
            <div>
              <span className="text-muted-foreground block font-mono uppercase text-[10px]">Style Edition</span>
              <span className="font-semibold text-primary">{activeAsset.editionBadge}</span>
            </div>
            <div>
              <span className="text-muted-foreground block font-mono uppercase text-[10px]">Embedded Feature</span>
              <span className="font-semibold text-foreground">Functional QR Code</span>
            </div>
            <div>
              <span className="text-muted-foreground block font-mono uppercase text-[10px]">Resolution</span>
              <span className="font-semibold text-foreground">{activeAsset.dimensions}</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="default" className="rounded-xl shadow-sm gap-2">
              <a href={activeAsset.downloadSrc} download>
                <Download className="w-4 h-4" /> Download Graphic (PNG)
              </a>
            </Button>

            {activeAsset.highResSrc && (
              <Button asChild variant="outline" size="default" className="rounded-xl border-border/80 gap-2">
                <a href={activeAsset.highResSrc} download>
                  <Download className="w-4 h-4" /> High-Res Print (2X)
                </a>
              </Button>
            )}

            <Button
              variant="secondary"
              size="default"
              onClick={handleShareWhatsApp}
              className="rounded-xl gap-2 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20"
            >
              <Smartphone className="w-4 h-4" /> Post on Status
            </Button>
          </div>

          {/* Note */}
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {effectiveCategory === "vendor"
              ? "Vendors and partners are encouraged to share this call with eco-conscious brands, snack artisans, sustainable fashion makers, and community creators."
              : "Graduands and guests are encouraged to post the invitation on their WhatsApp status and social channels with their personal invitation notes."}
          </p>
        </div>
      </div>
    </div>
  );
}

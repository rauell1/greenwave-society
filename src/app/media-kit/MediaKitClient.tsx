"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Film, Palette, Type, Download, Layers, Mail, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

export function MediaKitClient() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<"16:9" | "4:5" | "1:1" | "9:16">("16:9");

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  }

  const shortBoilerplate =
    "Greenwave Society is a youth-led social enterprise and think tank in Nairobi, Kenya. We translate systems thinking into community action through enterprise training, the Empower 360 leadership pipeline, and grassroots environmental action.";

  const longBoilerplate =
    "Greenwave Society is a Kenyan youth-led social enterprise and think tank accelerating climate resilience and equipping young people aged 18-35 as changemakers. Through initiatives like the Empower 360 flagship leadership programme (celebrating its inaugural Ad Hoc Cohort I graduands), Systems Mtaani analyses, collaborative training with partners like The 50 Percent, community barazas, and grassroots conservation, the organization bridges the gap between youth potential and systemic community transformation.";

  const brandColors = [
    { name: "Forest Green", hex: "#1b4332", oklch: "oklch(0.35 0.09 145)", role: "Primary Brand Voice & Anchor" },
    { name: "Emerald Growth", hex: "#047857", oklch: "oklch(0.55 0.14 150)", role: "Action, Accents & Environmental Initiatives" },
    { name: "Savannah Gold", hex: "#d4af37", oklch: "oklch(0.74 0.12 80)", role: "Highlights, Badges & Optimism" },
    { name: "Sand Canvas", hex: "#f9f7f2", oklch: "oklch(0.975 0.015 85)", role: "Warm Light Backgrounds" },
    { name: "Deep Ink", hex: "#111827", oklch: "oklch(0.22 0.035 145)", role: "High-Contrast Typography & Headers" },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Motion Kit / Films Showcase */}
      <section id="films" className="rounded-3xl bg-secondary/15 border border-border/70 p-6 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
              <Film className="w-3.5 h-3.5" /> Code-Rendered Motion Assets
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-foreground">
              Official Brand Films & Motion Reels
            </h2>
          </div>
          {/* Ratio Selector */}
          <div className="flex items-center gap-1.5 p-1.5 bg-background border border-border/80 rounded-2xl shadow-sm">
            {(["16:9", "4:5", "1:1", "9:16"] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setSelectedRatio(ratio)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedRatio === ratio
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl leading-relaxed mb-8">
          Our motion kit is drawn from code using Greenwave&apos;s own brand tokens, typography, and acoustic sound synthesis. Each cut is designed to fit the user&apos;s viewport natively without artificial cropping.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Film 1: The Wave */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif font-bold text-lg text-foreground">The Wave: Brand Anthem</span>
                <Badge variant="outline" className="text-xs font-mono">30 Seconds</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                Our core brand story: turning systems thinking into direct community change across Kenya&apos;s ecosystems and youth landscapes.
              </p>
              <div className="rounded-xl bg-black/90 p-6 text-center text-white/80 space-y-2 mb-4 border border-zinc-800">
                <div className="text-xs uppercase tracking-widest text-gold font-mono">Motion Master ({selectedRatio})</div>
                <div className="text-xs text-zinc-400">Synthesized Kalimba, Marimba & Rhythmic Bass</div>
                <p className="text-[11px] text-zinc-500 italic">Available in 1080p Master & Web Optimized stream</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <span>Best for: {selectedRatio === "16:9" ? "Websites & Presentations" : selectedRatio === "9:16" ? "Reels & TikTok Stories" : "Instagram & LinkedIn Feeds"}</span>
            </div>
          </div>

          {/* Film 2: Six Ways In */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif font-bold text-lg text-foreground">Six Ways In: Programme Reel</span>
                <Badge variant="outline" className="text-xs font-mono">20 Seconds</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                A rapid, energetic walk-through of Greenwave&apos;s key pillars: Empower 360 flagship leadership, Systems Thinking training with The 50 Percent, Systems Mtaani, Community Barazas, and Ecological Action.
              </p>
              <div className="rounded-xl bg-black/90 p-6 text-center text-white/80 space-y-2 mb-4 border border-zinc-800">
                <div className="text-xs uppercase tracking-widest text-gold font-mono">Programme Reel ({selectedRatio})</div>
                <div className="text-xs text-zinc-400">Dynamic Motion Typography & Icon Lockups</div>
                <p className="text-[11px] text-zinc-500 italic">Frame-accurate cues and responsive grid layout</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <span>Scale: Vector typography rendered at full 60fps</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Press Boilerplates & Copy Deck */}
      <section id="boilerplate" className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
            <Layers className="w-3.5 h-3.5" /> Approved Press Copy
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-foreground">
            Official Boilerplates & Bio
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Journalists, conference organizers, and partners may copy and use these verified descriptions directly without prior permission.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Short Bio */}
          <div className="rounded-2xl bg-card border border-border/70 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Short Description (1-2 sentences)</span>
                <span className="text-xs text-muted-foreground font-mono">{shortBoilerplate.length} chars</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-sans bg-secondary/15 p-4 rounded-xl border border-border/40 mb-4">
                {shortBoilerplate}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyText("short", shortBoilerplate)}
              className="rounded-xl border-primary/25 text-primary hover:bg-primary/10 w-fit"
            >
              {copiedKey === "short" ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-primary" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Short Bio
                </>
              )}
            </Button>
          </div>

          {/* Full Bio */}
          <div className="rounded-2xl bg-card border border-border/70 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">Full Press Boilerplate</span>
                <span className="text-xs text-muted-foreground font-mono">{longBoilerplate.length} chars</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-sans bg-secondary/15 p-4 rounded-xl border border-border/40 mb-4">
                {longBoilerplate}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyText("long", longBoilerplate)}
              className="rounded-xl border-primary/25 text-primary hover:bg-primary/10 w-fit"
            >
              {copiedKey === "long" ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-primary" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Full Boilerplate
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Key Programmes & Active Focus */}
      <section id="programmes" className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
            <Award className="w-3.5 h-3.5" /> Programme Overview
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-foreground">
            Active Programmes & Milestones
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Reference summaries for reporting on Greenwave Society&apos;s key pillars and upcoming milestones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Empower 360 Card */}
          <div className="rounded-2xl bg-card border-2 border-primary/30 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs font-bold">
                  Flagship Programme
                </Badge>
                <Badge className="bg-gold/20 text-gold-foreground border-gold/30 text-[11px] font-mono">
                  Active Milestone
                </Badge>
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground">
                Empower 360 (Inaugural Cohort I)
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Greenwave Society&apos;s flagship youth empowerment initiative equipping emerging changemakers with leadership facilitation, systems-change tools, and vocational mentorship. On Friday, 30th October 2026, we celebrate the graduation of our inaugural <strong>Ad Hoc Cohort I</strong> alongside an eco-conscious community market at Ubunifu Hub, Nairobi.
              </p>
            </div>
            <div className="pt-5 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 mt-4">
              <span className="text-xs text-muted-foreground font-mono">Friday, 30 Oct 2026 &bull; Ubunifu Hub</span>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-primary/25 text-primary hover:bg-primary/10">
                <Link href="/events/graduation-cohort-1">
                  View Graduation & Market <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* The 50 Percent Partner Initiative Card */}
          <div className="rounded-2xl bg-card border border-border/70 p-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-xs font-bold">
                  In Partnership with The 50 Percent
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Ages 18-35</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground">
                Young Person&apos;s Guide to Systems Thinking
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ad hoc training in partnership with The 50 Percent. We equip youth to diagnose systemic roots, addressing the youth employment crisis, enterprise design, and civic engagement through practical grassroots solutions.
              </p>
            </div>
            <div className="pt-5 border-t border-border/50 flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground font-mono">Nairobi Hub & Partner Cohorts</span>
              <Button asChild size="sm" variant="ghost" className="rounded-xl text-primary hover:bg-primary/10">
                <Link href="/programs">
                  Explore Programmes <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Visual Identity & Brand Tokens */}
      <section id="palette" className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
            <Palette className="w-3.5 h-3.5" /> Brand System
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-foreground">
            Official Color Palette & Brand Tokens
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Click any color swatch to copy its HEX code.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {brandColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => copyText(color.name, color.hex)}
              className="text-left rounded-2xl border border-border/60 bg-card p-4 transition-transform hover:-translate-y-1 shadow-sm group cursor-pointer"
            >
              <div
                className="h-20 w-full rounded-xl mb-3 shadow-inner border border-black/10 flex items-end justify-end p-2"
                style={{ backgroundColor: color.hex }}
              >
                {copiedKey === color.name && (
                  <span className="bg-black/60 text-white rounded-md text-[10px] px-2 py-0.5 font-mono font-bold">
                    Copied!
                  </span>
                )}
              </div>
              <h4 className="text-sm font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                {color.name}
              </h4>
              <div className="text-xs font-mono font-semibold text-primary">{color.hex}</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{color.role}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Typography & Logo Guidelines */}
      <section id="assets" className="rounded-3xl border border-border/70 bg-card p-6 sm:p-10 shadow-sm">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <Type className="w-3.5 h-3.5" /> Typography & Lockup
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
              Editorial Typography & Clean Form
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div>
                <p className="font-serif text-lg font-bold text-foreground">Playfair Display</p>
                <p className="text-xs">Primary display serif used for page headlines, hero banners, and key mission quotes.</p>
              </div>
              <div>
                <p className="font-sans text-lg font-bold text-foreground">Plus Jakarta Sans</p>
                <p className="text-xs">High-legibility geometric sans-serif used for body copy, UI buttons, forms, and data captions.</p>
              </div>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline" className="rounded-xl border-primary/25 text-primary hover:bg-primary/10">
                <Link href="/logo.png" target="_blank" download>
                  <Download className="w-4 h-4 mr-2" /> Download High-Res Logo
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-secondary/20 rounded-2xl p-8 border border-border/60 flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src="/logo.png"
                alt="Greenwave Society Official Logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xl font-serif font-black text-foreground">
              Green<span className="text-primary font-normal">wave</span> Society
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Social Enterprise &bull; Think Tank &bull; Nairobi, Kenya
            </p>
            <div className="mt-6 text-xs text-muted-foreground border-t border-border/60 pt-4 max-w-sm">
              Please maintain clear padding around the emblem and wordmark. Do not alter color ratios, distort proportions, or place over low-contrast photographic patterns.
            </div>
          </div>
        </div>
      </section>

      {/* 5. Press & Partnership Inquiries */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-4">
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs uppercase tracking-widest font-mono">
            Press & Media Relations
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Need High-Resolution Assets or Executive Interviews?
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Our communications and leadership teams are happy to provide custom film cuts, high-resolution photography, and commentary on youth empowerment and climate systems in Kenya.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-xl bg-white text-primary hover:bg-white/90 font-semibold px-6 shadow-md">
              <a href="mailto:info@greenwavesociety.org">
                <Mail className="w-4 h-4 mr-2" /> Contact Media Desk
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-white/30 text-white hover:bg-white/10 font-semibold px-6">
              <Link href="/contact">General Inquiries</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

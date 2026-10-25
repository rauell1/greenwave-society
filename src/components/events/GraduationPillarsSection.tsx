"use client";

import { useState } from "react";
import {
  Award,
  Store,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  Coffee,
  ShoppingBag,
  Palette,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function GraduationPillarsSection() {
  const [activeSegment, setActiveSegment] = useState<"both" | "graduands" | "vendors">("both");

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
          Event Structure & Tracks
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
          Two Celebrations in <span className="text-primary italic font-normal">One Space</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          The event brings together our graduating youth changemakers and our vibrant local sustainable enterprise community. Explore the details for both tracks below.
        </p>

        {/* Segment Filter Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-secondary/30 border border-border/80 mt-2">
          <button
            type="button"
            onClick={() => setActiveSegment("both")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSegment === "both"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview (Both Tracks)
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("graduands")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSegment === "graduands"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Graduands Track</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("vendors")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSegment === "vendors"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Vendors & Market Track</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Distinct Pillars */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        
        {/* Pillar 1: Graduands */}
        {(activeSegment === "both" || activeSegment === "graduands") && (
          <div className="rounded-3xl border-2 border-primary/30 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-gold/15 text-gold border border-gold/30 text-xs font-mono tracking-wider uppercase px-3 py-1">
                  <Award className="w-3.5 h-3.5 mr-1" /> Pillar I: Recognition
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">Arrival: 10:00 AM</span>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-black text-foreground mb-2">
                  Empower 360 Cohort I Graduands
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Honoring our cohort changemakers who formulated real-world systemic interventions across Nairobi and Kenya over intensive months of development.
                </p>
              </div>

              {/* What Graduands Receive */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                  Graduand Highlights & Schedule
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/50 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Official Certification & Induction:</strong> Presentation of certificates recognizing systems thinking and leadership execution.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/50 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Capstone Showcase:</strong> Highlights from local interventions in climate literacy, community mental health, and circular economy.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/50 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Reserved Seating & +1 Guests:</strong> Dedicated front seating for graduands, with family members and mentors welcomed.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/50 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Professional Photo Moments:</strong> Official cohort portraits and networking sessions with partners and mentors.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                Graduand tickets are complimentary.
              </div>
              <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                <Link href="#registration-forms">
                  RSVP as Graduand <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Pillar 2: Market Vendors */}
        {(activeSegment === "both" || activeSegment === "vendors") && (
          <div className="rounded-3xl border-2 border-emerald-600/30 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono tracking-wider uppercase px-3 py-1">
                  <Store className="w-3.5 h-3.5 mr-1" /> Pillar II: Community Market
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">Setup: 9:30 AM</span>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-black text-foreground mb-2">
                  Curated Eco-Conscious Vendors
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  A marketplace celebrating local sustainable snacks, authors, apparel, and craft artisans showcasing products directly to guests and families.
                </p>
              </div>

              {/* Vendor Logistics & Categories */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                  Featured Categories & Logistics
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Healthy Snacks & Drinks</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Books & Literature</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
                    <span>Eco Crafts & Accessories</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gold shrink-0" />
                    <span>Art & Lifestyle Goods</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Category Exclusivity:</strong> Only 1 to 2 approved brands per category to eliminate direct overlap.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Tables & Chairs:</strong> Provided on-site at Ubunifu Hub. Table setup runs from 9:30 AM to 10:15 AM.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Green Policy:</strong> Strictly zero single-use plastics. Reusable packaging encouraged.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                KES 1,000 stall confirmation fee.
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold">
                <Link href="#registration-forms">
                  Apply for a Stall <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

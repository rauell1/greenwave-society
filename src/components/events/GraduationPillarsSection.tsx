"use client";

import {
  Award,
  Store,
  Sparkles,
  BookOpen,
  Users,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function GraduationPillarsSection() {
  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
          Ceremony Pillars & Experience
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
          Celebrating Our Inaugural <span className="text-primary italic font-normal">Cohort I Changemakers</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          The Empower 360 Ad Hoc Cohort I ceremony honors youth leaders who dedicated months to developing systemic grassroots interventions across Nairobi and Kenya.
        </p>
      </div>

      {/* Grid: 4 Core Ceremony Pillars */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-foreground">Official Certification</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Presentation of official certificates recognizing completion of intensive systems thinking, leadership, and grassroots project delivery.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-foreground">Capstone Showcase</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Graduands pitch their real-world interventions tackling youth employment, climate literacy, community mental health, and circular economy.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-foreground">Reserved Seating & +1s</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Priority front-row seating for graduating changemakers, with families, mentors, collaborators, and friends warmly welcomed to celebrate.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-foreground">Portraits & Network</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Professional cohort portraits, induction into the Greenwave Society alumni network, and direct engagement with potential funders and partners.
          </p>
        </div>
      </div>

      {/* Concurrent Community Market Spotlight Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600/15 via-secondary/30 to-primary/15 border-2 border-emerald-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-600/30 text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5">
              <Store className="w-3 h-3 mr-1" /> Concurrent Event
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">Setup from 9:30 AM &bull; Ubunifu Hub</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-black text-foreground">
            Eco-Conscious Community Market Running Alongside
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            A curated marketplace of local sustainable enterprises, healthy snack artisans, authors, and ethical creators is setting up at Ubunifu Hub to support graduands and guests throughout the day.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
          <Button asChild size="default" variant="outline" className="rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold">
            <Link href="/events/community-market">
              <Store className="w-4 h-4 mr-1.5" />
              Explore Market & Vendor Stalls
            </Link>
          </Button>

          <Button asChild size="default" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
            <Link href="#rsvp-form">
              <Award className="w-4 h-4 mr-1.5 text-gold" />
              RSVP for Ceremony
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

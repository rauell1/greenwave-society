import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { VendorForm } from "../graduation-cohort-1/VendorForm";
import { FlyerMediaSection } from "../graduation-cohort-1/FlyerMediaSection";
import { ShareableLinkBar } from "@/components/events/ShareableLinkBar";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import {
  Store,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Coffee,
  BookOpen,
  ShoppingBag,
  Palette,
  ArrowRight,
  GraduationCap,
  Leaf,
  QrCode,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app.config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Green Community Market: Call for Eco-Conscious Vendors | Greenwave Society",
  description: "Showcase your sustainable products, healthy snacks, books, and lifestyle creations on Friday, 30th October 2026 at Ubunifu Hub, Nairobi. Tables and chairs provided.",
  alternates: {
    canonical: `${APP_CONFIG.url}/events/community-market`,
  },
  openGraph: {
    title: "Green Community Market: Call for Eco-Conscious Vendors | Greenwave Society",
    description: "Calling sustainable brands and artisans! Join the community marketplace running alongside the Empower 360 Cohort I Graduation on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.",
    url: `${APP_CONFIG.url}/events/community-market`,
    siteName: "Greenwave Society",
    images: [
      {
        url: "/posters/empower360-market-vendor-flyer.png",
        width: 723,
        height: 1024,
        alt: "Community Market Call for Vendors Official Poster",
      },
    ],
    type: "website",
  },
};

const MARKET_CALENDAR_DATA = {
  title: "Greenwave Society Community Market - Vendor Stall",
  description: "Curated eco-conscious community market supporting the Empower 360 Cohort I Graduation. Vendor setup starts at 9:30 AM. Event runs until 3:00 PM at Ubunifu Hub, Nairobi.",
  location: "Ubunifu Hub, Nairobi, Kenya",
  startsAt: "2026-10-30T06:30:00Z", // 9:30 AM EAT for vendors
  endsAt: "2026-10-30T12:00:00Z",   // 3:00 PM EAT
  url: "https://greenwavesociety.org/events/community-market",
};

export default function CommunityMarketPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SaleEvent",
    "name": "Greenwave Society Empower 360 Community Market",
    "startDate": "2026-10-30T09:30:00+03:00",
    "endDate": "2026-10-30T15:00:00+03:00",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "Ubunifu Hub",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE",
      },
    },
    "image": [`${APP_CONFIG.url}/posters/empower360-market-vendor-flyer.png`],
    "description": "Eco-conscious community market call for vendors, snacks, crafts, and books supporting Empower 360 changemakers.",
    "organizer": {
      "@type": "Organization",
      "name": "Greenwave Society",
      "url": APP_CONFIG.url,
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-secondary/15 relative overflow-hidden border-b border-border/50">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-600/30 rounded-full">
                <Store className="w-3.5 h-3.5 mr-1.5" />
                Community Market &bull; Vendor Portal
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground border-border rounded-full font-medium">
                Supporting Empower 360 Cohort I
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-[1.1] mb-6">
              Curated Community Market: <span className="italic font-normal text-emerald-600 dark:text-emerald-400">Call for Vendors</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              Are you a local sustainable enterprise, snack artisan, author, or creative? Join us at Ubunifu Hub to showcase and vend directly to the youth changemakers, families, mentors, and community guests arriving to celebrate our inaugural Empower 360 graduation.
            </p>

            {/* Vendor Logistics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-background/80 border border-border/70 backdrop-blur-sm shadow-sm mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Date</div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground">Fri 30 Oct 2026</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Setup & Hours</div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground">9:30 AM to 3:00 PM</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Venue</div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground">Ubunifu Hub, NBO</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Stall Fee</div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground">KES 1,000 Flat</div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Dual Links */}
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="default" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm">
                <Link href="#vendor-form">
                  <Store className="w-4 h-4 mr-1.5" />
                  Apply for a Stall
                </Link>
              </Button>

              <AddToCalendarButton event={MARKET_CALENDAR_DATA} size="default" />

              <Button asChild size="default" variant="outline" className="rounded-xl border-border/80 text-xs font-medium">
                <Link href="/events/graduation-cohort-1">
                  <GraduationCap className="w-4 h-4 mr-1.5 text-primary" />
                  View Graduation Ceremony
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Shareable Link Bar */}
      <section className="py-4 max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <ShareableLinkBar
          label="Community Market Vendor Portal"
          url="https://greenwavesociety.org/events/community-market"
          shareMessage="Calling sustainable brands, snack creators, authors & artisans! Showcase your venture at the Greenwave Society Empower 360 Community Market on Friday, 30 Oct 2026 at Ubunifu Hub, Nairobi. KES 1,000 flat fee, tables & chairs provided, zero single-use plastics rule. Apply online here:"
          badge="Shareable Vendor Link"
        />
      </section>

      {/* Official Call for Vendors Posters & Social Kit */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50">
        <FlyerMediaSection categoryFilter="vendor" />
      </section>

      {/* Why Vend With Us / Market Highlights */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50 bg-secondary/10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
            Vendor Benefits & Space Standards
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
            Supporting Our Changemakers With <span className="text-emerald-600 dark:text-emerald-400 italic font-normal">Local Sustainable Enterprise</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Our market vendors are an essential part of the celebration. By setting up stalls, vendors nourish our attendees, spark new collaborations, and showcase practical sustainable alternatives.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Direct Community Footfall</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stalls are situated right along the main entrance and reception corridor of Ubunifu Hub, where graduands, families, and partners congregate before and after ceremony sessions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Category Exclusivity</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We strictly cap stalls to 1 to 2 vetted brands per product niche (such as baked treats, coffee, literature, or apparel) to protect your margins and prevent direct internal competition.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Turnkey Table Setup</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Display tables and seating chairs are provided and set up on-site by Ubunifu Hub. Simply arrive with your products, branded banner, and packaging ready for setup from 9:30 AM.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Zero Single-Use Plastics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In harmony with Greenwave Society’s environmental mission, single-use plastic carrier bags and disposable cups are prohibited. Reusable, paper, and biodegradable wraps are warmly supported.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area: 2 Columns */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full flex-1">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Categories, Schedule, FAQ, and Cross-Link */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Store className="w-3.5 h-3.5" /> Market Categories
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
                Who We Are Welcoming to the <span className="text-emerald-600 dark:text-emerald-400 italic font-normal">Market</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                We are curating a thoughtful blend of Kenyan social enterprises, emerging youth businesses, authors, and conscious lifestyle brands.
              </p>
            </div>

            {/* Featured Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 flex items-start gap-3">
                <Coffee className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Healthy Snacks & Drinks</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Fresh baked goods, artisanal juices, plant-based treats, herbal teas, or specialty coffee.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Books & Literature</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Kenyan authors, environmental publications, zines, self-development, and youth poetry.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Eco Crafts & Fashion</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Upcycled accessories, tote bags, thrifted circular apparel, and handmade stationery.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 flex items-start gap-3">
                <Palette className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Art & Wellness Goods</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Handcrafted soaps, organic skin care, natural candles, and illustrative prints.</div>
                </div>
              </div>
            </div>

            {/* Vendor Timeline */}
            <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                Friday, 30 October 2026 Vendor Timeline
              </div>
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>9:30 AM to 10:15 AM:</strong> Vendor arrival, table allocation, and merchandise display setup.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>10:30 AM:</strong> Market opens to early arrivals, guests, and graduands entering Ubunifu Hub.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>12:45 PM to 2:15 PM:</strong> Peak footfall during post-ceremony networking and refreshments break.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3:00 PM:</strong> Market close and pack-down.</span>
                </div>
              </div>
            </div>

            {/* Cross-Link Card: Attending as Guest or Graduand */}
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider font-bold text-primary">Attending the Ceremony?</div>
                  <div className="text-xs text-muted-foreground mt-0.5">RSVP as an Empower 360 graduand, family member, mentor, or general guest.</div>
                </div>
              </div>
              <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shrink-0">
                <Link href="/events/graduation-cohort-1">
                  Ceremony RSVP <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Fast QR Check-in Info for Organizers */}
            <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">Event Day Door Check-in</div>
                  <div className="text-xs text-muted-foreground">Approved vendors receive quick QR check-in on-site at Ubunifu Hub.</div>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-border/80 text-xs">
                <Link href="/events/check-in">
                  Door Station <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

          </div>

          {/* Right Column: Dedicated Vendor Application Form */}
          <div className="lg:col-span-6 space-y-6" id="vendor-form">
            <div id="apply" className="scroll-mt-28" />
            <VendorForm />
          </div>

        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

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
  ShieldCheck,
  Coffee,
  BookOpen,
  ShoppingBag,
  Palette,
  ArrowRight,
  GraduationCap,
  Leaf,
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

      {/* Split Hero: Direct Vendor Application Form Above The Fold */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 bg-gradient-to-b from-emerald-500/10 via-background to-background relative overflow-hidden border-b border-border/50">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Crisp Market Overview & Logistics */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-600/30 rounded-full">
                    <Store className="w-3.5 h-3.5 mr-1.5" />
                    Community Market &bull; Vendor Portal
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground border-border rounded-full font-medium">
                    Supporting Empower 360 Cohort I
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-[1.15]">
                  Curated Community Market: <span className="italic font-normal text-emerald-600 dark:text-emerald-400">Call for Vendors</span>
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Showcase and vend your sustainable products, healthy snacks, books, and lifestyle goods directly to youth changemakers, families, mentors, and guests at Ubunifu Hub.
                </p>
              </div>

              {/* Vendor Logistics Strip */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/70 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Date</span>
                    <strong className="text-foreground">Friday, 30 Oct 2026</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Schedule</span>
                    <strong className="text-foreground">Setup 9:30 AM &bull; 10:30-3:00</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Venue</span>
                    <strong className="text-foreground">Ubunifu Hub, Nairobi</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Stall Fee</span>
                    <strong className="text-foreground">KES 1,000 &bull; Tables Provided</strong>
                  </div>
                </div>
              </div>

              {/* Actions & Graduation Ceremony Link */}
              <div className="flex flex-wrap items-center gap-3">
                <AddToCalendarButton event={MARKET_CALENDAR_DATA} size="sm" />

                <Button asChild size="sm" variant="outline" className="rounded-xl border-border/80 text-xs font-medium">
                  <Link href="/events/graduation-cohort-1">
                    <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    Graduation Ceremony RSVP
                  </Link>
                </Button>

                {/* Mobile Quick Jump */}
                <Button asChild size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold sm:hidden">
                  <Link href="#vendor-form">
                    Application Form Below <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              {/* Shareable Link Bar */}
              <ShareableLinkBar
                label="Community Market Portal"
                url="https://greenwavesociety.org/events/community-market"
                shareMessage="Calling sustainable brands, snack creators, authors & artisans! Showcase your venture at the Empower 360 Community Market on Friday, 30 Oct 2026 at Ubunifu Hub, Nairobi. KES 1,000 flat fee, tables & chairs provided, zero single-use plastics rule. Apply online here:"
                badge="Vendor Share Link"
              />
            </div>

            {/* Right Column: Direct Vendor Application Form Right Here */}
            <div className="lg:col-span-6 w-full" id="vendor-form">
              <div id="apply" className="scroll-mt-28" />
              <VendorForm />
            </div>

          </div>
        </div>
      </section>

      {/* Why Vend With Us / Space Standards */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-emerald-500/30 px-3 py-0.5 rounded-full font-bold">
            Vendor Benefits & Standards
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
            Supporting Our Changemakers
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Direct Footfall</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Positioned in the main reception and networking corridor where 100+ graduates, families, and guests convene throughout the day.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Category Exclusivity</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We cap stalls to 1 to 2 vetted brands per product niche (snacks, drinks, books, or crafts) to prevent direct competition.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Turnkey Table Setup</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tables and chairs are provided and set up on-site by Ubunifu Hub. Simply arrive with your products and signage ready for 9:30 AM setup.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Zero Single-Use Plastics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Consistent with our environmental mission, single-use plastic carrier bags and cups are prohibited. Reusable or paper packaging only.
            </p>
          </div>
        </div>

        {/* Vendor Categories & Ceremony Link Strip */}
        <div className="mt-8 grid md:grid-cols-12 gap-5 items-stretch">
          <div className="md:col-span-7 p-5 rounded-2xl bg-secondary/20 border border-border/60 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
              Welcomed Product Categories
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Coffee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Healthy Snacks & Drinks:</strong> Baked goods, coffee, juices.</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span><strong>Books & Literature:</strong> Kenyan authors & publications.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-primary shrink-0" />
                <span><strong>Eco Crafts & Fashion:</strong> Upcycled accessories & fashion.</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-gold shrink-0" />
                <span><strong>Art & Lifestyle:</strong> Natural soaps, crafts & wellness.</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 p-5 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider font-mono">
                <GraduationCap className="w-3.5 h-3.5" /> Empower 360 Ceremony
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Attending as a family member, graduand, mentor, or supporter? RSVP for the ceremony with free admission and digital pass.
              </p>
            </div>
            <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold self-start">
              <Link href="/events/graduation-cohort-1">
                Ceremony RSVP <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Official Call for Vendors Posters & Social Kit */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <FlyerMediaSection categoryFilter="vendor" />
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

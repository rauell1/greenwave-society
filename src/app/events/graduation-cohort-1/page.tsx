import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { AttendeeRsvpForm } from "./AttendeeRsvpForm";
import { FlyerMediaSection } from "./FlyerMediaSection";
import { GraduationVendorRedirectHelper } from "./GraduationVendorRedirectHelper";
import { ShareableLinkBar } from "@/components/events/ShareableLinkBar";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Award,
  Store,
  Users,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app.config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Empower 360: Ad Hoc Cohort I Graduation Ceremony | Greenwave Society",
  description: "Join us on Friday, 30th October 2026 at Ubunifu Hub, Nairobi to celebrate the Empower 360 Ad Hoc Cohort I graduands. Free entry, networking, and capstone showcase.",
  alternates: {
    canonical: `${APP_CONFIG.url}/events/graduation-cohort-1`,
  },
  openGraph: {
    title: "Empower 360: Ad Hoc Cohort I Graduation Ceremony | Greenwave Society",
    description: "Celebrating our 2026 Graduands under the Empower 360 programme. Friday, 30th October 2026 at Ubunifu Hub, Nairobi. Ceremony, networking, refreshments, and capstone showcase.",
    url: `${APP_CONFIG.url}/events/graduation-cohort-1`,
    siteName: "Greenwave Society",
    images: [{ url: "/posters/empower360-cohort-1-graduation-flyer.png", width: 723, height: 1024, alt: "Empower 360 Cohort I Graduation Official Flyer" }],
    type: "website",
  },
};

const EVENT_CALENDAR_DATA = {
  title: "Empower 360 Ad Hoc Cohort I Graduation Ceremony",
  description: "Join Greenwave Society in celebrating the Empower 360 Ad Hoc Cohort I changemakers. Ceremony, networking, refreshments, and capstone showcase.",
  location: "Ubunifu Hub, Nairobi, Kenya",
  startsAt: "2026-10-30T07:30:00Z", // 10:30 AM EAT
  endsAt: "2026-10-30T12:00:00Z",   // 3:00 PM EAT
  url: "https://greenwavesociety.org/events/graduation-cohort-1",
};

export default function GraduationCohortPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Greenwave Society Empower 360 Ad Hoc Cohort I Graduation Ceremony",
    "startDate": "2026-10-30T10:30:00+03:00",
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
    "image": [`${APP_CONFIG.url}/posters/empower360-cohort-1-graduation-flyer.png`],
    "description": "Graduation celebration for Greenwave Society Empower 360 Ad Hoc Cohort I changemakers.",
    "organizer": {
      "@type": "Organization",
      "name": "Greenwave Society",
      "url": APP_CONFIG.url,
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <GraduationVendorRedirectHelper />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Split Hero: Direct RSVP Form Right Above The Fold */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 bg-gradient-to-b from-secondary/20 via-background to-background relative overflow-hidden border-b border-border/50">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Crisp Event Overview & Key Facts */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
                    Empower 360 &bull; Graduation Ceremony
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground border-border rounded-full font-medium">
                    Celebrating Cohort I
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-[1.15]">
                  Empower 360 Cohort I <span className="italic font-normal text-primary">Graduation</span>
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Join Greenwave Society as we celebrate our inaugural cohort of youth changemakers. Official certification, capstone showcases, light refreshments, and community connection.
                </p>
              </div>

              {/* Key Logistics Strip */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/70 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Date</span>
                    <strong className="text-foreground">Friday, 30 Oct 2026</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Time</span>
                    <strong className="text-foreground">10:30 AM to 3:00 PM</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Venue</span>
                    <strong className="text-foreground">Ubunifu Hub, Nairobi</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Admission</span>
                    <strong className="text-foreground">Free Entry &bull; +1s Welcome</strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Sister Page Link */}
              <div className="flex flex-wrap items-center gap-3">
                <AddToCalendarButton event={EVENT_CALENDAR_DATA} size="sm" />
                
                <Button asChild size="sm" variant="outline" className="rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold">
                  <Link href="/events/community-market">
                    <Store className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    Community Market Vendor Portal
                  </Link>
                </Button>

                {/* Mobile Quick Jump */}
                <Button asChild size="sm" className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold sm:hidden">
                  <Link href="#rsvp-form">
                    RSVP Form Below <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              {/* Shareable Link Bar */}
              <ShareableLinkBar
                label="Graduation RSVP"
                url="https://greenwavesociety.org/events/graduation-cohort-1"
                shareMessage="Join us for Greenwave Society's Empower 360 Cohort I Graduation on Friday, 30th October 2026 (10:30 AM - 3:00 PM) at Ubunifu Hub, Nairobi! +1s welcome. Free Entry & digital ticket pass. RSVP here:"
                badge="Direct Share Link"
              />
            </div>

            {/* Right Column: Direct RSVP Form Right Here */}
            <div className="lg:col-span-6 w-full" id="rsvp-form">
              <div id="rsvp" className="scroll-mt-28" />
              <AttendeeRsvpForm />
            </div>

          </div>
        </div>
      </section>

      {/* Ceremony Pillars (4 Key Highlights) */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-primary border-primary/20 px-3 py-0.5 rounded-full font-bold">
            Ceremony Highlights
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
            What to Expect on Celebration Day
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Official Certification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Presentation of formal completion certificates recognizing systems thinking and youth leadership execution.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Capstone Showcase</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Graduands pitch community interventions addressing climate literacy, youth employment, and mental health barazas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Reserved Seating & +1s</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Priority front seating for graduands, with family members, mentors, and collaborators warmly accommodated.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-foreground">Portraits & Network</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Professional cohort photo sessions, networking over Kenyan refreshments, and induction into the Greenwave network.
            </p>
          </div>
        </div>

        {/* Schedule & Concurrent Market Strip */}
        <div className="mt-8 grid md:grid-cols-12 gap-5 items-stretch">
          <div className="md:col-span-7 p-5 rounded-2xl bg-secondary/20 border border-border/60 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
              Ceremony Schedule (Friday, 30 Oct 2026)
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>10:00 AM:</strong> Graduand arrival & badges</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>10:30 AM:</strong> Welcome & keynote</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>11:15 AM:</strong> Certificate presentation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>12:00 PM:</strong> Capstone project pitches</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>1:00 PM:</strong> Refreshments & market visit</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>3:00 PM:</strong> Portraits & event close</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Store className="w-3.5 h-3.5" /> Concurrent Market
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Local sustainable snacks, artisanal coffee, authors, and eco crafts are setting up at Ubunifu Hub to support all attendees.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold self-start">
              <Link href="/events/community-market">
                View Market Stalls <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Official Graduation Invitation Posters & Social Kit */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <FlyerMediaSection categoryFilter="attendee" />
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

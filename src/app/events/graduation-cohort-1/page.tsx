import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { AttendeeRsvpForm } from "./AttendeeRsvpForm";
import { FlyerMediaSection } from "./FlyerMediaSection";
import { GraduationPillarsSection } from "@/components/events/GraduationPillarsSection";
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
  QrCode,
  CheckCircle2,
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

      {/* Hero Header */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-secondary/15 relative overflow-hidden border-b border-border/50">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Empower 360 &bull; Graduation Ceremony
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground border-border rounded-full font-medium">
                Celebrating Our 2026 Graduands
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-[1.1] mb-6">
              Empower 360: Ad Hoc Cohort I <span className="italic font-normal text-primary">Graduation</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              Celebrating the emerging leaders and changemakers of our inaugural Empower 360 Ad Hoc Cohort I. Join us for a brief graduation ceremony, networking, light refreshments, capstone presentations, and vibrant community connection.
            </p>

            {/* Event Key Details Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-background/80 border border-border/70 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Date</div>
                  <div className="text-sm font-semibold text-foreground">Friday, 30 Oct 2026</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Time</div>
                  <div className="text-sm font-semibold text-foreground">10:30 AM to 3:00 PM</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Venue</div>
                  <div className="text-sm font-semibold text-foreground">Ubunifu Hub, Nairobi</div>
                </div>
              </div>
            </div>

            {/* Bring a Friend Banner & Dual Actions */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-600/15 via-primary/15 to-gold/15 border border-primary/20 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  +1
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider font-bold text-primary">Bring a Friend!</div>
                  <div className="text-sm font-medium text-foreground">Graduates & Guests Welcome - +1s and collaborators invited!</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AddToCalendarButton event={EVENT_CALENDAR_DATA} size="sm" />
                <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                  <Link href="#rsvp-form">
                    RSVP as Attendee <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold">
                  <Link href="/events/community-market">
                    <Store className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    Market Vendor Portal
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shareable Link Bar */}
      <section className="py-4 max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <ShareableLinkBar
          label="Empower 360 Cohort I Graduation RSVP"
          url="https://greenwavesociety.org/events/graduation-cohort-1"
          shareMessage="🎓 Join us for Greenwave Society's Empower 360 Ad Hoc Cohort I Graduation on Friday, 30th October 2026 (10:30 AM - 3:00 PM) at Ubunifu Hub, Nairobi! +1s welcome. Free Entry & digital ticket pass. Details & RSVP:"
          badge="Shareable RSVP Link"
        />
      </section>

      {/* Official Graduation Invitation Posters & Social Kit */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50">
        <FlyerMediaSection categoryFilter="attendee" />
      </section>

      {/* Ceremony Highlights & Pillars */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50 bg-secondary/10">
        <GraduationPillarsSection />
      </section>

      {/* Main Content Area: 2 Columns */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full flex-1">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Event Context & Experience */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Award className="w-3.5 h-3.5" /> Empower 360 Programme
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
                Inaugural Cohort I: Youth Leaders in <span className="text-primary italic font-normal">Action</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Greenwave Society’s <strong>Empower 360</strong> programme bridges youth development with systemic community impact. Over intense hands-on months, our <strong>Ad Hoc Cohort I</strong> innovators diagnosed local community challenges, formulated real-world interventions, and applied systems thinking to climate, social, and economic issues.
              </p>
            </div>

            {/* Event Agenda & Highlights */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-foreground mb-1">Brief Recognition Ceremony</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Honoring each graduating member with certification, showcasing capstone initiatives, and celebrating peer achievements with mentors and families.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-foreground mb-1">Networking & Light Refreshments</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Connect with fellow social innovators, partners, mentors, and friends over curated Kenyan refreshments in an open, welcoming setting.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-foreground mb-1">Curated Community Market</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    A vibrant space for local creators, sustainable snack artisans, authors, and craftsmen setting up alongside the ceremony to support attendees.
                  </p>
                </div>
              </div>
            </div>

            {/* Event Day Schedule */}
            <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                Event Day Schedule (Friday, 30 Oct 2026)
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>10:00 AM:</strong> Graduand arrival, badge collection & front seating setup.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>10:30 AM:</strong> Welcome remarks, ceremony opening & keynote.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>11:15 AM:</strong> Presentation of graduation certificates & honors.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>12:00 PM:</strong> Capstone projects showcase & community pitches.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1:00 PM:</strong> Light refreshments, networking & market exploration.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3:00 PM:</strong> Event close & cohort portraits.</span>
                </div>
              </div>
            </div>

            {/* Check-in Info Badge for Organizers */}
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary font-mono uppercase tracking-wider">Fast QR Check-in</div>
                  <div className="text-xs text-muted-foreground">Door check-in station active for event day organizers & ushers.</div>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs">
                <Link href="/events/check-in">
                  Door Station <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Vendor Partner Spotlight */}
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <h4 className="font-serif font-bold text-base text-emerald-800 dark:text-emerald-300">Are You an Eco-Conscious Vendor?</h4>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                If you are a vendor interested in booking a display stall for snacks, crafts, books, or eco merchandise, our dedicated vendor portal has full details, setup guidelines, and the application form.
              </p>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold">
                <Link href="/events/community-market">
                  Go to Community Market Vendor Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Direct Attendee & Graduand RSVP Form */}
          <div className="lg:col-span-6 space-y-6" id="rsvp-form">
            <div id="rsvp" className="scroll-mt-28" />
            <AttendeeRsvpForm />
          </div>

        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

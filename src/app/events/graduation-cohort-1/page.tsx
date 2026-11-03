import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { AttendeeRsvpForm } from "./AttendeeRsvpForm";
import { GraduationMomentsGallery } from "./GraduationMomentsGallery";
import { GraduationVendorRedirectHelper } from "./GraduationVendorRedirectHelper";
import { ShareableLinkBar } from "@/components/events/ShareableLinkBar";
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
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileText,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "YPG: Young Person's Guide to Systems Change Graduation Ceremony | Greenwave Society",
  description: "Official convocation and milestone retrospective celebrating the 12 certified graduands of YPG: Young Person's Guide to Systems Change Cohort I (from an initial cohort of 28 members) on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.",
  alternates: {
    canonical: `${APP_CONFIG.url}/events/graduation-cohort-1`,
  },
  openGraph: {
    title: "YPG: Young Person's Guide to Systems Change Graduation Ceremony | Greenwave Society",
    description: "Honoring 12 certified youth leaders (from 28 cohort members) in systems thinking, grassroots climate action, and community leadership on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.",
    url: `${APP_CONFIG.url}/events/graduation-cohort-1`,
    siteName: "Greenwave Society",
    images: [
      {
        url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp",
        width: 1600,
        height: 1067,
        alt: "The 12 Certified Graduands of YPG: Young Person's Guide to Systems Change Cohort I Assembled at Ubunifu Hub",
      },
    ],
    type: "website",
  },
};

export default function GraduationCohortPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Greenwave Society YPG: Young Person's Guide to Systems Change Cohort I Graduation Ceremony",
    "startDate": "2026-10-30T10:30:00+03:00",
    "endDate": "2026-10-30T15:00:00+03:00",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventCompleted",
    "location": {
      "@type": "Place",
      "name": "Ubunifu Hub",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE",
      },
    },
    "image": ["https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp"],
    "description": "Official graduation ceremony celebrating the 12 certified youth graduands of YPG: Young Person's Guide to Systems Change Cohort I (from 28 cohort members).",
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

      {/* Breadcrumb Navigation */}
      <div className="pt-24 sm:pt-28 pb-4 border-b border-border/40 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <Link href="/programs" className="hover:text-primary transition-colors">Programs</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">YPG: Young Person&apos;s Guide to Systems Change Graduation</span>
          </nav>
        </div>
      </div>

      {/* EXECUTIVE COMMEMORATIVE HERO */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-secondary/20 via-background to-background relative overflow-hidden border-b border-border/50">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          
          {/* Header Title Block */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Official Convocation &bull; Friday, 30 Oct 2026
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 rounded-full font-medium">
                12 Graduands Certified (28 Started)
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-[1.12]">
              YPG: Young Person&apos;s Guide to Systems Change <br />
              <span className="italic font-normal text-primary">Inaugural Cohort Graduation Ceremony</span>
            </h1>

            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              On Friday, 30th October 2026, Greenwave Society officially conferred leadership honors upon 12 inaugural youth graduands at Ubunifu Hub, Nairobi. Selected from an initial cohort of 28 enrolled members, these leaders completed months of intensive systems thinking, grassroots climate action, and community mentorship through the Young Person&apos;s Guide to Systems Change (YPG) program in partnership with The 50 Percent, and now advance into the active Greenwave alumni network.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-sm shadow-md gap-2">
                <Link href="/events/graduation-cohort-1/album">
                  <Camera className="w-4 h-4" />
                  <span>Open Interactive Photo Album (296 Photos)</span>
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-sm font-semibold gap-2">
                <a href="/downloads/YPG_Cohort_I_Graduation_Comprehensive_Event_Report.docx" download>
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Download Full Word Report (.docx)</span>
                </a>
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-xl border-border text-sm font-semibold gap-2">
                <Link href="#milestones">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Highlights &amp; Milestones</span>
                </Link>
              </Button>

              <Button asChild size="lg" variant="ghost" className="rounded-xl text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                <Link href="#pass-lookup">
                  Retrieve Attendee Pass &bull; Verify Record
                </Link>
              </Button>
            </div>
          </div>

          {/* Featured Commemorative Photograph */}
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-slate-950 group">
              <Image
                src="https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp"
                alt="The 12 Certified Graduands of YPG: Young Person's Guide to Systems Change Cohort I Assembled at Ubunifu Hub, Nairobi"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gold text-slate-950 border-none font-bold text-[10px] tracking-wider uppercase">
                      Cohort I Assembly
                    </Badge>
                    <span className="text-xs text-white/80 font-mono">Friday, 30 Oct 2026 &bull; Ubunifu Hub</span>
                  </div>
                  <h3 className="font-serif font-black text-lg sm:text-2xl text-white tracking-tight">
                    The 12 Certified Leaders of YPG: Young Person&apos;s Guide to Systems Change Cohort I
                  </h3>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 text-xs font-semibold shrink-0 gap-1.5"
                >
                  <Link href="/events/graduation-cohort-1/album">
                    <span>View in Full Album</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Key Executive Logistics Strip */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-sm text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono block">Date Held</span>
                <strong className="text-sm font-serif font-bold text-foreground">Friday, 30 Oct 2026</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono block">Time</span>
                <strong className="text-sm font-serif font-bold text-foreground">10:30 AM to 3:00 PM</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono block">Venue</span>
                <strong className="text-sm font-serif font-bold text-foreground">Ubunifu Hub, Nairobi</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono block">Status</span>
                <strong className="text-sm font-serif font-bold text-foreground">Concluded &bull; Certified</strong>
              </div>
            </div>
          </div>

          {/* Shareable Link Bar */}
          <div className="max-w-5xl mx-auto">
            <ShareableLinkBar
              label="Official Graduation Retrospective"
              url="https://greenwavesociety.org/events/graduation-cohort-1"
              shareMessage="Celebrating Greenwave Society's YPG: Young Person's Guide to Systems Change Cohort I Graduation: 12 youth changemakers certified on 30 Oct 2026 at Ubunifu Hub, Nairobi (from 28 cohort members). View the official ceremony showcase and photo album:"
              badge="Concluded Celebration"
            />
          </div>

        </div>
      </section>

      {/* SECTION 1: THE COHORT JOURNEY & ACADEMIC RIGOR */}
      <section id="milestones" className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-primary border-primary/20 px-3.5 py-1 rounded-full font-bold">
            Curriculum &amp; Leadership Rigor
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-foreground tracking-tight">
            Translating Systems Thinking into Community Action
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Delivered in partnership with <strong>The 50 Percent</strong>, the Young Person&apos;s Guide to Systems Change (YPG) program challenged youth leaders to move beyond symptoms to solve root causes of local ecological, economic, and social challenges.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs hover:border-primary/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Official Certification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formal stage conferment honoring 12 graduands who completed comprehensive training and capstones from an initial cohort of 28 youth leaders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs hover:border-primary/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Capstone Showcases</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Graduand teams pitched actionable community interventions addressing climate literacy, vocational employment, and youth mental health support.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs hover:border-primary/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Democratic Governance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every member learned peer facilitation, rotated chairing weekly meetings, managed practical project budgets, and led debate.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs hover:border-primary/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-foreground">Lifelong Alumni Network</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Induction into Greenwave Society&apos;s active changemaker directory, unlocking ongoing mentorship, project funding, and civic partnerships.
            </p>
          </div>
        </div>

        {/* Executive Milestone Metrics */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-secondary/30 border border-border/70 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-black text-primary">12</span>
            <span className="text-xs font-semibold text-muted-foreground block uppercase font-mono">Graduands Certified</span>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-black text-gold">28</span>
            <span className="text-xs font-semibold text-muted-foreground block uppercase font-mono">Enrolled Members Started</span>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-black text-emerald-600 dark:text-emerald-400">6 Months</span>
            <span className="text-xs font-semibold text-muted-foreground block uppercase font-mono">Rigorous Training</span>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-black text-foreground">296</span>
            <span className="text-xs font-semibold text-muted-foreground block uppercase font-mono">Archive Photographs</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: OFFICIAL CEREMONY MOMENTS GALLERY */}
      <section id="photos" className="scroll-mt-16 border-b border-border/50">
        <GraduationMomentsGallery />
      </section>

      {/* SECTION 3: FORMAL ORDER OF PROCEEDINGS */}
      <section id="schedule" className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-primary border-primary/20 px-3.5 py-1 rounded-full font-bold">
            Proceedings of the Day
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground tracking-tight">
            Ceremony Schedule &bull; Friday, 30 October 2026
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Record of official proceedings conducted at Ubunifu Hub, Nairobi.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>10:00 AM</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-foreground">Graduand Arrival &amp; Badging</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Registration, badge issuance, and seating arrangement at the auditorium.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>10:30 AM</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-foreground">Convocation Address</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Opening reflection on youth systems thinking and community leadership in Kenya.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>11:15 AM</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-foreground">Certificate Conferment</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official stage presentation of completion certificates to all 12 graduands.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>12:00 PM</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-foreground">Capstone Pitches</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Changemaker groups presented community initiatives to invited mentors and guests.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1:00 PM</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-foreground">Fellowship &amp; Refreshments</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Networking luncheon and visits to the concurrent zero-plastic community market.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>3:00 PM</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-foreground">Portraits &amp; Event Close</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formal cohort photography session, mentor congratulations, and induction close.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: SEPARATE SISTER INITIATIVES & DOCUMENTATION */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-6 sm:px-8 w-full border-b border-border/50">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-muted-foreground border-border px-3 py-0.5 rounded-full font-bold">
            Official Records &amp; Sister Hubs
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
            Explore Reports, Media &amp; Marketplace
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Card 1: Comprehensive Event Report (Word Docx) */}
          <div className="p-6 rounded-2xl bg-card border-2 border-primary/30 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-mono uppercase font-semibold">
                  Official Record
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Word • 1.16 MB</span>
              </div>
              <h3 className="font-serif font-black text-lg text-foreground">
                Comprehensive Event Report
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Exhaustive 10-section executive post-session report covering cohort metrics, the 4 curricular pillars, all 3 capstone defenses, master chronology, vendor audit, and permanent graduand roll.
              </p>
            </div>

            <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold self-start gap-1.5 shadow-sm">
              <a href="/downloads/YPG_Cohort_I_Graduation_Comprehensive_Event_Report.docx" download>
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (.docx)</span>
              </a>
            </Button>
          </div>

          {/* Card 2: Green Community Market */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-border text-muted-foreground text-[10px] font-mono uppercase">
                  Market Concluded
                </Badge>
              </div>
              <h3 className="font-serif font-black text-lg text-foreground">
                Green Community Market
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The zero single-use plastic artisan market that ran concurrently at Ubunifu Hub, connecting sustainable crafters, authors, and healthy food innovators with attendees.
              </p>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-xl border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold self-start gap-1.5">
              <Link href="/events/community-market">
                <span>View Market Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {/* Card 3: Media Kit & Official Assets */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-gold/40 transition-colors">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-border text-muted-foreground text-[10px] font-mono uppercase">
                  Press &amp; Branding
                </Badge>
              </div>
              <h3 className="font-serif font-black text-lg text-foreground">
                Official Media Kit &amp; Press
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Access official commemorative event flyers, high-resolution ceremony posters, mobile story cards, and Greenwave Society brand assets.
              </p>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-xl border-border text-xs font-semibold self-start gap-1.5">
              <Link href="/media-kit">
                <span>Access Media Kit Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 5: DISCRETE ATTENDEE RECORD & PASS LOOKUP */}
      <section id="pass-lookup" className="py-16 sm:py-24 max-w-4xl mx-auto px-6 sm:px-8 w-full scroll-mt-16">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Verified Attendance Records
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
            Retrieve Your Admission Pass &amp; Certificate
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            If you were registered as an attendee or graduand for YPG Cohort I, enter your email below to retrieve your pass record.
          </p>
        </div>

        <AttendeeRsvpForm isClosed={true} />
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

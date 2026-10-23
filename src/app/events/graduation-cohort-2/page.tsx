import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { VendorForm } from "./VendorForm";
import { Calendar, Clock, MapPin, Sparkles, Award, Store, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Ad Hoc Cohort II Graduation & Community Market | Greenwave Society",
  description: "Join us on Friday, 30th October 2026 at Ubunifu Hub, Nairobi to celebrate the graduation of Greenwave Society Ad Hoc Cohort II changemakers and explore our curated community market.",
  alternates: {
    canonical: `${APP_CONFIG.url}/events/graduation-cohort-2`,
  },
  openGraph: {
    title: "Ad Hoc Cohort II Graduation & Community Market | Greenwave Society",
    description: "Honoring our youth changemakers and featuring curated local sustainable vendors on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.",
    url: `${APP_CONFIG.url}/events/graduation-cohort-2`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Greenwave Society Cohort Graduation" }],
    type: "website",
  },
};

export default function GraduationCohortPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Greenwave Society Ad Hoc Cohort II Graduation & Community Market",
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
    "image": [`${APP_CONFIG.url}/images/IMG_9415.jpg`],
    "description": "Graduation celebration for Greenwave Society Ad Hoc Cohort II changemakers and community market.",
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
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Special Event &bull; October 2026
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground border-border rounded-full">
                Cohort Celebration & Community Market
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-[1.1] mb-6">
              Ad Hoc Cohort II <span className="italic font-normal text-primary">Graduation</span> & Market
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              Recognizing the dedication and systems-change projects of our graduating cohort, united with our partners, mentors, and local creative entrepreneurs.
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
                  <div className="text-sm font-semibold text-foreground">10:30 AM – 3:00 PM</div>
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
          </div>
        </div>
      </section>

      {/* Main Content Area: 2 Columns on desktop */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full flex-1">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Event Context & Experience */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
                Celebrating Emerging Leaders in <span className="text-primary italic font-normal">Action</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Greenwave Society’s Ad Hoc Cohort II brings together youth innovators who spent months diagnosing community challenges, developing sustainable initiatives, and demonstrating what youth-led systems thinking looks like on the ground.
              </p>
            </div>

            {/* Event Highlights Cards */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-foreground mb-1">Cohort Recognition Ceremony</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Formal presentation of certificates and showcase of community impact initiatives completed by our graduands across Nairobi and neighbouring counties.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-foreground mb-1">Curated Community Market</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    A vibrant space for local creators, sustainable snack artisans, authors, and craftsmen to connect directly with guests, fellows, and organizational partners.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-foreground mb-1">Eco-Conscious Space Standards</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Consistent with Greenwave Society’s environmental commitments, our venue strictly prohibits single-use plastic packaging and encourages circular materials.
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor FAQ Callout */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
              <h4 className="font-serif font-bold text-base text-primary">Information for Prospective Vendors</h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li><strong>Exclusivity:</strong> Only 1–2 vendors per category will be approved to avoid direct market overlap.</li>
                <li><strong>Logistics:</strong> Tables and chairs are provided by the organizers on-site. Setup runs from 9:30 AM to 10:15 AM.</li>
                <li><strong>Commitment:</strong> A standard flat commitment fee of KES 1,000 confirms your reserved stall once your application is accepted.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Vendor Application Form */}
          <div className="lg:col-span-6" id="vendor-application">
            <VendorForm />
          </div>

        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

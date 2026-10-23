import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { MediaKitClient } from "./MediaKitClient";
import { Sparkles, Film, Palette, Layers, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Media Kit & Brand Assets | Greenwave Society Kenya",
  description: "Official media kit, brand guidelines, verified statistics, boilerplates, and code-rendered motion films for journalists, partners, and media collaborators.",
  alternates: {
    canonical: `${APP_CONFIG.url}/media-kit`,
  },
  openGraph: {
    title: "Media Kit & Brand Assets | Greenwave Society Kenya",
    description: "Official press kit, brand guidelines, high-res motion assets, and approved descriptions for Greenwave Society.",
    url: `${APP_CONFIG.url}/media-kit`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "Greenwave Society Media Kit" }],
    type: "website",
  },
};

export default function MediaKitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Greenwave Society Media Kit & Brand Assets",
    "description": "Official media kit, verified impact numbers, motion assets, and brand design guidelines for Greenwave Society Kenya.",
    "url": `${APP_CONFIG.url}/media-kit`,
    "isPartOf": {
      "@type": "WebSite",
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
            <Badge variant="secondary" className="mb-4 px-3.5 py-1 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
              Press & Brand Resources
            </Badge>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-[1.1] mb-6">
              Greenwave <span className="italic font-normal text-primary">Media Kit</span> & Design Assets
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              Everything you need to accurately tell our story. Explore our brand motion films, download high-resolution marks, copy approved press bios, and access verified organizational facts.
            </p>

            {/* Quick Navigation Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="#films"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-border/80 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-sm"
              >
                <Film className="w-3.5 h-3.5 text-primary" /> Brand Films
              </a>
              <a
                href="#boilerplate"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-border/80 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-sm"
              >
                <Layers className="w-3.5 h-3.5 text-primary" /> Press Boilerplate
              </a>
              <a
                href="#palette"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-border/80 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-sm"
              >
                <Palette className="w-3.5 h-3.5 text-primary" /> Color Palette
              </a>
              <a
                href="#assets"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-border/80 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-primary" /> Logos & Typography
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full flex-1">
        <MediaKitClient />
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

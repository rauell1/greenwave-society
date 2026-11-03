import { serializeJsonLd } from "@/lib/seo";
import { getPublishedNews } from "@/lib/cms/news";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Newspaper, Sparkles, Send } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsListClient } from "./NewsListClient";

export const metadata: Metadata = {
  title: "News & Updates | Greenwave Society Kenya",
  description:
    "Read the latest news, announcements, and impact stories from Greenwave Society: youth leadership, systems change training, conservation, and community action across Kenya.",
  keywords: [
    "Greenwave Society news",
    "Greenwave Society Kenya updates",
    "YPG graduation Kenya",
    "youth leadership news Kenya",
    "systems change fellowship Nairobi",
    "conservation news Kenya",
    "community impact stories Nairobi",
  ],
  alternates: {
    canonical: `${APP_CONFIG.url}/news`,
  },
  openGraph: {
    title: "News & Updates | Greenwave Society Kenya",
    description:
      "Latest news, graduation milestones, and impact reports from Greenwave Society.",
    url: `${APP_CONFIG.url}/news`,
    siteName: "Greenwave Society",
    images: [
      {
        url: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp",
        width: 1600,
        height: 1067,
        alt: "Greenwave Society news and graduation milestone",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "News & Updates | Greenwave Society Kenya",
    description:
      "Latest news, graduation milestones, and impact reports from Greenwave Society.",
    images: [
      "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp",
    ],
  },
};

export const revalidate = 60;

export default async function NewsPage() {
  const articles = await getPublishedNews();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${APP_CONFIG.url}/news/#webpage`,
        "url": `${APP_CONFIG.url}/news`,
        "name": "News & Updates | Greenwave Society Kenya",
        "description":
          "Read the latest news, updates, and impact stories from Greenwave Society.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/news/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "News & Updates", "item": `${APP_CONFIG.url}/news` },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${APP_CONFIG.url}/news/#itemlist`,
        "name": "Greenwave Society News Articles",
        "itemListElement": articles.slice(0, 10).map((a, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${APP_CONFIG.url}/news/${a.slug}`,
          "name": a.title,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <Navbar />

        {/* Breadcrumb Navigation */}
        <div className="pt-24 sm:pt-28 pb-4 border-b border-border/40 bg-secondary/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-foreground font-mono"
            >
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">News &amp; Updates</span>
            </nav>
          </div>
        </div>

        <main className="flex-1 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
            {/* Header Hero Section */}
            <header className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 rounded-full"
                >
                  <Newspaper className="w-3.5 h-3.5 mr-1.5 text-gold" />
                  Editorial &amp; Dispatches
                </Badge>
                <Badge
                  variant="outline"
                  className="px-2.5 py-0.5 text-xs text-muted-foreground border-border rounded-full font-mono"
                >
                  {articles.length} Published Updates
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-foreground leading-[1.12]">
                News &amp; <span className="text-primary italic font-normal">Dispatches</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Stay updated with authentic dispatches from Greenwave Society: convocation retrospectives, fellowship intakes, community barazas, and grassroots climate solutions across Kenya.
              </p>
            </header>

            {/* Interactive News List (CSR filtering with SSR content) */}
            <NewsListClient articles={articles} />

            {/* Stay Connected Banner */}
            <section className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent border border-border/70 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 text-[10px] uppercase font-mono tracking-wider">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Direct Circulars
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                  Stay Informed on Systems Change
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Join our email circle to receive invitations to upcoming community barazas, call for applications, and published think-tank briefs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2">
                  <Link href="/join">
                    <Send className="w-4 h-4" />
                    <span>Join Greenwave Society</span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl border-border text-xs font-semibold">
                  <Link href="/contact?interest=newsletter">
                    <span>Contact Editorial Team</span>
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

import { serializeJsonLd } from "@/lib/seo";
import {
  getPublishedArticle,
  getAllArticleSlugs,
  getRelatedArticles,
} from "@/lib/cms/news";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  User,
  Tag,
  ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { APP_CONFIG } from "@/config/app.config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleShareBar } from "./ArticleShareBar";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const staticSlugs = getAllArticleSlugs();
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  if (!article) return { title: "Article Not Found | Greenwave Society" };

  const title = `${article.title} | Greenwave Society`;
  const description =
    article.excerpt ||
    "Read this dispatch and impact report from Greenwave Society Kenya.";
  const url = `${APP_CONFIG.url}/news/${article.slug}`;
  const imageUrl = article.imageUrl || "/images/IMG_9415.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Greenwave Society",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author || "Greenwave Society"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.slug, 3);
  const articleUrl = `${APP_CONFIG.url}/news/${article.slug}`;
  const heroImage = article.imageUrl || "/images/IMG_9415.jpg";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${articleUrl}/#article`,
        "headline": article.title,
        "description": article.excerpt || undefined,
        "image": [heroImage],
        "datePublished": article.publishedAt?.toISOString(),
        "dateModified": article.updatedAt.toISOString(),
        "author": {
          "@type": "Organization",
          "name": article.author || "Greenwave Society",
          "url": APP_CONFIG.url,
        },
        "publisher": {
          "@type": "Organization",
          "name": "Greenwave Society",
          "url": APP_CONFIG.url,
          "logo": {
            "@type": "ImageObject",
            "url": `${APP_CONFIG.url}/logo.png`,
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": APP_CONFIG.url,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "News & Updates",
            "item": `${APP_CONFIG.url}/news`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": articleUrl,
          },
        ],
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
          <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-foreground font-mono"
            >
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
              <Link href="/news" className="hover:text-primary transition-colors">
                News
              </Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-xs">
                {article.title}
              </span>
            </nav>
          </div>
        </div>

        <main className="flex-1 py-10 sm:py-16">
          <article className="max-w-4xl mx-auto px-6 sm:px-8 space-y-10">
            {/* Back link */}
            <div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Link href="/news">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to News &amp; Updates</span>
                </Link>
              </Button>
            </div>

            {/* Header info */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-muted-foreground">
                {article.category && (
                  <Badge className="bg-primary/10 text-primary border border-primary/25 rounded-full px-3 py-0.5 text-xs uppercase font-bold tracking-wider">
                    <Tag className="w-3 h-3 mr-1" />
                    {article.category}
                  </Badge>
                )}
                {article.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <time dateTime={article.publishedAt.toISOString()}>
                      {format(article.publishedAt, "EEEE, d MMMM yyyy")}
                    </time>
                  </span>
                )}
                <span>&bull;</span>
                {article.readTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{article.readTime}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-foreground leading-[1.14]">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-base sm:text-xl text-muted-foreground leading-relaxed font-sans pt-1">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground font-serif">
                    {article.author || "Greenwave Society Editorial"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Official Greenwave Society Dispatch
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Hero Visual */}
            <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border/70 shadow-lg bg-slate-950">
              <Image
                src={heroImage}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>

            {/* Share bar top */}
            <ArticleShareBar title={article.title} url={articleUrl} />

            {/* Article Markdown Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-h3:text-2xl prose-h4:text-xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
              <ReactMarkdown>{article.body}</ReactMarkdown>
            </div>

            {/* Share bar bottom */}
            <div className="pt-6 border-t border-border/60">
              <ArticleShareBar title={article.title} url={articleUrl} />
            </div>

            {/* Related Updates Section */}
            {relatedArticles.length > 0 && (
              <section className="pt-12 border-t border-border/70 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-foreground">
                    Related Updates &amp; Dispatches
                  </h3>
                  <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                    <Link href="/news">View all news &rarr;</Link>
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedArticles.map((rel) => (
                    <article
                      key={rel.id}
                      className="group rounded-2xl bg-card border border-border/70 p-4 hover:border-primary/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-muted">
                          <Image
                            src={rel.imageUrl || "/images/IMG_9415.jpg"}
                            alt={rel.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="text-[11px] font-mono text-muted-foreground">
                          {rel.publishedAt ? format(rel.publishedAt, "MMM d, yyyy") : ""}
                        </div>

                        <h4 className="font-serif font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          <Link href={`/news/${rel.slug}`}>{rel.title}</Link>
                        </h4>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border/40">
                        <Link
                          href={`/news/${rel.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary group-hover:text-foreground transition-colors"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </article>
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { APP_CONFIG } from "@/config/app.config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  let article = null;
  try {
    article = await db.cmsContent.findFirst({
      where: {
        slug,
        OR: [{ type: "news" }, { type: "article" }],
      },
    });
  } catch (error) {}

  if (!article) return { title: "Not Found" };

  const title = article.title + " | Greenwave Society";
  const description = article.excerpt || "News and updates from Greenwave Society";
  const url = APP_CONFIG.url + "/news/" + article.slug;

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
      images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: article.title }],
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/IMG_9415.jpg"],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  let article = null;

  try {
    article = await db.cmsContent.findFirst({
      where: {
        slug,
        OR: [{ type: "news" }, { type: "article" }],
        status: "published",
      },
    });
  } catch (error) {}

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${APP_CONFIG.url}/news/${article.slug}/#article`,
        "headline": article.title,
        "description": article.excerpt || undefined,
        "datePublished": article.publishedAt?.toISOString(),
        "dateModified": article.updatedAt.toISOString(),
        "author": { "@type": "Organization", "name": "Greenwave Society", "url": APP_CONFIG.url },
        "publisher": {
          "@type": "Organization",
          "name": "Greenwave Society",
          "logo": { "@type": "ImageObject", "url": `${APP_CONFIG.url}/logo.png` },
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${APP_CONFIG.url}/news/${article.slug}` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/news/${article.slug}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "News", "item": `${APP_CONFIG.url}/news` },
          { "@type": "ListItem", "position": 3, "name": article.title, "item": `${APP_CONFIG.url}/news/${article.slug}` },
        ],
      },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <article className="max-w-3xl mx-auto px-6 sm:px-8">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>
          
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
              <Calendar className="w-4 h-4 text-gold" />
              <time dateTime={article.publishedAt?.toISOString()}>
                {article.publishedAt ? format(article.publishedAt, "MMMM d, yyyy") : ""}
              </time>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-foreground leading-tight mb-6">
              {article.title}
            </h1>
          </header>

          <div 
            className="prose prose-emerald lg:prose-lg max-w-none text-muted-foreground font-sans leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </article>
      </main>
      <Footer />
    </div>
    </>
  );
}

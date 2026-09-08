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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const db = getDb();
  let article = null;
  try {
    article = await db.cmsContent.findFirst({
      where: {
        slug: params.slug,
        OR: [{ type: "news" }, { type: "article" }],
      },
    });
  } catch (error) {}

  if (!article) return { title: "Not Found" };

  return {
    title: article.title + " | Greenwave Society",
    description: article.excerpt || "News and updates from Greenwave Society",
    alternates: {
      canonical: APP_CONFIG.url + "/news/" + article.slug,
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const db = getDb();
  let article = null;
  
  try {
    article = await db.cmsContent.findFirst({
      where: {
        slug: params.slug,
        OR: [{ type: "news" }, { type: "article" }],
        status: "published",
      },
    });
  } catch (error) {}

  if (!article) {
    notFound();
  }

  return (
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
  );
}

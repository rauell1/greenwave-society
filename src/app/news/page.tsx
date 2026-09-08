import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { getDb } from "@/lib/db";
import { APP_CONFIG } from "@/config/app.config";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "News & Updates | Greenwave Society Kenya",
  description: "Read the latest news, updates, and impact stories from Greenwave Society.",
  alternates: {
    canonical: APP_CONFIG.url + "/news",
  },
};

export const revalidate = 60;

export default async function NewsPage() {
  const db = getDb();
  
  let articles = [];
  try {
    articles = await db.cmsContent.findMany({
      where: {
        OR: [{ type: "news" }, { type: "article" }],
        status: "published",
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });
  } catch (error) {
    console.error("Failed to fetch news:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <header className="mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-foreground mb-4">
              News & <span className="text-primary italic font-normal">Updates</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay informed about our latest programs, community barazas, and environmental impact across Kenya.
            </p>
          </header>

          {articles.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-border/50">
              <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">No updates yet</h2>
              <p className="text-muted-foreground">Check back soon for the latest news from Greenwave Society.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {articles.map((article: any) => (
                <article key={article.id} className="bg-background rounded-2xl border border-border/50 p-6 sm:p-8 hover:shadow-md transition-shadow group flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={article.publishedAt?.toISOString()}>
                      {article.publishedAt ? format(article.publishedAt, "MMM d, yyyy") : ""}
                    </time>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    <Link href={"/news/" + article.slug}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {article.excerpt || article.body.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...'}
                  </p>
                  <Link 
                    href={"/news/" + article.slug}
                    className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary hover:text-foreground transition-colors self-start"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

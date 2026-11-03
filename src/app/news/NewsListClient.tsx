"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  X,
  Sparkles,
  Newspaper,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicArticle } from "@/lib/cms/news";

interface NewsListClientProps {
  articles: PublicArticle[];
}

export function NewsListClient({ articles }: NewsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ["all", ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (article.category &&
          article.category.toLowerCase() === selectedCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(q)) ||
        article.body.toLowerCase().includes(q) ||
        (article.category && article.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Featured story: if no filter/search, first article is featured
  const featuredArticle =
    !searchQuery && selectedCategory === "all" && filteredArticles.length > 0
      ? filteredArticles[0]
      : null;

  const standardArticles = featuredArticle
    ? filteredArticles.slice(1)
    : filteredArticles;

  return (
    <div className="space-y-12">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/70 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search news, announcements, and reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-primary/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {cat === "all" ? "All Updates" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Lead Story (shown when no search/filters active) */}
      {featuredArticle && (
        <article className="group relative rounded-3xl overflow-hidden bg-card border border-border/80 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl">
          <div className="grid lg:grid-cols-12 gap-0">
            {/* Visual Column */}
            <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[380px] overflow-hidden bg-muted">
              <Image
                src={featuredArticle.imageUrl || "/images/IMG_9415.jpg"}
                alt={featuredArticle.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover group-hover:scale-104 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-gold text-slate-950 font-bold border-none text-xs uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1 fill-current" />
                  Top Story
                </Badge>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                  {featuredArticle.category && (
                    <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/25 bg-primary/5 rounded-md px-2 py-0.5">
                      {featuredArticle.category}
                    </Badge>
                  )}
                  {featuredArticle.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                      <time dateTime={featuredArticle.publishedAt.toISOString()}>
                        {format(featuredArticle.publishedAt, "MMM d, yyyy")}
                      </time>
                    </span>
                  )}
                  {featuredArticle.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
                      <span>{featuredArticle.readTime}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                  <Link href={`/news/${featuredArticle.slug}`}>
                    {featuredArticle.title}
                  </Link>
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  By {featuredArticle.author || "Greenwave Society"}
                </span>

                <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-sm">
                  <Link href={`/news/${featuredArticle.slug}`}>
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Grid of Articles */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-secondary/15 rounded-3xl border border-dashed border-border/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
            <Newspaper className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No updates found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              No news or articles matched your search query &ldquo;{searchQuery}&rdquo;. Try adjusting your keywords or clearing the filter.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="rounded-xl text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {standardArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-card rounded-2xl border border-border/70 hover:border-primary/40 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={article.imageUrl || "/images/IMG_9415.jpg"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {article.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono uppercase tracking-wider text-white font-bold">
                        {article.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Text */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <time dateTime={article.publishedAt.toISOString()}>
                          {format(article.publishedAt, "MMM d, yyyy")}
                        </time>
                      </span>
                    )}
                    {article.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    <Link href={`/news/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {article.excerpt ||
                      article.body
                        .replace(/<[^>]*>?/gm, "")
                        .replace(/[#*_`]/g, "")
                        .substring(0, 140) + "..."}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-5 sm:p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[140px]">
                  {article.author || "Greenwave Society"}
                </span>

                <Link
                  href={`/news/${article.slug}`}
                  className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary group-hover:text-foreground transition-colors text-[11px]"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

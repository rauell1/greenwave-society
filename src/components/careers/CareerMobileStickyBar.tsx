"use client";

import Link from "next/link";
import { ArrowRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CareerMobileStickyBarProps {
  roleSlug: string;
  roleTitle: string;
  isOpen: boolean;
  shareUrl: string;
}

export function CareerMobileStickyBar({
  roleSlug,
  roleTitle,
  isOpen,
  shareUrl,
}: CareerMobileStickyBarProps) {
  const handleQuickShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${roleTitle} | Greenwave Society`,
          text: `Explore the ${roleTitle} opening at Greenwave Society Kenya:`,
          url: shareUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Career link copied to clipboard!");
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden border-t border-zinc-200/90 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        {/* Left summary & status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {isOpen ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                </>
              ) : (
                <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
              )}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {isOpen ? "Applications Open" : "Closed"}
            </span>
          </div>
          <p className="truncate text-xs font-serif font-bold text-zinc-900 mt-0.5">
            {roleTitle}
          </p>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleQuickShare}
            className="h-11 w-11 rounded-xl border-zinc-300 p-0 text-zinc-700 hover:bg-zinc-100 flex items-center justify-center shrink-0"
            aria-label="Share this opening"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          {isOpen ? (
            <Button
              asChild
              size="sm"
              className="h-11 rounded-xl bg-emerald-800 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <Link href={`/careers/apply/${roleSlug}`}>
                <span>Apply Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="h-11 rounded-xl px-3 text-xs font-semibold text-zinc-700"
            >
              <Link href="/careers">Other Roles</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

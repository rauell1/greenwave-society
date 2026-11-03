"use client";

import { useState } from "react";
import { Share2, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CareerShareBarProps {
  roleTitle: string;
  roleSummary: string;
  shareUrl: string;
}

export function CareerShareBar({ roleTitle, roleSummary, shareUrl }: CareerShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Career link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Failed to copy link. Please copy directly from your address bar.");
    }
  };

  const shareText = `💼 Career Opportunity at Greenwave Society: ${roleTitle}\n\n${roleSummary}\n\nView role details & apply:`;

  const handleWhatsApp = () => {
    const fullText = `${shareText}\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, "_blank", "noopener,noreferrer");
  };

  const handleLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleX = () => {
    const text = encodeURIComponent(`💼 Open Role: ${roleTitle} at Greenwave Society • Kenya\n\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${roleTitle} | Greenwave Society`,
          text: roleSummary,
          url: shareUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-700/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              <Sparkles className="h-3 w-3 text-amber-600" /> Shareable Link
            </span>
            <span className="text-xs font-semibold text-zinc-700">Share this opening</span>
          </div>
          <div className="truncate font-mono text-xs text-zinc-500 select-all">
            {shareUrl}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-9 rounded-xl border-zinc-300 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5 text-zinc-600" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleWhatsApp}
            className="h-9 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleLinkedIn}
            className="h-9 rounded-xl bg-[#0A66C2] text-white hover:bg-[#084e96] text-xs font-semibold gap-1.5 shadow-xs"
          >
            LinkedIn
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleX}
            className="h-9 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold gap-1.5 shadow-xs"
          >
            X
          </Button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleNativeShare}
              className="h-9 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 sm:inline-flex hidden"
              aria-label="Share via device"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

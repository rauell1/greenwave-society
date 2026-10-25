"use client";

import { useState } from "react";
import { Copy, Check, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareableLinkBarProps {
  label: string;
  url: string;
  shareMessage: string;
  badge?: string;
}

export function ShareableLinkBar({
  label,
  url,
  shareMessage,
  badge = "Direct Share Link",
}: ShareableLinkBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Shareable link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Failed to copy link. Please copy directly from your browser.");
    }
  };

  const handleWhatsApp = () => {
    const fullText = `${shareMessage}\n\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: label,
          text: shareMessage,
          url: url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/70 backdrop-blur-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold" /> {badge}
          </span>
          <span className="text-xs font-semibold text-foreground truncate">{label}</span>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground truncate select-all">
          {url}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="rounded-xl border-border/80 text-xs h-8 px-3 gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleWhatsApp}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 gap-1.5 shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </Button>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleNativeShare}
            className="rounded-xl text-xs h-8 px-2.5 sm:inline-flex hidden"
            aria-label="Share via device"
          >
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}

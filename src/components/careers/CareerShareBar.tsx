"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CareerShareBarProps {
  roleTitle: string;
  roleSummary: string;
  shareUrl: string;
}

export function CareerShareBar({ roleTitle, roleSummary, shareUrl }: CareerShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Career link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Failed to copy link. Please copy directly from your browser address bar.");
    }
  };

  const shareText = `💼 Career Opening at Greenwave Society (Kenya)\nRole: ${roleTitle}\n\n${roleSummary}\n\nExplore details and apply:`;

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
          text: `${roleTitle} • Greenwave Society Kenya: ${roleSummary}`,
          url: shareUrl,
        });
      } catch {
        // User dismissed native share sheet
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-700/30">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left URL info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              <Sparkles className="h-3 w-3 text-amber-600" /> Shareable Opening
            </span>
            <span className="text-xs font-semibold text-zinc-700">Invite or share with candidates</span>
          </div>
          <div className="truncate font-mono text-[11px] sm:text-xs text-zinc-500 select-all bg-zinc-50 sm:bg-transparent p-1.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-zinc-200/60">
            {shareUrl}
          </div>
        </div>

        {/* Action Buttons: Responsive & Mobile Touch Friendly */}
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0 shrink-0">
          {/* Mobile Native Share Button: Prominently featured on mobile phones */}
          {canNativeShare && (
            <Button
              type="button"
              size="sm"
              onClick={handleNativeShare}
              className="h-10 sm:h-9 rounded-xl bg-emerald-800 text-white hover:bg-emerald-700 text-xs font-semibold gap-1.5 shadow-xs flex-1 sm:flex-none justify-center"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Share</span>
            </Button>
          )}

          {/* Copy Link Button */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-10 sm:h-9 rounded-xl border-zinc-300 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 gap-1.5 flex-1 sm:flex-none justify-center active:scale-95 transition-transform"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5 text-zinc-600" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </Button>

          {/* WhatsApp */}
          <Button
            type="button"
            size="sm"
            onClick={handleWhatsApp}
            className="h-10 sm:h-9 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-semibold gap-1.5 shadow-xs flex-1 sm:flex-none justify-center"
            aria-label="Share via WhatsApp"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="inline">WhatsApp</span>
          </Button>

          {/* LinkedIn */}
          <Button
            type="button"
            size="sm"
            onClick={handleLinkedIn}
            className="h-10 sm:h-9 rounded-xl bg-[#0A66C2] text-white hover:bg-[#084e96] text-xs font-semibold gap-1.5 shadow-xs px-3 sm:px-3.5"
            aria-label="Share on LinkedIn"
          >
            LinkedIn
          </Button>

          {/* X / Twitter */}
          <Button
            type="button"
            size="sm"
            onClick={handleX}
            className="h-10 sm:h-9 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold gap-1.5 shadow-xs px-3 sm:px-3.5"
            aria-label="Share on X"
          >
            X
          </Button>
        </div>
      </div>
    </div>
  );
}

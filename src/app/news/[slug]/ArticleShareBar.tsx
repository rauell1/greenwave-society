"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ArticleShareBarProps {
  title: string;
  url: string;
}

export function ArticleShareBar({ title, url }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`📰 ${title}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareLinkedIn = () => {
    const shareUrl = encodeURIComponent(url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, "_blank", "noopener,noreferrer");
  };

  const shareX = () => {
    const text = encodeURIComponent(`📰 ${title}`);
    const shareUrl = encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-secondary/20 border border-border/70 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground font-mono">
        <Share2 className="w-4 h-4 text-primary" />
        <span>Share this story:</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="rounded-xl text-xs gap-1.5 h-8"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={shareWhatsApp}
          className="rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold h-8 px-3"
        >
          WhatsApp
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={shareLinkedIn}
          className="rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-semibold h-8 px-3"
        >
          LinkedIn
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={shareX}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold h-8 px-3"
        >
          X (Twitter)
        </Button>
      </div>
    </div>
  );
}

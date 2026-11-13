"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

// Copy-link and WhatsApp share for an event's public sign-up page. Used on the public event
// page and in the admin, so organisers can paste the link into groups and posters.
export function ShareEventLink({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const message = `Join us at ${title}! Sign up here: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title, text: `Join us at ${title}!`, url }).catch(() => undefined);
    } else {
      void copy();
    }
  }

  const button = "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted";
  return (
    <div className={compact ? "" : "rounded-2xl border border-primary/10 p-5"}>
      {!compact && <p className="text-sm font-semibold">Invite others</p>}
      <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-3"}`}>
        <input readOnly value={url} onFocus={e => e.currentTarget.select()} aria-label="Sign-up link" className="min-w-0 flex-1 basis-56 rounded-lg border bg-background px-3 py-2 text-sm" />
        <button type="button" onClick={() => void copy()} className={button}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy link"}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={button}>WhatsApp</a>
        <button type="button" onClick={() => void share()} className={button}><Share2 className="h-4 w-4" />Share</button>
      </div>
    </div>
  );
}

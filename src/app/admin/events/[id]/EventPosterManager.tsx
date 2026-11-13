"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageIcon, RotateCcw, Trash2, Upload } from "lucide-react";
import { MediaUploadDialog, type UploadedMediaAsset } from "@/components/admin/media/MediaUploadDialog";
import { readApiError } from "@/lib/admin/api-error";

interface Props {
  eventId: string;
  eventTitle: string;
  poster: { src: string; alt: string; width: number; height: number } | null;
  hidden: boolean;
  customised: boolean;
  hasBundled: boolean;
}

export default function EventPosterManager({ eventId, eventTitle, poster, hidden, customised, hasBundled }: Props) {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function change(body: Record<string, unknown>, done: string) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/poster`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) return setMessage({ ok: false, text: await readApiError(response, "Unable to update the poster.") });
      setMessage({ ok: true, text: done });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Network error. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  const uploaded = (asset: UploadedMediaAsset) =>
    void change({ action: "set", src: asset.url, alt: asset.altText || `${eventTitle} poster`, width: asset.width ?? undefined, height: asset.height ?? undefined }, "New poster is live on the public page.");

  const button = "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50";
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Poster</h2>
          <p className="text-xs text-slate-500">Shown on the event card and page. Upload a new version whenever details change.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"><Upload className="h-4 w-4" />{poster ? "Upload new poster" : "Upload poster"}</button>
          {poster && <button disabled={busy} onClick={() => { if (window.confirm("Remove the poster from the public page?")) void change({ action: "remove" }, "Poster removed from the public page."); }} className={`${button} text-red-700`}><Trash2 className="h-4 w-4" />Remove</button>}
          {customised && hasBundled && <button disabled={busy} onClick={() => void change({ action: "reset" }, "Original campaign poster restored.")} className={button}><RotateCcw className="h-4 w-4" />Restore original</button>}
        </div>
      </div>
      <div className="mt-4">
        {poster ? (
          <div className="relative w-40 overflow-hidden rounded-lg border" style={{ aspectRatio: `${poster.width} / ${poster.height}` }}>
            <Image key={poster.src} src={poster.src} alt={poster.alt} fill sizes="160px" className="object-contain" />
          </div>
        ) : (
          <div className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-slate-500"><ImageIcon className="h-5 w-5" />{hidden ? "Poster removed" : "No poster"}</div>
        )}
      </div>
      {message && <p className={`mt-3 text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`} role="status">{message.text}</p>}
      <MediaUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={uploaded}
        title={`Upload poster for ${eventTitle}`}
        description="JPEG, PNG or WebP. Large images are resized automatically. It replaces the current poster as soon as the upload finishes."
        defaultAlt={`${eventTitle} poster`}
      />
    </div>
  );
}

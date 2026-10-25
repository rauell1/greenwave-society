"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { 
  Pencil, 
  X, 
  FileText, 
  AlertCircle, 
  Loader2, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface UpdatableMediaAsset {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
}

interface MediaUpdateModalProps {
  asset: UpdatableMediaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: { id: string; altText: string | null; caption: string | null }) => void;
}

export function MediaUpdateModal({
  asset,
  open,
  onOpenChange,
  onSuccess,
}: MediaUpdateModalProps) {
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setAltText(asset.altText || "");
      setCaption(asset.caption || "");
      setErrorMessage(null);
    }
  }, [asset]);

  if (!open || !asset) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: altText.trim() || null,
          caption: caption.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update asset metadata");
      }

      onSuccess({
        id: asset.id,
        altText: altText.trim() || null,
        caption: caption.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = asset.contentType.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-emerald-600" /> Edit Media Metadata
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">
              {asset.filename}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Asset Preview Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3">
            {isImage ? (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                <Image
                  src={asset.url}
                  alt={asset.altText || asset.filename}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                <FileText className="w-8 h-8" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate" title={asset.filename}>
                {asset.filename}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {asset.width && asset.height ? `${asset.width} × ${asset.height} px · ` : ""}
                {Math.ceil(asset.size / 1024)} KB · {asset.contentType}
              </p>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 mt-1"
              >
                View full file <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Alt Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Alternative Text {isImage && <span className="text-red-500">*</span>}</span>
              <span className="text-[10px] text-slate-400 font-normal">Accessibility & Screen Readers</span>
            </label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive alt text for this image"
              className="text-xs h-9"
              maxLength={300}
              disabled={isSaving}
              required={isImage}
            />
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Caption or Internal Context</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Context, credits, or descriptive caption"
              className="text-xs resize-none h-24"
              maxLength={2000}
              disabled={isSaving}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="text-xs h-9"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

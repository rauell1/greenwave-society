"use client";

import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from "react";
import Image from "next/image";
import { 
  CloudUpload, 
  X, 
  FileText, 
  AlertCircle, 
  Check, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface UploadedMediaAsset {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
}

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (asset: UploadedMediaAsset) => void;
  title?: string;
  description?: string;
  defaultAlt?: string;
}

export function MediaUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "Upload Media to Storage",
  description = "Upload images or documents to Cloud Storage. Maximum size: 10 MB.",
  defaultAlt = "",
}: MediaUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState(defaultAlt);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Only JPEG, PNG, WebP, GIF, and PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds the 10 MB maximum upload limit.");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    if (!altText) {
      const suggested = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]/g, " ")
        .slice(0, 100);
      setAltText(suggested);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAltText("");
    setCaption("");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    if (selectedFile.type.startsWith("image/") && !altText.trim()) {
      setErrorMessage("Alternative text is required for image accessibility.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("altText", altText.trim());
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload asset to storage");
      }

      const asset: UploadedMediaAsset = data.asset;
      handleReset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(asset);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-emerald-600" /> {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Dropzone or Preview */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                isDragOver 
                  ? "border-emerald-600 bg-emerald-50/50" 
                  : "border-slate-200 hover:border-slate-400 bg-slate-50/50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-xs">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">
                  Click to choose file or drag and drop here
                </p>
                <p className="text-[11px] text-slate-500">
                  JPEG, PNG, WebP, GIF, or PDF (up to 10 MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 relative group">
              {previewUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                  <FileText className="w-8 h-8" />
                </div>
              )}

              <div className="flex-1 min-w-0 pr-8">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - {selectedFile.type || "file"}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready to upload
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Alt Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Alternative Text {selectedFile?.type.startsWith("image/") && <span className="text-red-500">*</span>}</span>
              <span className="text-[10px] text-slate-400 font-normal">Accessibility & SEO</span>
            </label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Greenwave youth members collaborating in Nairobi"
              className="text-xs h-9"
              maxLength={300}
              disabled={isUploading}
            />
            <p className="text-[10px] text-slate-400">
              Concise description of the image content for screen readers and search engines.
            </p>
          </div>

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Caption or Context</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add optional internal context, photographer credit, or display caption..."
              className="text-xs resize-none h-20"
              maxLength={2000}
              disabled={isUploading}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="text-xs h-9"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isUploading || !selectedFile}
              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Storage...
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5" /> Upload Asset
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

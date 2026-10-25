"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  CloudUpload, 
  Search, 
  FileText, 
  Pencil, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  HardDrive, 
  Layers, 
  AlertCircle,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MediaUploadDialog, type UploadedMediaAsset } from "@/components/admin/media/MediaUploadDialog";
import { MediaUpdateModal, type UpdatableMediaAsset } from "@/components/admin/media/MediaUpdateModal";

export type Asset = {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  _count: { usages: number };
};

interface MediaManagerProps {
  assets: Asset[];
  canUpload: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

type MediaFilter = "all" | "images" | "documents";

export default function MediaManager({
  assets: initialAssets,
  canUpload,
  canUpdate,
  canDelete,
}: MediaManagerProps) {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<MediaFilter>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<UpdatableMediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const totalBytes = useMemo(() => {
    return assets.reduce((sum, a) => sum + (a.size || 0), 0);
  }, [assets]);

  const imageCount = useMemo(() => {
    return assets.filter((a) => a.contentType.startsWith("image/")).length;
  }, [assets]);

  const docCount = useMemo(() => {
    return assets.filter((a) => !a.contentType.startsWith("image/")).length;
  }, [assets]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUploaded = (newAsset: UploadedMediaAsset) => {
    const formatted: Asset = {
      id: newAsset.id,
      filename: newAsset.filename,
      url: newAsset.url,
      contentType: newAsset.contentType,
      size: newAsset.size,
      width: newAsset.width || null,
      height: newAsset.height || null,
      altText: newAsset.altText || null,
      caption: newAsset.caption || null,
      _count: { usages: 0 },
    };

    setAssets((prev) => [formatted, ...prev]);
    setNotification({
      type: "success",
      message: `Asset "${formatted.filename}" uploaded successfully to Cloud Storage!`,
    });
    setTimeout(() => setNotification(null), 6000);
    router.refresh();
  };

  const handleUpdated = (updated: { id: string; altText: string | null; caption: string | null }) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === updated.id
          ? { ...a, altText: updated.altText, caption: updated.caption }
          : a
      )
    );
    setNotification({
      type: "success",
      message: "Media metadata updated successfully!",
    });
    setTimeout(() => setNotification(null), 5000);
    router.refresh();
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${filename}" from storage?`)) {
      return;
    }

    setDeletingId(id);
    setNotification(null);

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete asset from storage");
      }

      setAssets((prev) => prev.filter((a) => a.id !== id));
      setNotification({
        type: "success",
        message: `Asset "${filename}" deleted from storage.`,
      });
      setTimeout(() => setNotification(null), 5000);
      router.refresh();
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.altText && asset.altText.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.caption && asset.caption.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      if (filterMode === "images") return asset.contentType.startsWith("image/");
      if (filterMode === "documents") return !asset.contentType.startsWith("image/");
      return true;
    });
  }, [assets, searchTerm, filterMode]);

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assets</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{assets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Photographs</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{imageCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{docCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage Volume</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {(totalBytes / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          notification.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets by filename, alt text, or caption..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-stretch sm:self-auto">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({assets.length})
            </button>
            <button
              onClick={() => setFilterMode("images")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "images" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Images ({imageCount})
            </button>
            <button
              onClick={() => setFilterMode("documents")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === "documents" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PDFs ({docCount})
            </button>
          </div>
        </div>

        {canUpload && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs w-full sm:w-auto h-9"
          >
            <CloudUpload className="w-4 h-4" /> Upload New Asset
          </Button>
        )}
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
          <p className="font-semibold text-slate-700">No media assets found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? "No assets match your search criteria. Try a different search term."
              : "No media assets uploaded to storage yet. Use the Upload New Asset button to add files."}
          </p>
          {canUpload && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsUploadOpen(true)}
              className="text-xs gap-1.5"
            >
              <CloudUpload className="w-3.5 h-3.5" /> Upload Asset
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => {
            const isImage = asset.contentType.startsWith("image/");
            const isDeleting = deletingId === asset.id;
            const isCopied = copiedId === asset.id;

            return (
              <div
                key={asset.id}
                className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all hover:shadow-md group"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  {isImage ? (
                    <Image
                      src={asset.url}
                      alt={asset.altText || asset.filename}
                      fill
                      sizes="350px"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50/60 text-amber-700 gap-2">
                      <FileText className="w-10 h-10" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">PDF Document</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="secondary" className="text-[9px] bg-black/60 text-white backdrop-blur-xs font-mono uppercase">
                      {isImage ? asset.filename.split(".").pop() || "IMG" : "PDF"}
                    </Badge>
                  </div>

                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                      title="Open full file"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Details & Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-900 truncate" title={asset.filename}>
                      {asset.filename}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {asset.width && asset.height ? `${asset.width} × ${asset.height} · ` : ""}
                      {Math.ceil(asset.size / 1024)} KB · {asset._count.usages} uses
                    </p>

                    {asset.altText && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100" title={asset.altText}>
                        <span className="font-semibold text-slate-400 uppercase text-[9px] block">Alt:</span> {asset.altText}
                      </p>
                    )}

                    {asset.caption && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic" title={asset.caption}>
                        &ldquo;{asset.caption}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(asset.url, asset.id)}
                        className="text-[11px] h-7 px-2 text-slate-600 hover:text-slate-900"
                        title="Copy direct URL"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 mr-1 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" /> Copy URL
                          </>
                        )}
                      </Button>

                      {canUpdate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAsset(asset)}
                          className="text-[11px] h-7 px-2 text-slate-600 hover:text-slate-900"
                          title="Edit alt text and caption"
                        >
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      )}
                    </div>

                    {canDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={asset._count.usages > 0 || isDeleting}
                        onClick={() => handleDelete(asset.id, asset.filename)}
                        className="text-[11px] h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                        title={asset._count.usages > 0 ? "Cannot delete asset while in use" : "Delete asset from storage"}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={handleUploaded}
      />

      {/* Update Metadata Modal */}
      <MediaUpdateModal
        asset={editingAsset}
        open={Boolean(editingAsset)}
        onOpenChange={(open) => !open && setEditingAsset(null)}
        onSuccess={handleUpdated}
      />
    </div>
  );
}

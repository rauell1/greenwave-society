"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ImageIcon, 
  Check, 
  RotateCcw, 
  Save, 
  ExternalLink, 
  Search, 
  X,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  CloudUpload,
  FileImage
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { AvailableCmsImage } from "@/lib/cms/placements";

interface SlotMeta {
  name: string;
  section: string;
  description: string;
  route: string;
  aspectRatio: string;
}

interface PlacementsManagerProps {
  initialPlacements: Record<string, { src: string; alt: string }>;
  defaultPlacements: Record<string, { src: string; alt: string } & SlotMeta>;
  availableImages: AvailableCmsImage[];
  canUpdate: boolean;
}

type ModalFilter = "all" | "repo" | "blob" | "poster";

export default function PlacementsManager({
  initialPlacements,
  defaultPlacements,
  availableImages,
  canUpdate,
}: PlacementsManagerProps) {
  const [placements, setPlacements] = useState(initialPlacements);
  const [activePickerSlot, setActivePickerSlot] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalFilter, setModalFilter] = useState<ModalFilter>("all");
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 24;

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const slotKeys = Object.keys(defaultPlacements);

  const handleSelectImage = (slotKey: string, url: string) => {
    setPlacements((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        src: url,
      },
    }));
    setActivePickerSlot(null);
  };

  const handleAltChange = (slotKey: string, alt: string) => {
    setPlacements((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        alt,
      },
    }));
  };

  const handleResetSlot = (slotKey: string) => {
    const def = defaultPlacements[slotKey];
    if (def) {
      setPlacements((prev) => ({
        ...prev,
        [slotKey]: {
          src: def.src,
          alt: def.alt,
        },
      }));
    }
  };

  const handleResetAll = () => {
    const res: Record<string, { src: string; alt: string }> = {};
    for (const [k, v] of Object.entries(defaultPlacements)) {
      res[k] = { src: v.src, alt: v.alt };
    }
    setPlacements(res);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/placements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placements }),
      });
      if (!res.ok) {
        throw new Error("Failed to save image placements");
      }
      setNotification({ type: "success", message: "Frontend image placements saved and revalidated successfully across all pages!" });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ type: "error", message: String(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const repoCount = availableImages.filter((i) => i.source === "repo").length;
  const blobCount = availableImages.filter((i) => i.source === "blob").length;
  const posterCount = availableImages.filter((i) => i.source === "poster").length;

  const filteredImages = useMemo(() => {
    return availableImages.filter((img) => {
      const matchesSearch =
        img.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.url.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (modalFilter === "repo") return img.source === "repo";
      if (modalFilter === "blob") return img.source === "blob";
      if (modalFilter === "poster") return img.source === "poster";
      return true;
    });
  }, [availableImages, searchTerm, modalFilter]);

  const totalModalPages = Math.max(1, Math.ceil(filteredImages.length / modalPageSize));
  const safeModalPage = Math.min(modalPage, totalModalPages);
  const modalStartIndex = (safeModalPage - 1) * modalPageSize;
  const modalEndIndex = Math.min(modalStartIndex + modalPageSize, filteredImages.length);
  const currentModalImages = filteredImages.slice(modalStartIndex, modalEndIndex);

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" /> Key Frontend Image Slots
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose which verified photographs and campaign graphics appear in each prominent section across the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            disabled={!canUpdate || isSaving}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
          </Button>
          
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!canUpdate || isSaving}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : "Save Placements"}
          </Button>
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

      {/* Slots Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slotKeys.map((key) => {
          const meta = defaultPlacements[key];
          const current = placements[key] || { src: meta.src, alt: meta.alt };
          const isCustomized = current.src !== meta.src || current.alt !== meta.alt;

          return (
            <div key={key} className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all hover:shadow-md">
              {/* Image Preview Box */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100 group">
                <Image
                  src={current.src}
                  alt={current.alt || meta.name}
                  fill
                  sizes="400px"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setActivePickerSlot(key);
                      setSearchTerm("");
                      setModalPage(1);
                    }}
                    className="text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-sm"
                  >
                    Change Image
                  </Button>
                </div>
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] bg-white/90 backdrop-blur-sm text-slate-800 font-semibold shadow-xs">
                    {meta.section}
                  </Badge>
                  {isCustomized && (
                    <Badge className="text-[10px] bg-emerald-600 text-white font-medium shadow-xs">
                      Customized
                    </Badge>
                  )}
                </div>
              </div>

              {/* Slot Details & Controls */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{meta.name}</h3>
                    <Link
                      href={meta.route}
                      target="_blank"
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                      title="View on live page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{meta.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Alt / Accessibility Text
                    </label>
                    <Input
                      value={current.alt}
                      onChange={(e) => handleAltChange(key, e.target.value)}
                      placeholder="Descriptive alt text for screen readers"
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActivePickerSlot(key);
                        setSearchTerm("");
                        setModalPage(1);
                      }}
                      disabled={!canUpdate}
                      className="text-xs h-8 flex-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1 text-slate-500" /> Choose Image ({availableImages.length})
                    </Button>

                    {isCustomized && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResetSlot(key)}
                        disabled={!canUpdate}
                        className="text-xs h-8 text-slate-500 hover:text-slate-900"
                        title="Revert this slot to default image"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Chooser Modal */}
      {activePickerSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Select Image for {defaultPlacements[activePickerSlot]?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse all {availableImages.length} photographs from repo, blob uploads, and posters.
                </p>
              </div>

              <button
                onClick={() => setActivePickerSlot(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setModalPage(1);
                    }}
                    placeholder="Search by filename (e.g. 2026, tree, g-59)..."
                    className="pl-9 bg-white text-xs h-9"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => { setModalFilter("all"); setModalPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      modalFilter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    All ({availableImages.length})
                  </button>
                  <button
                    onClick={() => { setModalFilter("repo"); setModalPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      modalFilter === "repo" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <HardDrive className="w-3 h-3" /> Repo ({repoCount})
                  </button>
                  {blobCount > 0 && (
                    <button
                      onClick={() => { setModalFilter("blob"); setModalPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        modalFilter === "blob" ? "bg-purple-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <CloudUpload className="w-3 h-3" /> Blob ({blobCount})
                    </button>
                  )}
                  {posterCount > 0 && (
                    <button
                      onClick={() => { setModalFilter("poster"); setModalPage(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        modalFilter === "poster" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <FileImage className="w-3 h-3" /> Posters ({posterCount})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnails Grid */}
            <div className="p-5 overflow-y-auto flex-1">
              {currentModalImages.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">No matching images found</p>
                  <p className="text-xs">Try adjusting your search query or filter tab.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentModalImages.map((img) => {
                    const isSelected = placements[activePickerSlot]?.src === img.url;
                    return (
                      <button
                        key={img.url}
                        onClick={() => handleSelectImage(activePickerSlot, img.url)}
                        className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all aspect-video bg-slate-100 cursor-pointer ${
                          isSelected ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.filename}
                          fill
                          sizes="200px"
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                          <p className="text-[10px] font-mono truncate">{img.filename}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-[9px] bg-black/60 text-white backdrop-blur-xs font-mono uppercase">
                            {img.source}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <strong>{filteredImages.length === 0 ? 0 : modalStartIndex + 1}</strong> - <strong>{modalEndIndex}</strong> of <strong>{filteredImages.length}</strong> available photos
              </div>

              <div className="flex items-center gap-2">
                {totalModalPages > 1 && (
                  <div className="flex items-center gap-1 mr-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                      disabled={safeModalPage === 1}
                      className="text-xs h-7 px-2"
                    >
                      <ChevronLeft className="w-3 h-3" /> Prev
                    </Button>
                    <span className="text-xs text-slate-700 px-1 font-medium">
                      {safeModalPage} / {totalModalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModalPage((p) => Math.min(totalModalPages, p + 1))}
                      disabled={safeModalPage === totalModalPages}
                      className="text-xs h-7 px-2"
                    >
                      Next <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePickerSlot(null)}
                  className="text-xs h-7"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

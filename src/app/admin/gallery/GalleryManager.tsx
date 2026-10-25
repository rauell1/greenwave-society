"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Images, 
  Save, 
  ExternalLink, 
  Search, 
  Eye, 
  EyeOff,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HardDrive,
  CloudUpload,
  FileImage
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { CuratedGalleryItem, AvailableGalleryImage } from "@/lib/cms/gallery";

interface GalleryManagerProps {
  initialCurated: CuratedGalleryItem[];
  available: AvailableGalleryImage[];
  canUpdate: boolean;
}

type FilterMode = "all" | "active" | "inactive" | "repo" | "blob" | "poster";

export default function GalleryManager({
  initialCurated,
  available,
  canUpdate,
}: GalleryManagerProps) {
  // Build initial items map
  const initialMap = useMemo(() => {
    const map: Record<string, CuratedGalleryItem & { source: "repo" | "blob" | "poster"; filename: string }> = {};

    for (const item of available) {
      const existing = initialCurated.find((c) => c.src === item.src);
      map[item.src] = {
        src: item.src,
        filename: item.filename,
        source: item.source,
        alt: existing?.alt || item.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        caption: existing?.caption || "",
        active: existing ? existing.active !== false : false,
      };
    }

    // Include any stored items not in available list
    for (const item of initialCurated) {
      if (!map[item.src]) {
        const fname = item.src.split("/").pop() || "photo.jpg";
        map[item.src] = {
          src: item.src,
          filename: fname,
          source: item.src.startsWith("/posters/") ? "poster" : item.src.includes("blob") ? "blob" : "repo",
          alt: item.alt || fname,
          caption: item.caption || "",
          active: item.active !== false,
        };
      }
    }

    return map;
  }, [available, initialCurated]);

  const [items, setItems] = useState(initialMap);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(36);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const allKeys = Object.keys(items);
  const activeCount = allKeys.filter((k) => items[k].active).length;
  const repoCount = allKeys.filter((k) => items[k].source === "repo").length;
  const blobCount = allKeys.filter((k) => items[k].source === "blob").length;
  const posterCount = allKeys.filter((k) => items[k].source === "poster").length;

  const handleToggle = (src: string) => {
    setItems((prev) => ({
      ...prev,
      [src]: {
        ...prev[src],
        active: !prev[src].active,
      },
    }));
  };

  const handleAltChange = (src: string, alt: string) => {
    setItems((prev) => ({
      ...prev,
      [src]: {
        ...prev[src],
        alt,
      },
    }));
  };

  const handleSelectAllFiltered = () => {
    setItems((prev) => {
      const next = { ...prev };
      for (const key of filteredKeys) {
        if (next[key]) next[key] = { ...next[key], active: true };
      }
      return next;
    });
  };

  const handleDeselectAllFiltered = () => {
    setItems((prev) => {
      const next = { ...prev };
      for (const key of filteredKeys) {
        if (next[key]) next[key] = { ...next[key], active: false };
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
      const payload: CuratedGalleryItem[] = Object.values(items).map((item) => ({
        src: item.src,
        alt: item.alt,
        caption: item.caption,
        active: item.active,
      }));

      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: payload }),
      });
      if (!res.ok) {
        throw new Error("Failed to save gallery selection");
      }
      setNotification({
        type: "success",
        message: `Public gallery updated! ${activeCount} photos are currently active on /gallery.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ type: "error", message: String(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredKeys = useMemo(() => {
    return allKeys.filter((k) => {
      const item = items[k];
      const matchesSearch =
        k.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alt.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === "active") return item.active;
      if (filterMode === "inactive") return !item.active;
      if (filterMode === "repo") return item.source === "repo";
      if (filterMode === "blob") return item.source === "blob";
      if (filterMode === "poster") return item.source === "poster";
      return true;
    });
  }, [allKeys, items, searchTerm, filterMode]);

  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredKeys.length);
  const currentKeys = filteredKeys.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Images className="w-5 h-5 text-emerald-600" /> Curated Photo Gallery
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse and manage all photos present in this repo and blob storage. Currently featuring <strong>{activeCount}</strong> of {allKeys.length} photos on the public <Link href="/gallery" target="_blank" className="text-emerald-600 underline font-semibold">/gallery</Link> page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAllFiltered}
            disabled={!canUpdate || isSaving || filteredKeys.length === 0}
            className="text-xs gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Select Visible ({filteredKeys.length})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeselectAllFiltered}
            disabled={!canUpdate || isSaving || filteredKeys.length === 0}
            className="text-xs gap-1.5"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" /> Deselect Visible
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!canUpdate || isSaving}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : "Save Gallery"}
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-slate-600 gap-1.5"
          >
            <Link href="/gallery" target="_blank">
              <ExternalLink className="w-3.5 h-3.5" /> View /gallery
            </Link>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by filename or caption (e.g. 2026, tree, g-59)..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={48}>48</option>
              <option value={72}>72</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => { setFilterMode("all"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Photos ({allKeys.length})
          </button>
          <button
            onClick={() => { setFilterMode("active"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "active" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Live on /gallery ({activeCount})
          </button>
          <button
            onClick={() => { setFilterMode("inactive"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "inactive" ? "bg-amber-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Hidden ({allKeys.length - activeCount})
          </button>
          <button
            onClick={() => { setFilterMode("repo"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              filterMode === "repo" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <HardDrive className="w-3 h-3" /> Repo Photos ({repoCount})
          </button>
          {blobCount > 0 && (
            <button
              onClick={() => { setFilterMode("blob"); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                filterMode === "blob" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <CloudUpload className="w-3 h-3" /> Blob Uploads ({blobCount})
            </button>
          )}
          {posterCount > 0 && (
            <button
              onClick={() => { setFilterMode("poster"); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                filterMode === "poster" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileImage className="w-3 h-3" /> Posters ({posterCount})
            </button>
          )}
        </div>
      </div>

      {/* Pagination Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-slate-500">
        <div>
          Showing <strong>{filteredKeys.length === 0 ? 0 : startIndex + 1}</strong> - <strong>{endIndex}</strong> of <strong>{filteredKeys.length}</strong> photos
          {searchTerm && ` matching "${searchTerm}"`}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon" className="h-7 w-7"
              onClick={() => goToPage(1)}
              disabled={safeCurrentPage === 1}
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon" className="h-7 w-7"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <span className="px-2 text-xs font-medium text-slate-700">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon" className="h-7 w-7"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon" className="h-7 w-7"
              onClick={() => goToPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {currentKeys.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">No photos match your filter</p>
          <p className="text-xs">Try clearing the search term or switching to a different filter tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentKeys.map((src) => {
            const item = items[src];
            const isPoster = item.source === "poster";
            const isBlob = item.source === "blob";

            return (
              <div
                key={src}
                className={`flex flex-col rounded-2xl bg-white border overflow-hidden transition-all shadow-xs ${
                  item.active ? "border-emerald-500/70 ring-2 ring-emerald-500/10" : "border-slate-200 opacity-70 hover:opacity-100"
                }`}
              >
                {/* Image Preview with Toggle Overlay */}
                <div
                  onClick={() => canUpdate && handleToggle(src)}
                  className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={src}
                    alt={item.alt}
                    fill
                    sizes="300px"
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status & Source Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {item.active ? (
                      <Badge className="text-[10px] bg-emerald-600 text-white font-semibold flex items-center gap-1 shadow-sm">
                        <Eye className="w-3 h-3" /> Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-slate-900/80 text-white font-medium flex items-center gap-1 shadow-sm">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </Badge>
                    )}

                    {isBlob && (
                      <Badge className="text-[9px] bg-purple-600 text-white font-medium shadow-xs">
                        Blob
                      </Badge>
                    )}
                    {isPoster && (
                      <Badge className="text-[9px] bg-indigo-600 text-white font-medium shadow-xs">
                        Poster
                      </Badge>
                    )}
                  </div>

                  {/* Quick Toggle Hover Banner */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-semibold text-white bg-black/70 px-3 py-1.5 rounded-full backdrop-blur-xs">
                      {item.active ? "Click to Hide" : "Click to Display"}
                    </span>
                  </div>
                </div>

                {/* Card Meta & Caption Editor */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 truncate mb-1" title={item.filename}>
                      {item.filename}
                    </div>
                    <Input
                      value={item.alt}
                      onChange={(e) => handleAltChange(src, e.target.value)}
                      placeholder="Photo caption or description..."
                      className="text-xs h-7"
                      disabled={!canUpdate}
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => canUpdate && handleToggle(src)}
                      className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        item.active ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {item.active ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                      {item.active ? "Included" : "Excluded"}
                    </button>

                    <Link
                      href={src}
                      target="_blank"
                      className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                      title="Open full image"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600">
          <div>
            Showing <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> of <strong>{filteredKeys.length}</strong> photos
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={safeCurrentPage === 1}
              className="text-xs h-8"
            >
              First
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="text-xs h-8 gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </Button>

            <span className="px-3 text-xs font-semibold text-slate-800">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="text-xs h-8 gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="text-xs h-8"
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

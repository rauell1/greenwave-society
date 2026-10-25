"use client";

import { useState } from "react";
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
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { CuratedGalleryItem } from "@/lib/cms/gallery";

interface GalleryManagerProps {
  initialCurated: CuratedGalleryItem[];
  available: { src: string; filename: string }[];
  canUpdate: boolean;
}

export default function GalleryManager({
  initialCurated,
  available,
  canUpdate,
}: GalleryManagerProps) {
  // Build a unified map of all available photos with their curation state
  const initialMap: Record<string, CuratedGalleryItem> = {};
  
  // Fill from available
  for (const item of available) {
    const existing = initialCurated.find((c) => c.src === item.src);
    initialMap[item.src] = {
      src: item.src,
      alt: existing?.alt || item.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      caption: existing?.caption || "",
      active: existing ? existing.active !== false : false,
    };
  }

  // Also include any items in initialCurated that might not be in available
  for (const item of initialCurated) {
    if (!initialMap[item.src]) {
      initialMap[item.src] = { ...item };
    }
  }

  const [items, setItems] = useState<Record<string, CuratedGalleryItem>>(initialMap);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "inactive">("all");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const allKeys = Object.keys(items);
  const activeCount = allKeys.filter((k) => items[k].active).length;

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

  const handleSelectAll = () => {
    setItems((prev) => {
      const next: Record<string, CuratedGalleryItem> = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = { ...v, active: true };
      }
      return next;
    });
  };

  const handleDeselectAll = () => {
    setItems((prev) => {
      const next: Record<string, CuratedGalleryItem> = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = { ...v, active: false };
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
      const payload = Object.values(items);
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: payload }),
      });
      if (!res.ok) {
        throw new Error("Failed to save gallery selection");
      }
      setNotification({ type: "success", message: `Public gallery updated! ${activeCount} photos active on /gallery.` });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ type: "error", message: String(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredKeys = allKeys.filter((k) => {
    const item = items[k];
    const matchesSearch =
      k.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alt.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === "active") return item.active;
    if (filterMode === "inactive") return !item.active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Images className="w-5 h-5 text-emerald-600" /> Curated Photo Gallery
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select photos to feature on the public <Link href="/gallery" target="_blank" className="text-emerald-600 underline font-semibold">/gallery</Link> page. Currently displaying <strong>{activeCount}</strong> of {allKeys.length} available photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={!canUpdate || isSaving}
            className="text-xs gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" /> Select All
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={!canUpdate || isSaving}
            className="text-xs gap-1.5"
          >
            <Square className="w-3.5 h-3.5" /> Deselect All
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!canUpdate || isSaving}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
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
              <ExternalLink className="w-3.5 h-3.5" /> View Public Page
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search photos by filename or alt text..."
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-stretch sm:self-auto">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All ({allKeys.length})
          </button>
          <button
            onClick={() => setFilterMode("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "active" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Active on /gallery ({activeCount})
          </button>
          <button
            onClick={() => setFilterMode("inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "inactive" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Hidden ({allKeys.length - activeCount})
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredKeys.map((src) => {
          const item = items[src];
          const filename = src.replace(/^\/images\//, "");

          return (
            <div
              key={src}
              className={`flex flex-col rounded-2xl bg-white border overflow-hidden transition-all shadow-xs ${
                item.active ? "border-emerald-500/60 ring-2 ring-emerald-500/10" : "border-slate-200 opacity-70 hover:opacity-100"
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
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Active Badge */}
                <div className="absolute top-2.5 left-2.5">
                  {item.active ? (
                    <Badge className="text-[10px] bg-emerald-600 text-white font-semibold flex items-center gap-1 shadow-sm">
                      <Eye className="w-3 h-3" /> Live in Gallery
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-slate-900/80 text-white font-medium flex items-center gap-1 shadow-sm">
                      <EyeOff className="w-3 h-3" /> Hidden
                    </Badge>
                  )}
                </div>

                {/* Quick Toggle Button on Hover */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    {item.active ? "Click to Hide" : "Click to Display"}
                  </span>
                </div>
              </div>

              {/* Card Meta & Caption Editor */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 truncate mb-1" title={filename}>
                    {filename}
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
                    {item.active ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
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
    </div>
  );
}

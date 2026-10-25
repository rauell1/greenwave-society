"use client";

import { CONTENT_TYPES, contentInputSchema } from "@/lib/cms/content";
import { IMPACT_STATS } from "@/config/app.config";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  Minus,
  Eye,
  Edit3,
  Smartphone,
  Monitor,
  ExternalLink,
  Search,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Item = {
  id: string;
  type: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body?: string;
  metadata?: string | null;
  status: string;
  version: number;
  updatedAt: string;
};

type Capabilities = {
  create: boolean;
  update: boolean;
  review: boolean;
  publish: boolean;
  archive: boolean;
};

const empty = {
  type: "news",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  status: "draft",
};

export default function ContentManager({
  capabilities,
  typeFilter,
  title = "Editorial Content",
}: {
  capabilities: Capabilities;
  typeFilter?: "program";
  title?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState({ ...empty, type: typeFilter ?? empty.type });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [activity, setActivity] = useState({ date: "", category: "Community", mediaUrl: "/gallery" });
  const [impact, setImpact] = useState<Record<keyof typeof IMPACT_STATS, number>>({ ...IMPACT_STATS });
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);

  // Interactive View Modes: "edit" vs "preview"
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [sidebarFilter, setSidebarFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(
      typeFilter ? `/api/admin/content?type=${typeFilter}` : "/api/admin/content",
      { cache: "no-store" }
    );
    if (response.ok) {
      setItems((await response.json()).items);
    }
  }, [typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function choose(item: Item) {
    const response = await fetch(`/api/admin/content/${item.id}`, { cache: "no-store" });
    if (!response.ok) return setMessage("Unable to load this entry.");
    const full = (await response.json()).item as Item;
    setSelected(full);
    let stored: Record<string, unknown> | null = null;
    try {
      stored = full.metadata ? JSON.parse(full.metadata) : null;
    } catch {
      // Non-fatal if metadata is unstructured
    }
    setMetadata(stored);
    setActivity({
      date: String(stored?.date ?? ""),
      category: String(stored?.category ?? "Community"),
      mediaUrl: String(stored?.mediaUrl ?? "/gallery"),
    });
    setImpact(
      Object.fromEntries(
        Object.entries(IMPACT_STATS).map(([key, value]) => [key, Number(stored?.[key] ?? value)])
      ) as typeof impact
    );
    setForm({
      type: full.type,
      slug: full.slug,
      title: full.title,
      excerpt: full.excerpt || "",
      body: full.body || "",
      status: full.status === "review" ? "review" : "draft",
    });
    setMessage("");
  }

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        metadata: form.type === "activity" ? activity : form.type === "impact" ? impact : metadata,
      };
      const validation = contentInputSchema.safeParse(payload);
      if (!validation.success) {
        return setMessage(validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      }
      const response = await fetch(selected ? `/api/admin/content/${selected.id}` : "/api/admin/content", {
        method: selected ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return setMessage(data.error || "Unable to save content.");
      }
      setMessage(selected ? "New revision saved." : "Draft created successfully.");
      await load();
      await choose(data.item);
    } catch {
      setMessage("Unable to save content. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: "review" | "published" | "archived") {
    if (!selected) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/content/${selected.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return setMessage("Unable to change status.");
      setMessage(`Content moved to ${status}.`);
      await load();
      await choose((await response.json()).item);
    } catch {
      setMessage("Unable to change status. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Interactive Markdown Insertion Helper
  function insertMarkdown(before: string, after = "", defaultText = "") {
    const textarea = document.getElementById("content-body-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = form.body;
    const selectedText = current.substring(start, end) || defaultText;
    const replacement = before + selectedText + after;
    const updated = current.substring(0, start) + replacement + current.substring(end);
    setForm((prev) => ({ ...prev, body: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  }

  // Word count & reading time calculation
  const wordCount = useMemo(() => {
    return form.body.trim().split(/\s+/).filter(Boolean).length;
  }, [form.body]);

  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Filtered sidebar items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (sidebarFilter !== "all" && item.type !== sidebarFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSlug = item.slug.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug) return false;
      }
      return true;
    });
  }, [items, sidebarFilter, searchQuery]);

  const canSave = selected ? capabilities.update : capabilities.create;

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      {/* Sidebar Content Navigator */}
      <aside className="rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 text-base">{title}</h1>
              <p className="text-xs text-slate-500">Drafts & published entries</p>
            </div>
            {capabilities.create && (
              <Button
                size="sm"
                onClick={() => {
                  setSelected(null);
                  setForm({ ...empty, type: typeFilter ?? empty.type });
                  setMetadata(null);
                  setActivity({ date: "", category: "Community", mediaUrl: "/gallery" });
                  setImpact({ ...IMPACT_STATS });
                  setMessage("");
                  setActiveTab("edit");
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-3 rounded-lg font-semibold"
              >
                + New
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories & pages..."
              className="pl-8 text-xs h-8 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            {["all", "page", "program", "news", "story", "impact"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSidebarFilter(t)}
                className={`px-2.5 py-0.5 rounded-full capitalize font-semibold whitespace-nowrap transition-colors ${
                  sidebarFilter === t
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content Item List */}
        <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No entries found. Click <strong>+ New</strong> to create one.
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => void choose(item)}
                className={`w-full p-3.5 text-left transition-colors flex flex-col gap-1 hover:bg-slate-50 ${
                  selected?.id === item.id ? "bg-emerald-50/60 border-l-4 border-emerald-600" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-900 line-clamp-1">{item.title}</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase px-1.5 py-0 font-mono tracking-wider ${
                      item.status === "published"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : item.status === "review"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize">{item.type} &bull; /{item.slug}</span>
                  <span>v{item.version}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Editor & Live Preview Panel */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col space-y-6">
        
        {/* Header with Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                {selected ? `Edit: ${selected.title}` : "Create New Content"}
              </h2>
              {selected?.status === "published" && (
                <a
                  href={`/news/${selected.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded-full"
                  title="View published article on website"
                >
                  <ExternalLink className="w-3 h-3" /> Live
                </a>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Articles and stories appear in News. Activities and impact statistics update the homepage and impact tracker.
            </p>
          </div>

          {/* Interactive Edit vs Preview Switcher */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "edit"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> Write Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "preview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" /> Live Visual Preview
            </button>
          </div>
        </div>

        {/* Tab 1: Edit Mode */}
        {activeTab === "edit" && (
          <div className="space-y-5">
            {/* Type & Slug */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  Content Type
                </label>
                <select
                  disabled={Boolean(typeFilter)}
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                      ...(e.target.value === "impact"
                        ? { slug: "impact-stats", title: "Our impact", body: "Current impact figures" }
                        : {}),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-800 disabled:bg-slate-50 focus:border-emerald-500 focus:outline-none"
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type[0].toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  URL Slug
                </label>
                <Input
                  disabled={form.type === "impact"}
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  placeholder="e.g. empower360-graduation-highlights"
                  className="rounded-xl text-xs h-10 border-slate-200"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Headline / Title *
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Give your story a compelling title..."
                className="rounded-xl text-sm font-semibold h-11 border-slate-200"
              />
            </div>

            {/* Summary / Excerpt */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Short Summary (Search & Social Preview)
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                placeholder="A concise 1-2 sentence synopsis for social previews and listing cards..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Activity Metadata if Activity */}
            {form.type === "activity" && (
              <fieldset className="grid gap-3 sm:grid-cols-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <legend className="text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
                  Activity Details
                </legend>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white"
                    value={activity.date}
                    onChange={(e) => setActivity({ ...activity, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Category</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white"
                    value={activity.category}
                    onChange={(e) => setActivity({ ...activity, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Media Link</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white"
                    value={activity.mediaUrl}
                    onChange={(e) => setActivity({ ...activity, mediaUrl: e.target.value })}
                  />
                </div>
              </fieldset>
            )}

            {/* Impact stats if Impact */}
            {form.type === "impact" && (
              <fieldset className="grid gap-3 sm:grid-cols-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <legend className="text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
                  Live Impact Metrics
                </legend>
                {Object.keys(IMPACT_STATS).map((key) => (
                  <div key={key}>
                    <label className="text-xs text-slate-600 block mb-1">
                      {
                        ({
                          youthReached: "Youth empowered",
                          communitiesServed: "Communities served",
                          treesPlanted: "Trees planted",
                          eventsOrganized: "Events organised",
                          workshopsDelivered: "Workshops delivered",
                          wasteRecycled: "Waste recycled (tons)",
                        } as any)[key]
                      }
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={key === "wasteRecycled" ? "0.1" : "1"}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white"
                      value={impact[key as keyof typeof IMPACT_STATS]}
                      onChange={(e) =>
                        setImpact({ ...impact, [key]: Number(e.target.value) })
                      }
                    />
                  </div>
                ))}
              </fieldset>
            )}

            {/* Interactive Body Editor with Markdown Toolbar */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Article Body (Markdown Supported) *
                </label>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{wordCount} words</span>
                  <span>&bull;</span>
                  <span>~{readTimeMin} min read</span>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**", "bold text")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Bold (**text**)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*", "italic text")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Italic (*text*)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n## ", "\n", "Heading 2")}
                  className="p-1.5 rounded hover:bg-white transition-colors font-bold text-xs"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n### ", "\n", "Heading 3")}
                  className="p-1.5 rounded hover:bg-white transition-colors font-bold text-xs"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n> ", "\n", "Quote text")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n- ", "\n", "Bullet point")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Bullet list"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n1. ", "\n", "Numbered point")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Numbered list"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](https://example.com)", "link title")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Insert Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("![Image description](", ")", "/images/20260827_135241.jpg")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Insert Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("\n---\n", "", "")}
                  className="p-1.5 rounded hover:bg-white transition-colors"
                  title="Horizontal line"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="ml-auto text-[10px] text-slate-500 font-mono pr-1 hidden sm:block">
                  Markdown Enabled
                </div>
              </div>

              <textarea
                id="content-body-textarea"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={16}
                placeholder="Write your article content in Markdown here..."
                className="w-full rounded-2xl border border-slate-200 p-4 font-mono text-xs leading-relaxed focus:border-emerald-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Live Visual Preview Mode */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            {/* Viewport Toolbar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">Device Viewport:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewViewport === "desktop"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewViewport === "mobile"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div
              className={`transition-all duration-300 ${
                previewViewport === "mobile"
                  ? "max-w-[400px] mx-auto border-2 border-slate-300 rounded-3xl p-6 bg-white shadow-xl min-h-[500px]"
                  : "w-full border border-slate-200 rounded-2xl p-8 bg-white shadow-xs"
              }`}
            >
              {/* Story Header */}
              <div className="border-b border-slate-100 pb-5 mb-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-mono tracking-wider border-none">
                    {form.type}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date().toLocaleDateString("en-KE", { dateStyle: "long" })}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight leading-tight">
                  {form.title || "Untitled Article"}
                </h1>
                {form.excerpt && (
                  <p className="text-sm text-slate-500 italic leading-relaxed">
                    {form.excerpt}
                  </p>
                )}
              </div>

              {/* Formatted Markdown Body */}
              <div className="text-slate-800 space-y-3">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold font-serif my-4 text-slate-900">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold font-serif mt-6 mb-3 text-slate-900 border-b pb-1">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold font-serif mt-4 mb-2 text-slate-900">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed text-slate-700 my-2">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 my-2 space-y-1 text-sm text-slate-700">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 my-2 space-y-1 text-sm text-slate-700">{children}</ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 my-3 italic text-slate-600 bg-emerald-50/40 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 underline font-medium hover:text-emerald-800"
                      >
                        {children}
                      </a>
                    ),
                    img: ({ src, alt }) => (
                      <img
                        src={src}
                        alt={alt}
                        className="my-4 rounded-xl max-h-96 w-full object-cover shadow-sm border border-slate-200"
                      />
                    ),
                    hr: () => <hr className="my-6 border-slate-200" />,
                  }}
                >
                  {form.body || "*No article body content yet. Switch to Write Mode to add content.*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold ${
              message.includes("saved") || message.includes("created") || message.includes("moved")
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            role="status"
          >
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
          {canSave && (
            <Button
              type="button"
              disabled={busy || !form.title || !form.slug || !form.body}
              onClick={() => void save()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs h-10 px-5 font-semibold shadow-xs"
            >
              {busy ? "Saving..." : selected ? "Save Revision" : "Create Story"}
            </Button>
          )}

          {selected && capabilities.review && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void changeStatus("review")}
              className="rounded-xl text-xs h-10 border-slate-200"
            >
              Send to Review
            </Button>
          )}

          {selected && capabilities.publish && (
            <Button
              type="button"
              disabled={busy}
              onClick={() => void changeStatus("published")}
              className="rounded-xl text-xs h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            >
              Publish to Website
            </Button>
          )}

          {selected && capabilities.archive && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void changeStatus("archived")}
              className="rounded-xl text-xs h-10 border-red-200 text-red-700 hover:bg-red-50"
            >
              Archive
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

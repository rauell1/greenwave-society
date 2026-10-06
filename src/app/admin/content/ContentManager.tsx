"use client";

import { CONTENT_TYPES, contentInputSchema } from "@/lib/cms/content";
import { IMPACT_STATS } from "@/config/app.config";
import { useCallback, useEffect, useState } from "react";

type Item = { id: string; type: string; slug: string; title: string; excerpt: string | null; body?: string; metadata?: string | null; status: string; version: number; updatedAt: string };
type Capabilities = { create: boolean; update: boolean; review: boolean; publish: boolean; archive: boolean };
const empty = { type: "page", slug: "", title: "", excerpt: "", body: "", status: "draft" };

export default function ContentManager({ capabilities, typeFilter, title = "Content" }: { capabilities: Capabilities; typeFilter?: "program"; title?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState({ ...empty, type: typeFilter ?? empty.type });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [activity, setActivity] = useState({ date: "", category: "Community", mediaUrl: "/gallery" });
  const [impact, setImpact] = useState<Record<keyof typeof IMPACT_STATS, number>>({ ...IMPACT_STATS });
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(typeFilter ? `/api/admin/content?type=${typeFilter}` : "/api/admin/content", { cache: "no-store" });
    if (response.ok) setItems((await response.json()).items);
  }, [typeFilter]);
  useEffect(() => { void load(); }, [load]);

  async function choose(item: Item) {
    const response = await fetch(`/api/admin/content/${item.id}`, { cache: "no-store" });
    if (!response.ok) return setMessage("Unable to load this entry.");
    const full = (await response.json()).item as Item;
    setSelected(full);
    let stored: Record<string, unknown> | null = null;
    try { stored = full.metadata ? JSON.parse(full.metadata) : null; } catch { /* Older entries may lack structured metadata. */ }
    setMetadata(stored);
    setActivity({ date: String(stored?.date ?? ""), category: String(stored?.category ?? "Community"), mediaUrl: String(stored?.mediaUrl ?? "/gallery") });
    setImpact(Object.fromEntries(Object.entries(IMPACT_STATS).map(([key, value]) => [key, Number(stored?.[key] ?? value)])) as typeof impact);
    setForm({ type: full.type, slug: full.slug, title: full.title, excerpt: full.excerpt || "", body: full.body || "", status: full.status === "review" ? "review" : "draft" });
    setMessage("");
  }

  async function save() {
    setBusy(true); setMessage("");
    try {
    const payload = { ...form, metadata: form.type === "activity" ? activity : form.type === "impact" ? impact : metadata };
    const validation = contentInputSchema.safeParse(payload);
    if (!validation.success) return setMessage(validation.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; "));
    const response = await fetch(selected ? `/api/admin/content/${selected.id}` : "/api/admin/content", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Unable to save content.");
    setMessage(selected ? "New revision saved." : "Draft created.");
    await load();
    await choose(data.item);
    } catch {
      setMessage("Unable to save content. Please try again.");
    } finally { setBusy(false); }
  }

  async function changeStatus(status: "review" | "published" | "archived") {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
    const response = await fetch(`/api/admin/content/${selected.id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) return setMessage("Unable to change status.");
    setMessage(`Content moved to ${status}.`);
    await load();
    await choose((await response.json()).item);
    } catch {
      setMessage("Unable to change status. Please try again.");
    } finally { setBusy(false); }
  }

  const canSave = selected ? capabilities.update : capabilities.create;
  return <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
    <aside className="rounded-xl border border-emerald-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4"><div><h1 className="font-semibold text-slate-900">{title}</h1><p className="text-xs text-slate-500">Drafts and published entries</p></div>{capabilities.create && <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white" onClick={() => { setSelected(null); setForm({ ...empty, type: typeFilter ?? empty.type }); setMetadata(null); setActivity({ date: "", category: "Community", mediaUrl: "/gallery" }); setImpact({ ...IMPACT_STATS }); setMessage(""); }}>New</button>}</div>
      <div className="max-h-[70vh] divide-y overflow-auto">{items.length === 0 ? <p className="p-6 text-sm text-slate-500">No CMS entries yet. Existing website content remains active.</p> : items.map(item => <button key={item.id} onClick={() => void choose(item)} className={`block w-full p-4 text-left hover:bg-emerald-50 ${selected?.id === item.id ? "bg-emerald-50" : ""}`}><div className="flex justify-between gap-2"><span className="font-medium text-slate-900">{item.title}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase text-slate-600">{item.status}</span></div><p className="mt-1 text-xs text-slate-500">{item.type} · /{item.slug} · v{item.version}</p></button>)}</div>
    </aside>
    <section className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="mb-6"><h2 className="text-xl font-semibold text-slate-900">{selected ? `Edit ${selected.title}` : "Create content"}</h2><p className="text-sm text-slate-500">Published news, articles, stories and announcements appear in News. Published activities and impact figures update the homepage and Impact page.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Type<select disabled={Boolean(typeFilter)} value={form.type} onChange={e => setForm({ ...form, type: e.target.value, ...(e.target.value === "impact" ? { slug: "impact-stats", title: "Our impact", body: "Current impact figures" } : {}) })} className="mt-1 w-full rounded-lg border p-2.5 disabled:bg-slate-50">{CONTENT_TYPES.map(type => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Slug<input disabled={form.type === "impact"} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="mt-1 w-full rounded-lg border p-2.5" placeholder="about-us" /></label>
      </div>
      {form.type === "activity" && <fieldset className="mt-4 grid gap-4 sm:grid-cols-3"><legend className="mb-2 text-sm font-semibold">Activity details</legend><label className="text-sm">Date<input type="date" className="mt-1 w-full rounded-lg border p-2.5" value={activity.date} onChange={e => setActivity({ ...activity, date: e.target.value })} /></label><label className="text-sm">Category<input className="mt-1 w-full rounded-lg border p-2.5" value={activity.category} onChange={e => setActivity({ ...activity, category: e.target.value })} /></label><label className="text-sm">Media link<input className="mt-1 w-full rounded-lg border p-2.5" value={activity.mediaUrl} onChange={e => setActivity({ ...activity, mediaUrl: e.target.value })} /></label></fieldset>}
      {form.type === "impact" && <fieldset className="mt-4 grid gap-4 sm:grid-cols-2"><legend className="mb-2 text-sm font-semibold">Impact figures</legend>{Object.keys(IMPACT_STATS).map(key => <label key={key} className="text-sm">{({ youthReached: "Youth empowered", communitiesServed: "Communities served", treesPlanted: "Trees planted", eventsOrganized: "Events organised", workshopsDelivered: "Workshops delivered", wasteRecycled: "Waste recycled (tons)" })[key as keyof typeof IMPACT_STATS]}<input type="number" min="0" step={key === "wasteRecycled" ? "0.1" : "1"} className="mt-1 w-full rounded-lg border p-2.5" value={impact[key as keyof typeof IMPACT_STATS]} onChange={e => setImpact({ ...impact, [key]: Number(e.target.value) })} /></label>)}</fieldset>}
      <label className="mt-4 block text-sm font-medium text-slate-700">Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border p-2.5" /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700">Summary<textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border p-2.5" /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700">Body<textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={16} className="mt-1 w-full rounded-lg border p-3 font-mono text-sm" /></label>
      {message && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700" role="status">{message}</p>}
      <div className="mt-6 flex flex-wrap gap-2">{canSave && <button disabled={busy || !form.title || !form.slug || !form.body} onClick={() => void save()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Working…" : "Save revision"}</button>}{selected && capabilities.review && <button disabled={busy} onClick={() => void changeStatus("review")} className="rounded-lg border px-4 py-2 text-sm">Send to review</button>}{selected && capabilities.publish && <button disabled={busy} onClick={() => void changeStatus("published")} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Publish</button>}{selected && capabilities.archive && <button disabled={busy} onClick={() => void changeStatus("archived")} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">Archive</button>}</div>
    </section>
  </div>;
}

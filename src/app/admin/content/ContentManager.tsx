"use client";

import { useCallback, useEffect, useState } from "react";

type Item = { id: string; type: string; slug: string; title: string; excerpt: string | null; body?: string; status: string; version: number; updatedAt: string };
type Capabilities = { create: boolean; update: boolean; review: boolean; publish: boolean; archive: boolean };
const empty = { type: "page", slug: "", title: "", excerpt: "", body: "", status: "draft" };

export default function ContentManager({ capabilities, typeFilter, title = "Content" }: { capabilities: Capabilities; typeFilter?: "program"; title?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState({ ...empty, type: typeFilter ?? empty.type });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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
    setForm({ type: full.type, slug: full.slug, title: full.title, excerpt: full.excerpt || "", body: full.body || "", status: full.status === "review" ? "review" : "draft" });
    setMessage("");
  }

  async function save() {
    setBusy(true); setMessage("");
    const response = await fetch(selected ? `/api/admin/content/${selected.id}` : "/api/admin/content", { method: selected ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(data.error || "Unable to save content.");
    setMessage(selected ? "New revision saved." : "Draft created.");
    await load();
    await choose(data.item);
  }

  async function changeStatus(status: "review" | "published" | "archived") {
    if (!selected) return;
    setBusy(true); setMessage("");
    const response = await fetch(`/api/admin/content/${selected.id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(false);
    if (!response.ok) return setMessage("Unable to change status.");
    setMessage(`Content moved to ${status}.`);
    await load();
    await choose((await response.json()).item);
  }

  const canSave = selected ? capabilities.update : capabilities.create;
  return <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
    <aside className="rounded-xl border border-emerald-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4"><div><h1 className="font-semibold text-slate-900">{title}</h1><p className="text-xs text-slate-500">Drafts and published entries</p></div>{capabilities.create && <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white" onClick={() => { setSelected(null); setForm({ ...empty, type: typeFilter ?? empty.type }); setMessage(""); }}>New</button>}</div>
      <div className="max-h-[70vh] divide-y overflow-auto">{items.length === 0 ? <p className="p-6 text-sm text-slate-500">No CMS entries yet. Existing website content remains active.</p> : items.map(item => <button key={item.id} onClick={() => void choose(item)} className={`block w-full p-4 text-left hover:bg-emerald-50 ${selected?.id === item.id ? "bg-emerald-50" : ""}`}><div className="flex justify-between gap-2"><span className="font-medium text-slate-900">{item.title}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase text-slate-600">{item.status}</span></div><p className="mt-1 text-xs text-slate-500">{item.type} · /{item.slug} · v{item.version}</p></button>)}</div>
    </aside>
    <section className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="mb-6"><h2 className="text-xl font-semibold text-slate-900">{selected ? `Edit ${selected.title}` : "Create content"}</h2><p className="text-sm text-slate-500">Publishing does not replace public page content until a public section is explicitly connected.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Type<select disabled={Boolean(typeFilter)} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border p-2.5 disabled:bg-slate-50"><option value="page">Page</option><option value="program">Program</option><option value="story">Story</option><option value="announcement">Announcement</option></select></label>
        <label className="text-sm font-medium text-slate-700">Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="mt-1 w-full rounded-lg border p-2.5" placeholder="about-us" /></label>
      </div>
      <label className="mt-4 block text-sm font-medium text-slate-700">Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border p-2.5" /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700">Summary<textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border p-2.5" /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700">Body<textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={16} className="mt-1 w-full rounded-lg border p-3 font-mono text-sm" /></label>
      {message && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700" role="status">{message}</p>}
      <div className="mt-6 flex flex-wrap gap-2">{canSave && <button disabled={busy || !form.title || !form.slug || !form.body} onClick={() => void save()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Working…" : "Save revision"}</button>}{selected && capabilities.review && <button disabled={busy} onClick={() => void changeStatus("review")} className="rounded-lg border px-4 py-2 text-sm">Send to review</button>}{selected && capabilities.publish && <button disabled={busy} onClick={() => void changeStatus("published")} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Publish</button>}{selected && capabilities.archive && <button disabled={busy} onClick={() => void changeStatus("archived")} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">Archive</button>}</div>
    </section>
  </div>;
}

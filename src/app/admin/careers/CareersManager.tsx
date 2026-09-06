"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Download, Search, Star, Users } from "lucide-react";

const STAGES = ["new", "reviewing", "shortlisted", "interview", "accepted", "rejected"] as const;
const PAGE_SIZE = 10;
type Role = { slug: string; title: string; isOpen: boolean };
type Application = {
  id: string; reference: string; roleSlug: string; roleTitle: string; fullName: string; email: string; phone: string;
  location: string; availability: string; motivation: string; relevantExperience: string; collaborationStyle: string;
  roleResponse: string; portfolioUrl: string | null; status: string; internalNotes: string | null; rating: number | null;
  assignedReviewer: string | null; reviewedAt: string | null; reviewedBy: string | null; createdAt: string; updatedAt: string;
  candidateEmailSubject: string; candidateEmailBody: string; teamEmailSubject: string; teamEmailBody: string;
};

export default function CareersManager({ initialApplications, capabilities }: { initialApplications: Application[]; capabilities: { review: boolean; export: boolean; manage: boolean } }) {
  const [applications, setApplications] = useState(initialApplications);
  const [roles, setRoles] = useState<Role[]>([]);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [openApplication, setOpenApplication] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { void fetch("/api/admin/careers/roles").then(async (response) => { const data = await response.json(); setRoles(data.roles ?? []); if (!response.ok) setMessage(data.error); }); }, []);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return applications.filter((item) => (!needle || [item.fullName, item.email, item.phone, item.location, item.reference].some((value) => value.toLowerCase().includes(needle))) && (roleFilter === "all" || item.roleSlug === roleFilter) && (statusFilter === "all" || item.status === statusFilter) && (!dateFilter || item.createdAt.slice(0, 10) === dateFilter));
  }, [applications, deferredQuery, roleFilter, statusFilter, dateFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const counts = useMemo(() => Object.fromEntries(STAGES.map((stage) => [stage, applications.filter((item) => item.status === stage).length])), [applications]);

  async function toggleRole(role: Role) {
    if (!confirm(`${role.isOpen ? "Close" : "Open"} ${role.title}?`)) return;
    const response = await fetch("/api/admin/careers/roles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: role.slug, isOpen: !role.isOpen }) });
    const data = await response.json(); setMessage(response.ok ? `${role.title} is now ${!role.isOpen ? "open" : "closed"}.` : data.error);
    if (response.ok) setRoles((current) => current.map((item) => item.slug === role.slug ? { ...item, isOpen: !item.isOpen } : item));
  }

  async function updateApplication(id: string, change: Partial<Pick<Application, "status" | "internalNotes" | "assignedReviewer" | "rating">>) {
    setSaving(id); setMessage("");
    const response = await fetch(`/api/admin/careers/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(change) });
    const data = await response.json();
    if (response.ok) { setApplications((current) => current.map((item) => item.id === id ? data.application : item)); setMessage("Application updated."); } else setMessage(data.error);
    setSaving(null);
  }

  async function bulkUpdate(status: string) {
    if (!selected.length || !confirm(`Move ${selected.length} selected application${selected.length === 1 ? "" : "s"} to ${status}?`)) return;
    const response = await fetch("/api/admin/careers/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selected, status }) });
    const data = await response.json();
    if (response.ok) { setApplications((current) => current.map((item) => selected.includes(item.id) ? { ...item, status } : item)); setSelected([]); setMessage(`${data.updated} applications updated.`); } else setMessage(data.error);
  }

  function resetFilters() { setQuery(""); setRoleFilter("all"); setStatusFilter("all"); setDateFilter(""); setPage(1); }

  return <div className="space-y-6">
    {message && <p role="status" aria-live="polite" className="rounded-lg border bg-white p-3 text-sm text-slate-700">{message}</p>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{STAGES.map((stage) => <button key={stage} onClick={() => { setStatusFilter(stage); setPage(1); }} className={`rounded-xl border bg-white p-4 text-left transition ${statusFilter === stage ? "border-emerald-500 ring-2 ring-emerald-100" : "hover:border-emerald-300"}`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stage}</p><p className="mt-2 text-2xl font-bold">{counts[stage]}</p></button>)}</section>

    <section className="rounded-xl border bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Applications</h2><p className="mt-1 text-sm text-slate-500">Search, review, assign, rate, and progress every candidate.</p></div><div className="flex items-center gap-2">{capabilities.export && <a href="/api/admin/careers/export" className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-800"><Download className="h-4 w-4" /> Export Excel</a>}<span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"><Users className="h-4 w-4" /> {applications.length}</span></div></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_180px_170px_auto]">
        <label className="relative"><span className="sr-only">Search applications</span><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search candidates or references" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" /></label>
        <select aria-label="Filter by role" value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm"><option value="all">All roles</option>{roles.map((role) => <option key={role.slug} value={role.slug}>{role.title}</option>)}</select>
        <select aria-label="Filter by stage" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm"><option value="all">All stages</option>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select>
        <input aria-label="Filter by submission date" type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={resetFilters} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Clear</button>
      </div>
      {capabilities.review && selected.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3"><span className="text-sm font-medium">{selected.length} selected</span><select aria-label="Bulk change stage" defaultValue="" onChange={(event) => { if (event.target.value) void bulkUpdate(event.target.value); event.target.value = ""; }} className="rounded-lg border px-3 py-2 text-sm"><option value="" disabled>Move to…</option>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select><button onClick={() => setSelected([])} className="text-sm text-slate-600">Clear selection</button></div>}
      <div className="mt-4 overflow-hidden rounded-xl border">{visible.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-500">No applications match these filters.</div> : <div className="divide-y">{visible.map((application) => <ApplicationCard key={application.id} application={application} expanded={openApplication === application.id} selected={selected.includes(application.id)} canReview={capabilities.review} saving={saving === application.id} onToggle={() => setOpenApplication((current) => current === application.id ? null : application.id)} onSelect={(checked) => setSelected((current) => checked ? [...current, application.id] : current.filter((id) => id !== application.id))} onUpdate={(change) => void updateApplication(application.id, change)} />)}</div>}</div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500"><span>Showing {visible.length} of {filtered.length}</span><div className="flex items-center gap-2"><button disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><span>{safePage} / {pageCount}</span><button disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
    </section>

    {capabilities.manage && <section className="rounded-xl border bg-white p-4 sm:p-5"><h2 className="text-lg font-semibold">Role availability</h2><p className="mt-1 text-sm text-slate-500">Changes immediately affect the public application forms.</p><div className="mt-4 grid gap-3 lg:grid-cols-3">{roles.map((role) => <div key={role.slug} className="flex items-center justify-between gap-3 rounded-lg border p-4"><div><span className={`rounded-full px-2 py-1 text-xs font-bold ${role.isOpen ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{role.isOpen ? "Open" : "Closed"}</span><h3 className="mt-2 font-semibold">{role.title}</h3></div><button onClick={() => void toggleRole(role)} className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium">{role.isOpen ? "Close" : "Open"}</button></div>)}</div></section>}
  </div>;
}

function ApplicationCard({ application, expanded, selected, canReview, saving, onToggle, onSelect, onUpdate }: { application: Application; expanded: boolean; selected: boolean; canReview: boolean; saving: boolean; onToggle: () => void; onSelect: (checked: boolean) => void; onUpdate: (change: Partial<Pick<Application, "status" | "internalNotes" | "assignedReviewer" | "rating">>) => void }) {
  const [notes, setNotes] = useState(application.internalNotes ?? ""); const [reviewer, setReviewer] = useState(application.assignedReviewer ?? "");
  return <article><div className="flex items-start gap-3 p-4"><input aria-label={`Select ${application.fullName}`} type="checkbox" checked={selected} onChange={(event) => onSelect(event.target.checked)} disabled={!canReview} className="mt-1 h-4 w-4 rounded" /><button type="button" onClick={onToggle} aria-expanded={expanded} className="grid min-w-0 flex-1 gap-3 text-left sm:grid-cols-[minmax(180px,1fr)_minmax(200px,1.2fr)_150px_24px] sm:items-center"><div><p className="font-semibold">{application.fullName}</p><p className="truncate text-xs text-slate-500">{application.email}</p></div><div><p className="text-sm font-medium text-slate-700">{application.roleTitle}</p><p className="text-xs text-slate-500">{application.reference}</p></div><div><StageBadge stage={application.status} /><p className="mt-1 text-xs text-slate-500">{new Date(application.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}</p></div>{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></div>
    {expanded && <div className="border-t bg-slate-50 p-4 sm:p-5"><div className="grid gap-5 lg:grid-cols-2"><Detail label="Phone" value={application.phone} /><Detail label="Location" value={application.location} /><Detail label="Availability" value={application.availability} /><Detail label="Portfolio or profile" value={application.portfolioUrl} link /><Detail label="Why Greenwave Society?" value={application.motivation} wide /><Detail label="Relevant experience" value={application.relevantExperience} wide /><Detail label="Collaboration style" value={application.collaborationStyle} wide /><Detail label="Role-specific response" value={application.roleResponse} wide /></div>
      {canReview && <div className="mt-6 grid gap-4 rounded-xl border bg-white p-4 lg:grid-cols-[180px_180px_1fr_auto]"><label className="text-xs font-semibold">Stage<select value={application.status} onChange={(event) => onUpdate({ status: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal">{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label className="text-xs font-semibold">Rating<div className="mt-2 flex gap-1">{[1,2,3,4,5].map((rating) => <button key={rating} onClick={() => onUpdate({ rating })} aria-label={`Rate ${rating} stars`} className={rating <= (application.rating ?? 0) ? "text-amber-500" : "text-slate-300"}><Star className="h-5 w-5" fill="currentColor" /></button>)}</div></label><div className="grid gap-3"><label className="text-xs font-semibold">Assigned reviewer<input value={reviewer} onChange={(event) => setReviewer(event.target.value)} placeholder="Name or email" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" /></label><label className="text-xs font-semibold">Internal notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Private recruitment notes" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" /></label></div><button disabled={saving} onClick={() => onUpdate({ internalNotes: notes, assignedReviewer: reviewer })} className="self-end rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving…" : "Save notes"}</button></div>}
    </div>}
  </article>;
}

function StageBadge({ stage }: { stage: string }) { const colors: Record<string,string> = { new:"bg-blue-50 text-blue-700", reviewing:"bg-amber-50 text-amber-700", shortlisted:"bg-violet-50 text-violet-700", interview:"bg-cyan-50 text-cyan-700", accepted:"bg-emerald-50 text-emerald-700", rejected:"bg-red-50 text-red-700" }; return <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${colors[stage] ?? "bg-slate-100"}`}>{stage}</span>; }
function Detail({ label, value, wide = false, link = false }: { label: string; value: string | null; wide?: boolean; link?: boolean }) { return <div className={wide ? "lg:col-span-2" : ""}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>{link && value ? <a href={value} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-emerald-700 underline">{value}</a> : <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{value || "Not provided"}</p>}</div>; }

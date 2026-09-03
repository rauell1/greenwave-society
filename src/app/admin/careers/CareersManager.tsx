"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Download, Search, Users } from "lucide-react";

type Role = { slug: string; title: string; isOpen: boolean };
type Application = {
  id: string; reference: string; roleSlug: string; roleTitle: string; fullName: string;
  email: string; phone: string; location: string; availability: string; motivation: string;
  relevantExperience: string; collaborationStyle: string; roleResponse: string;
  portfolioUrl: string | null; status: string; createdAt: string;
  candidateEmailSubject: string; candidateEmailBody: string; teamEmailSubject: string; teamEmailBody: string;
};

export default function CareersManager({ initialApplications }: { initialApplications: Application[] }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openApplication, setOpenApplication] = useState<string | null>(null);

  async function loadRoles() {
    const response = await fetch("/api/admin/careers/roles");
    const data = await response.json();
    setRoles(data.roles ?? []);
    setMessage(response.ok ? "" : data.error);
  }

  useEffect(() => { void loadRoles(); }, []);

  const filteredApplications = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialApplications.filter((application) => {
      const matchesRole = roleFilter === "all" || application.roleSlug === roleFilter;
      const matchesQuery = !needle || [application.fullName, application.email, application.phone, application.location, application.reference]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesRole && matchesQuery;
    });
  }, [initialApplications, query, roleFilter]);

  async function toggle(role: Role) {
    const response = await fetch("/api/admin/careers/roles", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: role.slug, isOpen: !role.isOpen }),
    });
    const data = await response.json();
    setMessage(response.ok ? `${role.title} is now ${!role.isOpen ? "open" : "closed"}.` : data.error);
    if (response.ok) await loadRoles();
  }

  async function download() {
    const response = await fetch("/api/admin/careers/export", { headers: { "x-export-key": key } });
    if (!response.ok) { const data = await response.json(); setMessage(data.error); return; }
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "greenwave-careers-applications.xls"; anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {message && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm">{message}</p>}

      <section className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-lg font-semibold">Applications</h2><p className="mt-1 text-sm text-slate-500">View every application and open a candidate to read their complete responses.</p></div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"><Users className="h-4 w-4" /> {initialApplications.length} total</div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
          <label className="relative"><span className="sr-only">Search applications</span><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone, location, or reference" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" /></label>
          <label><span className="sr-only">Filter by role</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="all">All roles</option>{roles.map((role) => <option key={role.slug} value={role.slug}>{role.title}</option>)}</select></label>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border">
          {filteredApplications.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-500">No applications match the selected filters.</div> : (
            <div className="divide-y">{filteredApplications.map((application) => {
              const expanded = openApplication === application.id;
              return <article key={application.id}>
                <button type="button" onClick={() => setOpenApplication(expanded ? null : application.id)} aria-expanded={expanded} className="grid w-full gap-3 px-4 py-4 text-left hover:bg-slate-50 sm:grid-cols-[minmax(180px,1fr)_minmax(220px,1.2fr)_160px_24px] sm:items-center">
                  <div><p className="font-semibold text-slate-900">{application.fullName}</p><p className="text-xs text-slate-500">{application.email}</p></div>
                  <div><p className="text-sm font-medium text-slate-700">{application.roleTitle}</p><p className="text-xs text-slate-500">{application.reference}</p></div>
                  <div><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold capitalize text-blue-700">{application.status}</span><p className="mt-1 text-xs text-slate-500">{new Date(application.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {expanded && <div className="border-t bg-slate-50 px-5 py-5"><div className="grid gap-5 lg:grid-cols-2">
                  <Detail label="Phone" value={application.phone} /><Detail label="Location" value={application.location} />
                  <Detail label="Availability" value={application.availability} /><Detail label="Portfolio or profile" value={application.portfolioUrl} link />
                  <Detail label="Why Greenwave Society?" value={application.motivation} wide /><Detail label="Relevant experience" value={application.relevantExperience} wide />
                  <Detail label="Collaboration style" value={application.collaborationStyle} wide /><Detail label="Role-specific response" value={application.roleResponse} wide />
                </div></div>}
              </article>;
            })}</div>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5"><h2 className="text-lg font-semibold">Role availability</h2><div className="mt-4 grid gap-3">{roles.map((role) => <div key={role.slug} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"><div><span className={`rounded-full px-2 py-1 text-xs font-bold ${role.isOpen ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{role.isOpen ? "Open" : "Closed"}</span><h3 className="mt-2 font-semibold">{role.title}</h3></div><button onClick={() => void toggle(role)} className="rounded-lg border px-4 py-2 text-sm font-medium">{role.isOpen ? "Close role" : "Open role"}</button></div>)}</div></section>

      <section className="rounded-xl border bg-white p-5"><h2 className="text-lg font-semibold">Application workbook</h2><p className="mt-2 text-sm text-slate-500">Download one workbook with a separate sheet for each role.</p><input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Export password" className="mt-4 w-full max-w-md rounded-lg border px-3 py-2" /><div><button disabled={!key} onClick={() => void download()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Download className="h-4 w-4" /> Download Excel workbook</button></div></section>
    </div>
  );
}

function Detail({ label, value, wide = false, link = false }: { label: string; value: string | null; wide?: boolean; link?: boolean }) {
  return <div className={wide ? "lg:col-span-2" : ""}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>{link && value ? <a href={value} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-emerald-700 underline">{value}</a> : <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">{value || "Not provided"}</p>}</div>;
}

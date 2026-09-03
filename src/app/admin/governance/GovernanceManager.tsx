"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Signature = { id: string; status: string; token: string; signedAt: string | null; emailSentAt: string | null; versionId: string | null; versionTag: string };
type Leader = { id: string; name: string; role: string; email: string; signatures: Signature[] };
type Version = { id: string; versionTag: string; title: string; content: string; status: string; createdAt: string; publishedAt: string | null; signatures: { status: string; leaderId: string }[] };

const date = (value: string | null) => value ? new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—";

function Badge({ status }: { status: string }) {
  const style = status === "signed" || status === "published" ? "bg-emerald-50 text-emerald-700" : status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}>{status}</span>;
}

export default function GovernanceManager({ leaders, versions, canResetSignatures }: { leaders: Leader[]; versions: Version[]; canResetSignatures: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [showVersions, setShowVersions] = useState(false);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [versionTag, setVersionTag] = useState(`V${versions.length + 1}`);
  const [versionTitle, setVersionTitle] = useState("Executive Leadership Constitution");
  const [versionContent, setVersionContent] = useState("");
  const active = versions.find(version => version.status === "published");
  const rows = useMemo(() => leaders.map(leader => ({ leader, signature: active ? leader.signatures.find(item => item.versionId === active.id) : undefined })), [active, leaders]);
  const signed = rows.filter(row => row.signature?.status === "signed").length;
  const pending = rows.filter(row => !row.signature || row.signature.status === "pending").length;
  const declined = rows.filter(row => row.signature?.status === "rejected").length;

  async function act(id: string, request: () => Promise<Response>, success: string) {
    setBusyId(id); setMessage("");
    try {
      const response = await request();
      const data = await response.json().catch(() => ({}));
      setMessage(response.ok ? success : data.error ?? "The action could not be completed.");
      if (response.ok) startTransition(() => router.refresh());
    } catch { setMessage("A network error occurred. Please try again."); }
    finally { setBusyId(""); }
  }

  function exportCsv() {
    const lines = [["Leader", "Role", "Email", "Status", "Signed"], ...rows.map(({ leader, signature }) => [leader.name, leader.role, leader.email, signature?.status ?? "no invite", date(signature?.signedAt ?? null)])];
    const csv = lines.map(line => line.map(value => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "governance-signatures.csv"; link.click(); URL.revokeObjectURL(link.href);
  }

  async function createVersion() {
    if (!versionTag.trim() || !versionTitle.trim() || !versionContent.trim()) { setMessage("Version, title, and document content are required."); return; }
    setBusyId("new-version"); setMessage("");
    try {
      const response = await fetch("/api/admin/constitution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versionTag, title: versionTitle, content: versionContent, contentType: "html" }) });
      const data = await response.json().catch(() => ({}));
      setMessage(response.ok ? `${versionTag} saved as a draft.` : data.error ?? "The version could not be saved.");
      if (response.ok) { setShowNewVersion(false); setVersionContent(""); setShowVersions(true); startTransition(() => router.refresh()); }
    } catch { setMessage("A network error occurred. Please try again."); }
    finally { setBusyId(""); }
  }

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Executive committee</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">Governance</h1><p className="mt-1 text-sm text-slate-500">Track the active constitution and executive signatures.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => setShowNewVersion(value => !value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{showNewVersion ? "Cancel" : "New version"}</button><button onClick={() => setShowVersions(value => !value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{showVersions ? "Hide versions" : "View versions"}</button><button onClick={exportCsv} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">Export signatures</button></div>
    </header>

    {message ? <p role="status" className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}

    {showNewVersion ? <section className="rounded-xl border bg-white p-5"><div><h2 className="font-semibold text-slate-900">Create constitution version</h2><p className="mt-1 text-sm text-slate-500">Save it as a draft first. Publishing sends signature invitations.</p></div><div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]"><label className="text-sm font-medium text-slate-700">Version<input value={versionTag} onChange={event => setVersionTag(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-600" /></label><label className="text-sm font-medium text-slate-700">Title<input value={versionTitle} onChange={event => setVersionTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-600" /></label></div><label className="mt-4 block text-sm font-medium text-slate-700">Document content<textarea rows={10} value={versionContent} onChange={event => setVersionContent(event.target.value)} placeholder="Paste the constitution HTML or plain text…" className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-xs font-normal outline-none focus:border-emerald-600" /></label><div className="mt-4 flex justify-end"><button onClick={() => void createVersion()} disabled={busyId === "new-version"} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{busyId === "new-version" ? "Saving…" : "Save draft"}</button></div></section> : null}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border bg-white p-4"><p className="text-xs font-medium text-slate-500">Active version</p><p className="mt-2 text-xl font-semibold text-slate-950">{active?.versionTag ?? "None"}</p><p className="mt-1 truncate text-xs text-slate-500">{active?.title ?? "No constitution published"}</p></div>
      {[{ label: "Signed", value: signed, color: "text-emerald-700" }, { label: "Awaiting signature", value: pending, color: "text-amber-700" }, { label: "Declined", value: declined, color: "text-rose-700" }].map(item => <div key={item.label} className="rounded-xl border bg-white p-4"><p className="text-xs font-medium text-slate-500">{item.label}</p><p className={`mt-2 text-2xl font-semibold ${item.color}`}>{item.value}</p><p className="mt-1 text-xs text-slate-500">of {leaders.length} executives</p></div>)}
    </section>

    {showVersions ? <section className="rounded-xl border bg-white">
      <div className="border-b px-4 py-3"><h2 className="font-semibold text-slate-900">Constitution versions</h2></div>
      <div className="divide-y">{versions.map(version => <div key={version.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><p className="font-medium text-slate-900">{version.versionTag}</p><Badge status={version.status} /></div><p className="mt-1 truncate text-sm text-slate-500">{version.title}</p></div><div className="flex items-center gap-3 text-xs text-slate-500"><span>{version.signatures.filter(item => item.status === "signed").length}/{leaders.length} signed</span><span>{date(version.publishedAt ?? version.createdAt)}</span>{version.status !== "published" ? <button disabled={busyId === version.id} onClick={() => void act(version.id, () => fetch(`/api/admin/constitution/${version.id}/publish`, { method: "POST" }), `${version.versionTag} published and invitations sent.`)} className="rounded-lg bg-emerald-700 px-3 py-2 font-medium text-white disabled:opacity-50">Publish</button> : null}</div></div>)}</div>
    </section> : null}

    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-4"><div><h2 className="font-semibold text-slate-900">Executive signatures</h2><p className="mt-0.5 text-xs text-slate-500">Actions apply to {active?.versionTag ?? "the active version"}.</p></div><span className="text-xs text-slate-500">{signed}/{leaders.length} complete</span></div>
      {!active ? <p className="p-8 text-center text-sm text-slate-500">Publish a constitution version to begin collecting signatures.</p> : <div className="divide-y">{rows.map(({ leader, signature }) => <article key={leader.id} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_auto_auto] md:items-center">
        <div className="min-w-0"><p className="font-medium text-slate-900">{leader.name}</p><p className="truncate text-xs text-slate-500">{leader.role} · {leader.email}</p></div>
        <div className="flex items-center gap-3 md:justify-end"><Badge status={signature?.status ?? "pending"} /><span className="text-xs text-slate-500">{signature?.signedAt ? `Signed ${date(signature.signedAt)}` : signature?.emailSentAt ? `Invited ${date(signature.emailSentAt)}` : "Not invited"}</span></div>
        <div className="flex gap-2 md:justify-end">{signature ? <a href={`/sign/${signature.token}`} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">View</a> : null}<button disabled={busyId === leader.id || isPending} onClick={() => void act(leader.id, () => fetch("/api/admin/send-invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leaderId: leader.id }) }), `Invitation sent to ${leader.name}.`)} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">{busyId === leader.id ? "Sending…" : signature ? "Resend" : "Send invite"}</button>{canResetSignatures && signature?.status === "signed" ? <button disabled={busyId === signature.id} onClick={() => { if (window.confirm(`Reset ${leader.name}'s signature? They will need to sign again.`)) void act(signature.id, () => fetch(`/api/admin/constitution/${active.id}/unsign/${signature.id}`, { method: "POST" }), `${leader.name}'s signature was reset.`); }} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50">Reset</button> : null}</div>
      </article>)}</div>}
    </section>
  </div>;
}

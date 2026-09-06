"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { canTransitionMember, MEMBER_STATUSES } from "@/lib/members/validation";

type Note = { id: string; body: string; authorEmail: string; createdAt: string };

export default function MemberActions({ memberId, status, emailStatus, emailError, notes, canUpdate, canReview }: { memberId: string; status: string; emailStatus: string | null; emailError: string | null; notes: Note[]; canUpdate: boolean; canReview: boolean }) {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const canChangeStatus = status === "pending" ? canReview : canUpdate;
  const options = canChangeStatus ? MEMBER_STATUSES.filter(value => canTransitionMember(status, value)) : [];

  async function request(url: string, init: RequestInit, success: string) {
    setBusy(true);
    const response = await fetch(url, init);
    const data = await response.json();
    setBusy(false);
    setMessage(response.ok && data.sent !== false ? success : data.error || "The operation could not be completed.");
    if (response.ok) router.refresh();
    return response.ok;
  }

  async function changeStatus() {
    if (!target) return;
    const pendingReview = status === "pending" && (target === "approved" || target === "rejected");
    await request(pendingReview ? `/api/admin/registrations/${memberId}` : `/api/admin/members/${memberId}/status`, { method: pendingReview ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pendingReview ? { action: target === "approved" ? "approve" : "reject", reviewNote: reason } : { status: target, reason }) }, "Member status updated.");
  }

  async function addNote() {
    if (await request(`/api/admin/members/${memberId}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: note }) }, "Internal note added.")) setNote("");
  }

  return <div className="space-y-5">
    <div className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Member actions</h2>{status === "approved" && <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm"><p>Access email: <span className="font-medium capitalize">{emailStatus || "not recorded"}</span></p>{emailStatus === "failed" && emailError && <p className="mt-1 break-words text-xs text-red-700">{emailError}</p>}{canUpdate && <button disabled={busy} onClick={() => void request(`/api/admin/members/${memberId}/resend-access`, { method: "POST" }, "Portal access email sent.")} className="mt-2 font-medium text-emerald-700">Resend portal access</button>}</div>}{canChangeStatus ? <><select value={target} onChange={event => setTarget(event.target.value)} className="mt-4 w-full rounded-lg border p-2.5"><option value="">Select new status</option>{options.map(value => <option key={value} value={value}>{value}</option>)}</select><textarea value={reason} onChange={event => setReason(event.target.value)} rows={3} placeholder="Reason or member-facing review note" className="mt-3 w-full rounded-lg border p-2.5 text-sm"/><button disabled={!target || busy} onClick={() => void changeStatus()} className="mt-3 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Update status</button></> : <p className="mt-3 text-sm text-slate-500">You have read-only access.</p>}{message && <p className="mt-3 rounded bg-slate-50 p-2 text-sm" role="status">{message}</p>}</div>
    {(canUpdate || canReview) && <div className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Internal notes</h2>{canUpdate && <><textarea value={note} onChange={event => setNote(event.target.value)} rows={4} placeholder="Visible to membership reviewers and managers only" className="mt-3 w-full rounded-lg border p-2.5 text-sm"/><button disabled={!note.trim() || busy} onClick={() => void addNote()} className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">Add note</button></>}<div className="mt-4 space-y-3">{notes.map(item => <div key={item.id} className="rounded-lg bg-slate-50 p-3"><p className="whitespace-pre-wrap text-sm">{item.body}</p><p className="mt-2 text-xs text-slate-500">{item.authorEmail} · {new Date(item.createdAt).toLocaleString("en-KE")}</p></div>)}{!notes.length && <p className="text-sm text-slate-500">No internal notes.</p>}</div></div>}
  </div>;
}

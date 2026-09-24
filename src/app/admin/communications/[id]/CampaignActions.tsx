"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function CampaignActions({id,canSend,status}:{id:string;canSend:boolean;status:string}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  async function send() {
    setConfirming(false);
    setBusy(true);
    const response = await fetch(`/api/admin/communications/campaigns/${id}/send`, { method: "POST" });
    const data = await response.json();
    setBusy(false);
    setMessage(response.ok || response.status === 207 ? `Batch sent: ${data.sent}. Failed: ${data.failed}. Remaining: ${data.remaining}.` : data.error);
    router.refresh();
  }

  async function duplicate() {
    setBusy(true);
    const response = await fetch(`/api/admin/communications/campaigns/${id}/duplicate`, { method: "POST" });
    const data = await response.json();
    if (response.ok && data.campaign) {
      router.push(`/admin/communications/${data.campaign.id}/edit`);
      router.refresh();
    } else {
      setBusy(false);
      setMessage(data.error || "Failed to duplicate");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "draft" && (
        <a href={`/admin/communications/${id}/edit`} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Edit campaign</a>
      )}
      <a target="_blank" rel="noreferrer" href={`/api/admin/communications/campaigns/${id}/preview`} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Preview branded email</a>
      
      {canSend && (
        <button disabled={busy} onClick={() => void duplicate()} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors">
          Duplicate
        </button>
      )}
      
      {canSend && ["draft", "failed", "sending"].includes(status) && !confirming && (
        <button disabled={busy} onClick={() => status === "draft" ? setConfirming(true) : void send()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-emerald-800 transition-colors">
          {busy ? "Working…" : status === "sending" ? "Continue next batch" : "Send campaign"}
        </button>
      )}

      {confirming && (
        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
          <span className="text-sm text-slate-600 font-medium">Are you sure?</span>
          <button onClick={() => void send()} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors">
            Yes, send it
          </button>
          <button onClick={() => setConfirming(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      )}

      {message && <p role="status" className="w-full text-sm text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{message}</p>}
    </div>
  );
}

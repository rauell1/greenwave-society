"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CampaignEditor({ campaign }: { campaign: any }) {
  const router = useRouter(); 
  const [busy, setBusy] = useState(false); 
  const [message, setMessage] = useState("");
  
  const [form, setForm] = useState({
    name: campaign.name || "",
    subject: campaign.subject || "",
    preheader: campaign.preheader || "",
    eyebrow: campaign.eyebrow || "Greenwave Update",
    htmlBody: campaign.htmlBody || ""
  });

  async function update() {
    setBusy(true);
    const response = await fetch(`/api/admin/communications/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setBusy(false);
    if (response.ok) {
      router.push(`/admin/communications/${campaign.id}`);
      router.refresh();
    } else {
      setMessage(data.error ?? "Could not update campaign");
    }
  }

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Edit campaign draft</h2>
      <div className="mt-4 grid gap-3">
        <input className="rounded-lg border p-2.5" placeholder="Internal campaign name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input className="rounded-lg border p-2.5" placeholder="Email subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
        <input className="rounded-lg border p-2.5" placeholder="Inbox preview text" value={form.preheader} onChange={e => setForm({...form, preheader: e.target.value})} />
        <textarea className="min-h-40 rounded-lg border p-2.5 font-mono text-sm" value={form.htmlBody} onChange={e => setForm({...form, htmlBody: e.target.value})} />
        <button disabled={busy || !form.name || !form.subject} onClick={() => void update()} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">Save changes</button>
        {message && <p role="status" className="text-sm text-red-700">{message}</p>}
      </div>
    </section>
  );
}

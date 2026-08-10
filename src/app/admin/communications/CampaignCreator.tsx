"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CampaignCreator() {
  const router = useRouter(); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const [form,setForm]=useState({name:"",subject:"",preheader:"",eyebrow:"Greenwave Update",htmlBody:"<p>Hello Greenwave community,</p><p>Share your update here.</p>"});
  async function create(){setBusy(true);const response=await fetch("/api/admin/communications/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await response.json();setBusy(false);if(response.ok){router.push(`/admin/communications/${data.campaign.id}`);router.refresh();}else setMessage(data.error??"Could not create campaign");}
  return <section className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-semibold">New campaign draft</h2><div className="mt-4 grid gap-3"><input className="rounded-lg border p-2.5" placeholder="Internal campaign name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="rounded-lg border p-2.5" placeholder="Email subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/><input className="rounded-lg border p-2.5" placeholder="Inbox preview text" value={form.preheader} onChange={e=>setForm({...form,preheader:e.target.value})}/><textarea className="min-h-40 rounded-lg border p-2.5 font-mono text-sm" value={form.htmlBody} onChange={e=>setForm({...form,htmlBody:e.target.value})}/><button disabled={busy||!form.name||!form.subject} onClick={()=>void create()} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">Create draft</button>{message&&<p role="status" className="text-sm text-red-700">{message}</p>}</div></section>;
}

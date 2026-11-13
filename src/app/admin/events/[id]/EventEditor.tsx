"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { readApiError } from "@/lib/admin/api-error";
import { fromNairobiParts, toNairobiParts } from "@/lib/events/nairobi-time";
import { slugify } from "@/lib/events/validation";

export interface EditableEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string | null;
  virtualUrl: string | null;
  capacity: number | null;
  status: string;
  startsAt: string;
  endsAt: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
}

function initialForm(event: EditableEvent) {
  const start = toNairobiParts(event.startsAt);
  const end = toNairobiParts(event.endsAt);
  const opens = toNairobiParts(event.registrationOpensAt);
  const closes = toNairobiParts(event.registrationClosesAt);
  return {
    title: event.title, slug: event.slug, description: event.description, location: event.location ?? "", virtualUrl: event.virtualUrl ?? "",
    capacity: event.capacity ? String(event.capacity) : "",
    startDate: start.date, startTime: start.time, endDate: end.date, endTime: end.time,
    opensDate: opens.date, opensTime: opens.time, closesDate: closes.date, closesTime: closes.time,
  };
}

export default function EventEditor({ event }: { event: EditableEvent }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState(() => initialForm(event));
  const set = (field: keyof typeof form) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [field]: e.target.value }));
  const locked = event.status === "cancelled" || event.status === "completed";

  async function save() {
    const startsAt = fromNairobiParts(form.startDate, form.startTime);
    const endsAt = fromNairobiParts(form.endDate || form.startDate, form.endTime);
    if (!form.title.trim() || !form.slug || !form.description.trim()) return setMessage({ ok: false, text: "Title, slug and description are required." });
    if (!startsAt || !endsAt) return setMessage({ ok: false, text: "Enter a start and end date and time." });
    if (endsAt <= startsAt) return setMessage({ ok: false, text: "The event must end after it starts." });
    const opensAt = fromNairobiParts(form.opensDate, form.opensTime || "00:00");
    const closesAt = fromNairobiParts(form.closesDate, form.closesTime || "23:59");
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, slug: slugify(form.slug), description: form.description,
          location: form.location || null, virtualUrl: form.virtualUrl || "", timezone: "Africa/Nairobi",
          capacity: form.capacity ? Number(form.capacity) : null,
          startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(),
          registrationOpensAt: opensAt?.toISOString() ?? null, registrationClosesAt: closesAt?.toISOString() ?? null,
        }),
      });
      if (!response.ok) return setMessage({ ok: false, text: await readApiError(response, "Unable to save the event.") });
      setMessage({ ok: true, text: "Event details saved." });
      setOpen(false);
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Network error. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border p-2.5 text-sm";
  const pair = (label: string, date: keyof typeof form, time: keyof typeof form, hint?: string) => (
    <fieldset className="text-sm"><legend>{label}</legend><div className="mt-1 flex gap-2"><input type="date" aria-label={`${label} date`} value={form[date]} onChange={set(date)} className="min-w-0 flex-1 rounded-lg border p-2.5"/><input type="time" aria-label={`${label} time`} value={form[time]} onChange={set(time)} className="w-32 rounded-lg border p-2.5"/></div>{hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}</fieldset>
  );

  return <div className="rounded-xl border bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-semibold text-slate-900">Event details</h2><p className="text-xs text-slate-500">Title, description, venue, times, capacity and registration window.</p></div>
      <button disabled={locked} onClick={() => { setOpen(!open); setMessage(null); setForm(initialForm(event)); }} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"><Pencil className="h-4 w-4"/>{open ? "Cancel" : "Edit details"}</button>
    </div>
    {locked && <p className="mt-2 text-xs text-slate-500">Cancelled and completed events can no longer be edited.</p>}
    {open && <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Title<input value={form.title} onChange={set("title")} className={input}/></label>
      <label className="text-sm">Slug (web address)<input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} className={input}/>{event.status === "published" && form.slug !== event.slug && <span className="mt-1 block text-xs text-amber-700">Changing the slug changes the public link. Links already shared will stop working.</span>}</label>
      <label className="text-sm sm:col-span-2">Description<textarea value={form.description} onChange={set("description")} rows={5} className={input}/></label>
      <label className="text-sm">Location<input value={form.location} onChange={set("location")} className={input}/></label>
      <label className="text-sm">Online link (optional)<input type="url" value={form.virtualUrl} onChange={set("virtualUrl")} placeholder="https://" className={input}/></label>
      <label className="text-sm">Capacity (optional)<input type="number" min="1" value={form.capacity} onChange={set("capacity")} className={input}/><span className="mt-1 block text-xs text-slate-500">People beyond capacity are put on a waiting list.</span></label>
      <div className="hidden sm:block"/>
      {pair("Starts (Africa/Nairobi)", "startDate", "startTime")}
      {pair("Ends (Africa/Nairobi)", "endDate", "endTime")}
      {pair("Registration opens (optional)", "opensDate", "opensTime", "Leave empty to open as soon as the event is published.")}
      {pair("Registration closes (optional)", "closesDate", "closesTime", "Leave empty to close when the event ends.")}
      <div className="sm:col-span-2"><button disabled={busy} onClick={() => void save()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button></div>
    </div>}
    {message && <p className={`mt-3 text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`} role="status">{message.text}</p>}
  </div>;
}

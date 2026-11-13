"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/admin/api-error";
import { fromNairobiParts } from "@/lib/events/nairobi-time";
import { slugify } from "@/lib/events/validation";

// Date and time are separate inputs: a datetime-local field lets people pick a date without a
// time, which leaves the value empty and used to disable "Save draft" with no explanation.
const emptyForm = { slug: "", title: "", description: "", location: "", startDate: "", startTime: "10:00", endDate: "", endTime: "13:00", capacity: "" };

export default function EventCreator() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const endDate = form.endDate || form.startDate;
  const missing = [
    !form.title.trim() && "title",
    !form.slug && "slug",
    !form.description.trim() && "description",
    !form.startDate && "start date",
    !form.startTime && "start time",
    !form.endTime && "end time",
  ].filter(Boolean) as string[];

  async function create() {
    if (missing.length) return setMessage({ ok: false, text: `Please add the ${missing.join(", ")}.` });
    const startsAt = fromNairobiParts(form.startDate, form.startTime);
    const endsAt = fromNairobiParts(endDate, form.endTime);
    if (!startsAt || !endsAt) return setMessage({ ok: false, text: "Please enter a valid start and end date and time." });
    if (endsAt <= startsAt) return setMessage({ ok: false, text: "The event must end after it starts." });
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          title: form.title,
          description: form.description,
          location: form.location || null,
          timezone: "Africa/Nairobi",
          capacity: form.capacity ? Number(form.capacity) : null,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        }),
      });
      if (!response.ok) return setMessage({ ok: false, text: await readApiError(response, "Unable to create the event.") });
      setMessage({ ok: true, text: "Event saved as a draft. Open it below to publish it." });
      setForm(emptyForm);
      setSlugEdited(false);
      setOpen(false);
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Network error. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  const input = "rounded-lg border p-2.5";
  return <div className="rounded-xl border bg-white p-5">
    <button onClick={() => { setOpen(!open); setMessage(null); }} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white">{open ? "Close" : "Create event"}</button>
    {open && <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: slugEdited ? form.slug : slugify(e.target.value) })} className={`mt-1 w-full ${input}`}/></label>
      <label className="text-sm">Slug (web address)<input value={form.slug} onChange={e => { setSlugEdited(true); setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }); }} onBlur={() => setForm(f => ({ ...f, slug: slugify(f.slug) }))} className={`mt-1 w-full ${input}`}/><span className="mt-1 block text-xs text-slate-500">Filled in from the title. Used in links to the event.</span></label>
      <label className="text-sm sm:col-span-2">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`mt-1 w-full ${input}`}/></label>
      <label className="text-sm">Location<input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={`mt-1 w-full ${input}`}/></label>
      <label className="text-sm">Capacity (optional)<input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className={`mt-1 w-full ${input}`}/></label>
      <fieldset className="text-sm"><legend>Starts (Africa/Nairobi)</legend><div className="mt-1 flex gap-2"><input type="date" aria-label="Start date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={`min-w-0 flex-1 ${input}`}/><input type="time" aria-label="Start time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className={`w-32 ${input}`}/></div></fieldset>
      <fieldset className="text-sm"><legend>Ends (Africa/Nairobi)</legend><div className="mt-1 flex gap-2"><input type="date" aria-label="End date" value={endDate} min={form.startDate || undefined} onChange={e => setForm({ ...form, endDate: e.target.value })} className={`min-w-0 flex-1 ${input}`}/><input type="time" aria-label="End time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className={`w-32 ${input}`}/></div></fieldset>
      <div className="sm:col-span-2"><button disabled={busy} onClick={() => void create()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? "Saving…" : "Save draft"}</button>{missing.length > 0 && <p className="mt-2 text-xs text-slate-500">Still needed: {missing.join(", ")}.</p>}</div>
    </div>}
    {message && <p className={`mt-3 text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`} role="status">{message.text}</p>}
  </div>;
}

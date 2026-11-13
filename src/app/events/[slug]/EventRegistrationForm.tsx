"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readApiError } from "@/lib/admin/api-error";

const emptyForm = { fullName: "", email: "", phone: "", registerAs: "attendee" as "attendee" | "vendor", businessName: "", website: "" };

export function EventRegistrationForm({ slug, closedMessage, fullyBooked }: { slug: string; closedMessage?: string; fullyBooked: boolean }) {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<"registered" | "waitlisted" | null>(null);
  const set = (field: keyof typeof form) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [field]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, businessName: form.registerAs === "vendor" ? form.businessName : undefined }),
      });
      if (!response.ok) return setError(await readApiError(response, "We could not register you. Please try again."));
      setResult((await response.json()).status === "waitlisted" ? "waitlisted" : "registered");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const card = "rounded-2xl border border-primary/10 bg-muted/30 p-6";
  if (closedMessage) return <div className={card}><h2 className="font-serif text-xl font-bold">Registration</h2><p className="mt-2 text-sm text-muted-foreground">{closedMessage}</p></div>;
  if (result) {
    return (
      <div className={card} role="status">
        <CheckCircle2 className="h-8 w-8 text-primary" />
        <h2 className="mt-3 font-serif text-xl font-bold">{result === "registered" ? "You're registered!" : "You're on the waiting list"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{result === "registered" ? "Check your email for your confirmation. We'll remind you 3 days before and the day before." : "The event is full right now. We'll email you if a place opens up."}</p>
      </div>
    );
  }
  return (
    <form onSubmit={e => void submit(e)} className={`${card} space-y-4`}>
      <div>
        <h2 className="font-serif text-xl font-bold">Sign up to attend</h2>
        {fullyBooked && <p className="mt-1 text-sm text-amber-700">This event is full. Sign up to join the waiting list.</p>}
      </div>
      <fieldset>
        <legend className="text-sm font-medium">I'm signing up as</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {([["attendee", "Attendee"], ["vendor", "Vendor / exhibitor"]] as const).map(([value, label]) => (
            <label key={value} className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium ${form.registerAs === value ? "border-primary bg-primary/10 text-primary" : "bg-background"}`}>
              <input type="radio" name="registerAs" value={value} checked={form.registerAs === value} onChange={() => setForm(f => ({ ...f, registerAs: value }))} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-medium">Name<Input required minLength={2} value={form.fullName} onChange={set("fullName")} className="mt-1" autoComplete="name" /></label>
      <label className="block text-sm font-medium">Email<Input required type="email" value={form.email} onChange={set("email")} className="mt-1" autoComplete="email" /></label>
      <label className="block text-sm font-medium">Phone number<Input required type="tel" value={form.phone} onChange={set("phone")} className="mt-1" autoComplete="tel" placeholder="07xx xxx xxx" /></label>
      {form.registerAs === "vendor" && <label className="block text-sm font-medium">Business name<Input required minLength={2} value={form.businessName} onChange={set("businessName")} className="mt-1" autoComplete="organization" /></label>}
      {/* Hidden from people; bots that fill it are ignored. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing you up…" : fullyBooked ? "Join the waiting list" : "Sign up"}</Button>
      <p className="text-xs text-muted-foreground">We use your details only for this event. See our <a href="/privacy" className="underline">privacy policy</a>.</p>
    </form>
  );
}

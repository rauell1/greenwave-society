"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const inputBase =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-3 text-base sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

interface ApplicationFormProps {
  roleSlug: string;
  roleTitle: string;
  roleQuestion: string;
  profileRequired?: boolean;
}

export function ApplicationForm({
  roleSlug,
  roleTitle,
  roleQuestion,
  profileRequired = false,
}: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(event.currentTarget);
      const body = Object.fromEntries(form.entries());
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          roleSlug,
          consent: form.get("consent") === "on",
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Could not submit your application. Please check your inputs and try again.");
        return;
      }

      setReference(data.reference);
      toast.success("Application successfully submitted!");
    } catch {
      setError("A network error occurred. Please try submitting again.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopyRef = async () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(reference);
      setCopiedRef(true);
      toast.success("Reference code copied!");
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  if (reference) {
    return (
      <div className="py-6 sm:py-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm">
          <Check className="h-8 w-8 stroke-[2.5]" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Confirmed
        </span>
        <h2 className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-zinc-900">
          Application Received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed text-zinc-600">
          Thank you for applying for <strong>{roleTitle}</strong>. Our leadership team will review your submission and reach out regarding next steps.
        </p>

        {/* Reference Code Card */}
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Your Application Tracking Reference
          </span>
          <div className="mt-1 flex items-center justify-center gap-2">
            <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-base font-bold text-emerald-900 shadow-xs border border-emerald-200">
              {reference}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyRef}
              className="h-9 px-2.5 rounded-lg border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="w-full sm:w-auto rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-700">
            <Link href="/careers">Back to all roles</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl border-zinc-300 text-zinc-700">
            <Link href={`/careers/${roleSlug}`}>Return to role description</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8 sm:space-y-10">
      {/* Section 1: Candidate Details */}
      <section>
        <div className="border-b border-zinc-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
            Part 1 of 2
          </span>
          <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-zinc-900">
            About You &amp; Your Contact Details
          </h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field name="fullName" label="Full name" placeholder="e.g. Jane Mwangi" />
          <Field name="email" label="Email address" type="email" placeholder="jane@example.com" />
          <Field name="phone" label="WhatsApp or Phone number" type="tel" placeholder="+254 700 000 000" />
          <Field name="location" label="Current base or location" placeholder="e.g. Nairobi, Kenya / Remote" />

          <label className="sm:col-span-2 block text-xs sm:text-sm font-semibold text-zinc-800">
            Availability and weekly time commitment
            <span className="block mt-0.5 text-xs font-normal text-zinc-500">
              Indicate how many hours per week you can reliably allocate (e.g., 4-6 hrs/week for executive barazas and deliverables).
            </span>
            <textarea
              name="availability"
              required
              rows={2}
              placeholder="e.g. Available 5 hours weekly, flexible for Thursday 8:00 PM strategy barazas and asynchronous deliverables."
              className={`${inputBase} mt-2`}
            />
          </label>

          <label className="sm:col-span-2 block text-xs sm:text-sm font-semibold text-zinc-800">
            Professional Profile or Portfolio Link{" "}
            <span className="font-normal text-zinc-500">
              {profileRequired ? "(Required: LinkedIn profile, personal website, or online CV)" : "(Optional)"}
            </span>
            <input
              name="portfolioUrl"
              type="url"
              required={profileRequired}
              placeholder="https://linkedin.com/in/yourprofile"
              className={`${inputBase} mt-2`}
            />
          </label>
        </div>
      </section>

      {/* Section 2: Role Fit & Perspective */}
      <section className="border-t border-zinc-200/90 pt-7 sm:pt-8">
        <div className="border-b border-zinc-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
            Part 2 of 2
          </span>
          <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-zinc-900">
            Your Perspective &amp; Role Fit
          </h2>
        </div>

        <div className="mt-5 space-y-5">
          <Question
            name="motivation"
            label="Why do you want to contribute to Greenwave Society?"
            placeholder="Share what excites you about our mission, youth systems change focus, and community work in Kenya."
          />
          <Question
            name="relevantExperience"
            label="What experience, skills, or lived perspective would you bring?"
            placeholder="Highlight your previous financial, organizational, community, or leadership experiences."
          />
          <Question
            name="collaborationStyle"
            label="How do you communicate and collaborate when priorities or opinions differ?"
            placeholder="Describe your approach to constructive dialogue, transparency, and team alignment."
          />
          <Question
            name="roleResponse"
            label={roleQuestion}
            placeholder="Provide a specific, practical response reflecting your approach and judgment."
          />
        </div>
      </section>

      {/* Consent & Accuracy */}
      <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200/80">
        <label className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-zinc-700 cursor-pointer">
          <input
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 accent-emerald-800 cursor-pointer"
          />
          <span>
            I confirm that the information provided is accurate and consent to Greenwave Society processing it for leadership recruitment and outreach.
          </span>
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm font-semibold text-rose-800"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 sm:h-14 rounded-xl bg-emerald-800 text-sm sm:text-base font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Submitting Application...</span>
          </>
        ) : (
          <span>Submit Volunteer Application</span>
        )}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
      {label}
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className={`${inputBase} mt-1.5`}
      />
    </label>
  );
}

function Question({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
      {label}
      <textarea
        name={name}
        required
        rows={4}
        placeholder={placeholder}
        className={`${inputBase} mt-1.5`}
      />
    </label>
  );
}

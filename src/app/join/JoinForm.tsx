"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const COUNTIES = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay",
  "Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu",
  "Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru",
  "Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua",
  "Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia",
  "Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot",
];

const OCCUPATIONS = [
  { value: "student",           label: "Student" },
  { value: "employed_private",  label: "Employed (Private Sector)" },
  { value: "employed_public",   label: "Employed (Public / Government)" },
  { value: "self_employed",     label: "Self-Employed / Entrepreneur" },
  { value: "unemployed",        label: "Unemployed / Job Seeking" },
  { value: "other",             label: "Other" },
];

const INTERESTS = [
  "Climate Action",
  "Ecosystem Restoration",
  "Youth Empowerment",
  "Water Stewardship",
  "Biodiversity Conservation",
  "Sustainable Agriculture",
  "Clean Energy",
  "Community Development",
  "SDG Advocacy",
  "Environmental Education",
  "Green Innovation",
  "Gender and Climate Justice",
];

const TOTAL_STEPS = 6;

interface FormData {
  meetsEligibility: boolean | null;
  fullName: string;
  email: string;
  phone: string;
  county: string;
  occupation: string;
  organization: string;
  interests: string[];
  motivation: string;
  hearAboutUs: string;
  acknowledged: boolean;
}

const INITIAL: FormData = {
  meetsEligibility: null,
  fullName: "", email: "", phone: "", county: "",
  occupation: "", organization: "",
  interests: [],
  motivation: "", hearAboutUs: "",
  acknowledged: false,
};

const STEP_LABELS = ["Eligibility", "Personal Info", "Background", "Interests", "Motivation", "Review"];

export default function JoinForm() {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<FormData>(INITIAL);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm(f => ({ ...f, [k]: v })), []);

  function toggleInterest(i: string) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i],
    }));
  }

  function canAdvance(): boolean {
    if (step === 1) return form.meetsEligibility === true;
    if (step === 2) return !!(form.fullName.trim() && form.email.trim() && form.phone.trim() && form.county);
    if (step === 3) return !!form.occupation;
    if (step === 4) return true;
    if (step === 5) return form.motivation.trim().length >= 20;
    if (step === 6) return form.acknowledged;
    return false;
  }

  async function submit() {
    // Local duplicate guard
    const stored = typeof window !== "undefined" ? localStorage.getItem("gws_submitted_email") : null;
    if (stored && stored.toLowerCase() === form.email.toLowerCase().trim()) {
      setError("An application with this email was already submitted. Please check your inbox.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/registrations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          email:  form.email.toLowerCase().trim(),
          source: "greenwave.rauell.systems",
        }),
      });
      const data = await res.json();

      if (res.status === 201) {
        localStorage.setItem("gws_submitted_email", form.email.toLowerCase().trim());
        setSubmittedName(form.fullName.split(" ")[0]);
        setSubmittedEmail(form.email.toLowerCase().trim());
        setSubmitted(true);
      } else if (res.status === 403) {
        setError("Membership intake is currently closed. Please check back later.");
      } else if (res.status === 409) {
        setError(data.error ?? "Intake is currently full. Please try again later.");
      } else if (res.status === 429) {
        setError("An application with this email was already submitted recently. Please check your inbox.");
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#1A5C38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A5C38] font-serif mb-3">Application Received</h1>
          <p className="text-gray-700 text-base leading-relaxed mb-2">
            Thank you, <strong>{submittedName}</strong>. Your Expression of Interest has been received.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            A confirmation has been sent to <strong>{submittedEmail}</strong>. Our team will review your application
            and contact you within <strong>5 working days</strong>. This submission is not immediate membership.
          </p>
          <Link href="/" className="inline-block bg-[#1A5C38] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#154d2f] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <header className="bg-[#1A5C38] text-white py-5 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Greenwave Society" className="h-9 w-9 rounded-xl object-contain" />
          <div>
            <p className="font-bold font-serif tracking-wide text-sm">GREENWAVE SOCIETY</p>
            <p className="text-green-200 text-xs">Membership Application</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className={`flex flex-col items-center flex-1 ${i < STEP_LABELS.length - 1 ? "relative" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-colors
                  ${i + 1 < step ? "bg-[#1A5C38] border-[#1A5C38] text-white" :
                    i + 1 === step ? "bg-white border-[#1A5C38] text-[#1A5C38]" :
                    "bg-white border-gray-300 text-gray-400"}`}>
                  {i + 1 < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <p className={`text-xs mt-1 hidden sm:block ${i + 1 === step ? "text-[#1A5C38] font-semibold" : "text-gray-400"}`}>
                  {label}
                </p>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`absolute top-3.5 left-1/2 w-full h-0.5 -z-0 transition-colors
                    ${i + 1 < step ? "bg-[#1A5C38]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-3 sm:hidden">Step {step} of {TOTAL_STEPS}: {STEP_LABELS[step - 1]}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && <Step2 form={form} set={set} />}
          {step === 3 && <Step3 form={form} set={set} />}
          {step === 4 && <Step4 form={form} toggleInterest={toggleInterest} />}
          {step === 5 && <Step5 form={form} set={set} />}
          {step === 6 && <Step6 form={form} set={set} />}

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => { setStep(s => s - 1); setError(""); }}
                className="text-sm text-gray-500 border border-gray-300 px-5 py-2.5 rounded-xl hover:border-gray-400 transition-colors">
                Back
              </button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <button onClick={() => { if (canAdvance()) { setStep(s => s + 1); setError(""); } }}
                disabled={!canAdvance()}
                className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#154d2f] transition-colors">
                Next
              </button>
            ) : (
              <button onClick={submit} disabled={!canAdvance() || loading}
                className="bg-[#1A5C38] text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#154d2f] transition-colors flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting...
                  </>
                ) : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Step components ─────────────────────────────────────────────────────────

function Step1({ form, set }: { form: FormData; set: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A5C38] font-serif mb-2">Eligibility Check</h2>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Greenwave Society is a youth-led organisation open to individuals aged <strong>15 to 35 years</strong> who
        are passionate about climate action and community development.
      </p>
      <p className="text-gray-800 font-medium mb-4">Are you between 15 and 35 years of age?</p>
      <div className="flex gap-4">
        {[true, false].map(val => (
          <button key={String(val)} onClick={() => set("meetsEligibility", val)}
            className={`flex-1 py-4 rounded-xl border-2 font-semibold text-sm transition-colors
              ${form.meetsEligibility === val
                ? val ? "bg-[#1A5C38] border-[#1A5C38] text-white" : "bg-red-50 border-red-400 text-red-700"
                : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
            {val ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {form.meetsEligibility === false && (
        <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 leading-relaxed">
          <strong>We appreciate your interest.</strong> Unfortunately our membership programme is currently
          open to individuals aged 15 to 35. We encourage you to follow our work at{" "}
          <a href="https://greenwave.rauell.systems" className="underline">greenwave.rauell.systems</a>{" "}
          and explore how you can support us in other ways.
        </div>
      )}
    </div>
  );
}

function Step2({ form, set }: { form: FormData; set: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A5C38] font-serif mb-2">Personal Details</h2>
      <p className="text-gray-500 text-sm mb-6">All fields in this section are required.</p>
      <div className="space-y-5">
        <Field label="Full Name" hint="As it appears on your official ID">
          <input value={form.fullName} onChange={e => set("fullName", e.target.value)}
            placeholder="e.g. Jane Achieng Otieno" className={inp} />
        </Field>
        <Field label="Email Address">
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
            placeholder="jane@example.com" className={inp} />
        </Field>
        <Field label="Phone Number" hint="WhatsApp number preferred">
          <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
            placeholder="07XX XXX XXX" className={inp} />
        </Field>
        <Field label="County">
          <select value={form.county} onChange={e => set("county", e.target.value)} className={inp}>
            <option value="">Select your county...</option>
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Step3({ form, set }: { form: FormData; set: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A5C38] font-serif mb-2">Background</h2>
      <p className="text-gray-500 text-sm mb-6">Help us understand your current situation.</p>
      <div className="space-y-5">
        <Field label="Occupation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OCCUPATIONS.map(o => (
              <button key={o.value} onClick={() => set("occupation", o.value)}
                className={`text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors
                  ${form.occupation === o.value
                    ? "bg-[#1A5C38] border-[#1A5C38] text-white"
                    : "border-gray-200 text-gray-700 hover:border-[#1A5C38]"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="School / Organisation / Company" hint="Optional — leave blank if not applicable">
          <input value={form.organization} onChange={e => set("organization", e.target.value)}
            placeholder="e.g. University of Nairobi, Kenya Red Cross..." className={inp} />
        </Field>
      </div>
    </div>
  );
}

function Step4({ form, toggleInterest }: { form: FormData; toggleInterest: (i: string) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A5C38] font-serif mb-2">Thematic Interests</h2>
      <p className="text-gray-500 text-sm mb-6">Select all areas you are passionate about. This is optional.</p>
      <div className="flex flex-wrap gap-3">
        {INTERESTS.map(i => (
          <button key={i} onClick={() => toggleInterest(i)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
              ${form.interests.includes(i)
                ? "bg-[#1A5C38] border-[#1A5C38] text-white"
                : "border-gray-300 text-gray-600 hover:border-[#1A5C38] hover:text-[#1A5C38]"}`}>
            {i}
          </button>
        ))}
      </div>
      {form.interests.length > 0 && (
        <p className="mt-4 text-xs text-[#1A5C38]">{form.interests.length} selected</p>
      )}
    </div>
  );
}

function Step5({ form, set }: { form: FormData; set: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  const len = form.motivation.trim().length;
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A5C38] font-serif mb-2">Motivation</h2>
      <p className="text-gray-500 text-sm mb-6">Tell us why you want to join and what you hope to contribute. Minimum 20 characters.</p>
      <div className="space-y-5">
        <Field label="Why do you want to join Greenwave Society?">
          <textarea value={form.motivation} onChange={e => set("motivation", e.target.value)}
            rows={6} placeholder="Share your passion for climate action, any relevant experience, and what you hope to contribute to the Society..."
            className={`${inp} resize-y`} />
          <p className={`text-xs mt-1 ${len < 20 ? "text-amber-600" : "text-green-600"}`}>
            {len < 20 ? `${20 - len} more characters needed` : `${len} characters`}
          </p>
        </Field>
        <Field label="How did you hear about us?" hint="Optional">
          <input value={form.hearAboutUs} onChange={e => set("hearAboutUs", e.target.value)}
            placeholder="e.g. Instagram, a friend, university notice board..." className={inp} />
        </Field>
      </div>
    </div>
  );
}

function Step6({ form, set }: { form: FormData; set: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  const occ = OCCUPATIONS.find(o => o.value === form.occupation)?.label ?? form.occupation;
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1A5C38] font-serif mb-2">Review and Submit</h2>
      <p className="text-gray-500 text-sm mb-6">Please confirm your details before submitting.</p>
      <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm mb-6">
        <Row label="Full Name"    value={form.fullName} />
        <Row label="Email"        value={form.email} />
        <Row label="Phone"        value={form.phone} />
        <Row label="County"       value={form.county} />
        <Row label="Occupation"   value={occ} />
        {form.organization && <Row label="Organisation" value={form.organization} />}
        {form.interests.length > 0 && <Row label="Interests" value={form.interests.join(", ")} />}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-gray-500 text-xs font-medium mb-1">Motivation</p>
          <p className="text-gray-800 leading-relaxed">{form.motivation}</p>
        </div>
        {form.hearAboutUs && <Row label="Heard Via" value={form.hearAboutUs} />}
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={form.acknowledged}
          onChange={e => set("acknowledged", e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1A5C38] focus:ring-[#1A5C38]" />
        <span className="text-sm text-gray-700 leading-relaxed">
          I understand this is an <strong>Expression of Interest</strong>, not immediate membership.
          The Greenwave Society team will review my application and contact me within <strong>5 working days</strong>.
        </span>
      </label>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const inp = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38] bg-white";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

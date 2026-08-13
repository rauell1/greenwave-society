"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function ApplicationForm({ roleTitle }: { roleTitle: string }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("role", roleTitle);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Application Received</h2>
        <p className="text-zinc-600 mb-6">
          Thank you for applying for the {roleTitle} position. We have received your application and will be in touch soon.
        </p>
        <a href="/careers" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1">
          Back to Careers <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          placeholder="jane@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          required 
          className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          placeholder="07XX XXX XXX"
        />
      </div>

      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-zinc-700 mb-1">Cover Letter / Message</label>
        <textarea 
          id="coverLetter" 
          name="coverLetter" 
          rows={5} 
          required 
          className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 resize-y"
          placeholder="Tell us why you are a great fit for this role..."
        />
      </div>

      <div>
        <label htmlFor="cv" className="block text-sm font-medium text-zinc-700 mb-1">Upload CV (PDF, DOCX)</label>
        <input 
          type="file" 
          id="cv" 
          name="cv" 
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
          required 
          className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { ShieldCheck, Lock, Trash2, Mail, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";

export function PrivacySection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleErasureRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/privacy/request-erasure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      setStatus({ type: "success", message: data.message });
      setEmail("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-gradient-to-b from-emerald-50/50 to-white text-zinc-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Data Protection & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-zinc-900">
            Privacy Policy & Data Rights
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            At Greenwave Society, we are committed to respecting your privacy, protecting your personal data, and maintaining compliance with global data privacy regulations (including GDPR and Kenyan Data Protection regulations).
          </p>
        </div>

        {/* Data Principles Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-zinc-900 text-base">Data Security</h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              We encrypt and safeguard personal details, storing only necessary information required for membership, environmental advocacy, and community outreach.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-zinc-900 text-base">Right to Access</h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Active members can inspect and export a complete JSON copy of all personal data held about them directly from their personal Member Portal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-zinc-900 text-base">Right to Erasure</h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              You retain the right to permanently erase your account, newsletter subscriptions, and contact history at any time without friction.
            </p>
          </div>
        </div>

        {/* Detailed Policy Text */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm space-y-6 text-sm text-zinc-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 font-serif">1. Information We Collect</h2>
            <p>
              Depending on how you interact with Greenwave Society, we may collect your name, email address, phone number, county location, occupation, and newsletter preferences when you register as a member or submit inquiries.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 font-serif">2. How We Use Your Data</h2>
            <p>
              Your personal data is used solely to facilitate community participation, send program updates, manage volunteer initiatives, and evaluate environmental impact. We never sell or share your personal data with third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 font-serif">3. Compliance & Your Data Rights</h2>
            <p>
              Under Applicable Data Protection Legislation (including GDPR Articles 15, 17, and 20), you are entitled to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-zinc-700 pl-2">
              <li>Request confirmation of whether your data is being processed.</li>
              <li>Export and receive your data in a portable electronic format.</li>
              <li>Request immediate and irreversible erasure of all personal data held by us.</li>
            </ul>
          </section>
        </div>

        {/* Interactive Data Erasure Tool */}
        <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden border border-zinc-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="space-y-2 relative">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <Trash2 className="w-4 h-4" />
              Public Self-Service Data Erasure
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">Request Immediate Data Erasure</h2>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              If you are a newsletter subscriber or have previously submitted contact forms, enter your email below to permanently purge all matching records from our system.
            </p>
          </div>

          <form onSubmit={handleErasureRequest} className="space-y-4 relative max-w-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Purging...
                  </>
                ) : (
                  "Erase My Data"
                )}
              </button>
            </div>

            {status && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  status.type === "success"
                    ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
                    : "bg-red-950/80 border-red-800 text-red-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{status.message}</span>
              </div>
            )}
          </form>

          <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
            For member profile management, please access your unique link or contact our compliance team at{" "}
            <a href={`mailto:${APP_CONFIG.contact.email}`} className="text-emerald-400 underline">
              {APP_CONFIG.contact.email}
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

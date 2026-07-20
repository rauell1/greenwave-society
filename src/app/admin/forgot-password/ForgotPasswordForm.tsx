"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        if (data.resetUrl) setResetUrl(data.resetUrl);
      } else {
        setError(data.error ?? "Request failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.975_0.015_85)]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#1A5C38] px-8 py-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Greenwave Society" width={64} height={64} className="rounded-2xl object-contain" />
          <p className="text-white font-bold text-lg tracking-wide font-serif">GREENWAVE SOCIETY</p>
          <p className="text-green-200 text-sm">Password Reset</p>
        </div>
        <div className="px-8 py-8">
          {sent ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="text-4xl text-green-600">&#10003;</div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {resetUrl
                  ? "SMTP is not configured. Copy the reset link below and open it in your browser:"
                  : "If your email is on the authorised list, a reset link has been sent. Check your inbox."}
              </p>
              {resetUrl && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 break-all text-left">
                  {resetUrl}
                </div>
              )}
              <Link href="/admin" className="text-sm text-[#1A5C38] hover:underline">&larr; Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Enter your authorised email address and we will send you a link to reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[#1A5C38] text-white rounded-lg py-2.5 font-medium text-sm hover:bg-[#154d2f] disabled:opacity-50 transition-colors">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link href="/admin" className="text-xs text-center text-gray-400 hover:text-gray-700">&larr; Back to sign in</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

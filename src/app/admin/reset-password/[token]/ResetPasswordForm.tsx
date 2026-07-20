"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password, confirm }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/admin"), 2500);
      } else {
        setError(data.error ?? "Reset failed. The link may have expired.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.975_0.015_85)]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#1A5C38] px-8 py-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Greenwave Society" width={64} height={64} className="rounded-xl object-contain" />
          <p className="text-white font-bold text-lg tracking-wide font-serif">GREENWAVE SOCIETY</p>
          <p className="text-green-200 text-sm">Set New Password</p>
        </div>
        <div className="px-8 py-8">
          {success ? (
            <div className="text-center flex flex-col gap-3">
              <div className="text-4xl text-green-600">&#10003;</div>
              <p className="text-sm text-gray-700">Password updated successfully. Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">Choose a new password for your admin account. It must be at least 8 characters.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="At least 8 characters"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[#1A5C38] text-white rounded-lg py-2.5 font-medium text-sm hover:bg-[#154d2f] disabled:opacity-50 transition-colors">
                {loading ? "Updating..." : "Update Password"}
              </button>
              <Link href="/admin" className="text-xs text-center text-gray-400 hover:text-gray-700">&larr; Back to sign in</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

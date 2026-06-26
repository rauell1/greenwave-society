"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Step = "email" | "password" | "set-password";

export default function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep]         = useState<Step>("email");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const em = email.trim().toLowerCase();
    if (!em.includes("@")) { setError("Enter a valid email address."); return; }
    setStep("password");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else if (data.code === "NO_PASSWORD") {
        setStep("set-password");
        setPassword("");
      } else {
        setError(data.error ?? "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/setup-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, confirm }),
      });
      const data = await res.json();
      if (data.success) {
        const loginRes  = await fetch("/api/admin/login", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
          router.push("/admin/dashboard");
          router.refresh();
        } else {
          setStep("password");
          setPassword("");
          setError("Password set. Please sign in.");
        }
      } else {
        setError(data.error ?? "Failed to set password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.975_0.015_85)]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#1A5C38] px-8 py-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Greenwave Society" width={64} height={64} className="rounded-full" />
          <p className="text-white font-bold text-lg tracking-wide font-serif">GREENWAVE SOCIETY</p>
          <p className="text-green-200 text-sm">Admin Dashboard</p>
        </div>

        <div className="px-8 py-8">
          <div className="flex items-center gap-2 mb-6">
            {(["email","password"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold " +
                  (step === s || (step === "set-password" && s === "password")
                    ? "bg-[#1A5C38] text-white"
                    : (i === 0 && (step === "password" || step === "set-password"))
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-400")
                }>{i + 1}</div>
                <span className="text-xs text-gray-400">{s === "email" ? "Email" : "Password"}</span>
                {i < 1 && <div className="w-6 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          {step === "email" && (
            <form onSubmit={handleEmailNext} className="flex flex-col gap-4">
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
              <button type="submit" className="w-full bg-[#1A5C38] text-white rounded-lg py-2.5 font-medium text-sm hover:bg-[#154d2f] transition-colors">
                Continue
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-3 truncate">Signing in as <strong>{email}</strong></p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
                />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[#1A5C38] text-white rounded-lg py-2.5 font-medium text-sm hover:bg-[#154d2f] disabled:opacity-50 transition-colors">
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <div className="flex justify-between text-xs text-gray-400">
                <button type="button" onClick={() => { setStep("email"); setPassword(""); setError(""); }} className="hover:text-gray-700">
                  &larr; Change email
                </button>
                <Link href="/admin/forgot-password" className="hover:text-[#1A5C38]">Forgot password?</Link>
              </div>
            </form>
          )}

          {step === "set-password" && (
            <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-xs text-green-800">
                Welcome! You are signing in for the first time. Please set a password for your account.
              </div>
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
                {loading ? "Setting password..." : "Set Password & Sign In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

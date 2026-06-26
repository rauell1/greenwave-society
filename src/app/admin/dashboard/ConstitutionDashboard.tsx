"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Sig = {
  id: string;
  status: string;
  token: string;
  signedAt: string | null;
  emailSentAt: string | null;
  rejectionReason: string | null;
};

type Leader = {
  id: string;
  name: string;
  role: string;
  email: string;
  signature: Sig | null;
};

interface Props {
  leaders: Leader[];
  signedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  signed:   "bg-green-100 text-green-800 border border-green-300",
  pending:  "bg-amber-50  text-amber-800  border border-amber-300",
  rejected: "bg-red-50    text-red-800    border border-red-300",
};

const STATUS_LABEL: Record<string, string> = {
  signed:   "Signed",
  pending:  "Pending",
  rejected: "Rejected",
};

const DEFAULT_LEADERS = [
  { name: "Martin Kyalo",     role: "Chief Executive Officer (CEO)" },
  { name: "Njeri Njoroge",    role: "Chief Operating Officer (COO)" },
  { name: "Eugene Shadrack",  role: "Chief Innovation Officer (CIO)" },
  { name: "Mark Katana",      role: "Chief Strategy and Well-being Officer (CSWO)" },
  { name: "Roy Okola Otieno", role: "Head of Design" },
  { name: "Roy John",         role: "Design Assistant" },
];

export default function ConstitutionDashboard({ leaders, signedCount, pendingCount, rejectedCount }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId]     = useState<string | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [copied, setCopied]           = useState<string | null>(null);
  const [showSetup, setShowSetup]     = useState(leaders.length === 0);
  const [setupEmails, setSetupEmails] = useState<Record<string, string>>({});
  const [seedLoading, setSeedLoading] = useState(false);

  const total  = leaders.length;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  function notify(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  async function handleSend(leaderId: string) {
    setLoadingId(leaderId);
    try {
      const res  = await fetch("/api/admin/send-invite", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ leaderId }),
      });
      const data = await res.json();
      if (data.success) {
        notify(data.emailSent ? "Invite email sent." : "Link generated (copy it below — no SMTP configured).");
        if (data.signingUrl) {
          await navigator.clipboard.writeText(data.signingUrl).catch(() => {});
          setCopied(leaderId);
          setTimeout(() => setCopied(null), 3000);
        }
        router.refresh();
      } else {
        notify(data.error ?? "Failed to send invite", "err");
      }
    } finally {
      setLoadingId(null);
    }
  }

  function copyLink(leader: Leader) {
    if (!leader.signature) return;
    const url = `${appUrl}/sign/${leader.signature.token}`;
    navigator.clipboard.writeText(url);
    setCopied(leader.id);
    setTimeout(() => setCopied(null), 3000);
  }

  async function handleSeed() {
    setSeedLoading(true);
    const payload = DEFAULT_LEADERS.map(l => ({
      ...l,
      email: setupEmails[l.name] ?? "",
    }));
    if (payload.some(l => !l.email)) {
      notify("Please enter all email addresses", "err");
      setSeedLoading(false);
      return;
    }
    const res  = await fetch("/api/admin/seed", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ leaders: payload }),
    });
    const data = await res.json();
    if (data.success) {
      notify("Leaders added successfully.");
      setShowSetup(false);
      router.refresh();
    } else {
      notify(data.error ?? "Seed failed", "err");
    }
    setSeedLoading(false);
  }

  return (
    <div className="min-h-screen bg-[oklch(0.975_0.015_85)]">
      <header className="bg-[#1A5C38] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
            <div>
              <p className="font-bold text-base font-serif tracking-wide">GREENWAVE SOCIETY</p>
              <p className="text-green-200 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-green-200 hover:text-white text-sm border border-green-600 hover:border-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {toast && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${toast.type === "ok" ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
            {toast.msg}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A5C38] font-serif">Executive Constitution Signing</h1>
          <p className="text-gray-600 text-sm mt-1">Version 1.0 &bull; June 2026</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Signed",   count: signedCount,   color: "bg-green-50 border-green-300 text-green-800" },
            { label: "Pending",  count: pendingCount,  color: "bg-amber-50 border-amber-300 text-amber-800" },
            { label: "Rejected", count: rejectedCount, color: "bg-red-50 border-red-300 text-red-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border px-6 py-4 ${s.color}`}>
              <p className="text-3xl font-bold">{s.count}<span className="text-base font-normal ml-1">/ {total || 6}</span></p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Overall completion</span>
              <span>{signedCount}/{total} signed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#1A5C38] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? (signedCount / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {showSetup && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-200">
            <h2 className="font-bold text-lg text-[#1A5C38] mb-1 font-serif">Setup Executive Leaders</h2>
            <p className="text-sm text-gray-500 mb-5">
              Enter the email address for each Executive Leader. Each Leader will receive a unique, secure signing link.
            </p>
            <div className="grid gap-3">
              {DEFAULT_LEADERS.map(l => (
                <div key={l.name} className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{l.name}</p>
                    <p className="text-xs text-gray-500">{l.role}</p>
                  </div>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={setupEmails[l.name] ?? ""}
                    onChange={e => setSetupEmails(p => ({ ...p, [l.name]: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSeed}
              disabled={seedLoading}
              className="mt-5 bg-[#1A5C38] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#154d2f] disabled:opacity-50 transition-colors"
            >
              {seedLoading ? "Saving..." : "Save Leaders"}
            </button>
          </div>
        )}

        {leaders.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-base text-[#1A5C38] font-serif">Executive Leaders</h2>
              <button
                onClick={() => setShowSetup(v => !v)}
                className="text-xs text-gray-500 hover:text-[#1A5C38] border border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {showSetup ? "Hide Setup" : "Add / Edit Leaders"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Leader</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Signed</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invite Sent</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaders.map(leader => {
                    const sig    = leader.signature;
                    const status = sig?.status ?? "no record";
                    return (
                      <tr key={leader.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{leader.name}</p>
                          <p className="text-xs text-gray-400">{leader.email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-[200px]">{leader.role}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
                            {STATUS_LABEL[status] ?? status}
                          </span>
                          {status === "rejected" && sig?.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1 max-w-[180px] truncate" title={sig.rejectionReason}>
                              Reason: {sig.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs">
                          {sig?.signedAt
                            ? new Date(sig.signedAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs">
                          {sig?.emailSentAt
                            ? new Date(sig.emailSentAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })
                            : "Not sent"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {sig && (
                              <button
                                onClick={() => copyLink(leader)}
                                className="text-xs border border-gray-300 text-gray-600 hover:border-[#1A5C38] hover:text-[#1A5C38] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                              >
                                {copied === leader.id ? "Copied!" : "Copy Link"}
                              </button>
                            )}
                            {sig && sig.status !== "signed" && (
                              <button
                                onClick={() => handleSend(leader.id)}
                                disabled={loadingId === leader.id}
                                className="text-xs bg-[#1A5C38] text-white px-3 py-1.5 rounded-lg hover:bg-[#154d2f] disabled:opacity-50 transition-colors whitespace-nowrap"
                              >
                                {loadingId === leader.id ? "Sending..." : sig.emailSentAt ? "Resend" : "Send Invite"}
                              </button>
                            )}
                            {sig?.status === "signed" && (
                              <span className="text-xs text-green-600 font-medium">Complete</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6 text-center">
          Signing links are unique per leader. All signatures are recorded with timestamp and IP address for legal verification.
        </p>
      </main>
    </div>
  );
}

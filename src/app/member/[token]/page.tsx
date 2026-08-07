"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Download, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface MemberInfo {
  fullName: string;
  email: string;
  county: string;
  occupation: string;
  interests: string[];
  loginCount: number;
  approvedAt: string | null;
  memberSince: string;
}

const HEARTBEAT_MS = 30_000;

export default function MemberPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken]       = useState<string | null>(null);
  const [info, setInfo]         = useState<MemberInfo | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [online, setOnline]     = useState(true);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [confirmInput, setConfirmInput]         = useState("");
  const [deleting, setDeleting]                 = useState(false);
  const [deleteError, setDeleteError]           = useState<string | null>(null);
  const [isDeleted, setIsDeleted]               = useState(false);

  // Resolve params (Next 15 async params)
  useEffect(() => {
    params.then(p => setToken(p.token));
  }, [params]);

  // Login ping on mount
  useEffect(() => {
    if (!token) return;
    fetch(`/api/member/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); }
        else         { setInfo(d); }
      })
      .catch(() => setError("Could not load your profile. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  // Heartbeat + logout ping
  const ping = useCallback((leaving = false) => {
    if (!token || isDeleted) return;
    navigator.sendBeacon
      ? navigator.sendBeacon(`/api/member/${token}`, JSON.stringify({ leaving }))
      : fetch(`/api/member/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leaving }),
          keepalive: true,
        });
  }, [token, isDeleted]);

  useEffect(() => {
    if (!token || !info || isDeleted) return;
    const iv = setInterval(() => ping(false), HEARTBEAT_MS);
    const onVisChange = () => {
      if (document.visibilityState === "hidden") { setOnline(false); ping(true); }
      else                                        { setOnline(true);  ping(false); }
    };
    const onUnload = () => ping(true);
    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [token, info, ping, isDeleted]);

  const handleExportData = () => {
    if (!token) return;
    window.open(`/api/member/${token}/export`, "_blank");
  };

  const handleDeleteAccount = async () => {
    if (confirmInput.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Please type DELETE in capital letters to confirm.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/member/${token}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account.");
      }

      setIsDeleted(true);
      setShowDeleteModal(false);
    } catch (err: any) {
      setDeleteError(err.message || "An error occurred while attempting deletion.");
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" }) : "n/a";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1A5C38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isDeleted) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1A5C38]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account & Data Erased</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Your member profile and all associated personal data have been permanently deleted from our records in accordance with privacy regulations.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-[#1A5C38] hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-10 max-w-md text-center">
          <p className="text-lg font-bold text-red-600 mb-2">Invalid Link</p>
          <p className="text-sm text-gray-500 mb-6">{error ?? "This member link is not recognised."}</p>
          <Link href="/" className="text-sm text-[#1A5C38] underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const occ = info.occupation.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="bg-[#1A5C38] text-white py-5 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Greenwave Society" className="h-9 w-9 rounded-xl object-contain" />
            <div>
              <p className="font-bold font-serif tracking-wide text-sm">GREENWAVE SOCIETY</p>
              <p className="text-green-200 text-xs">Member Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${online ? "bg-green-400" : "bg-gray-400"}`} />
            <span className="text-xs text-green-200">{online ? "Online" : "Away"}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="w-14 h-14 rounded-full bg-[#1A5C38] flex items-center justify-center text-white text-2xl font-bold font-serif mb-3">
                {info.fullName.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{info.fullName}</h1>
              <p className="text-sm text-gray-500">{info.email}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold shrink-0">Active Member</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="County"       value={info.county} />
            <Stat label="Occupation"   value={occ} />
            <Stat label="Member Since" value={fmt(info.memberSince)} />
            <Stat label="Approved"     value={fmt(info.approvedAt)} />
            <Stat label="Total Visits" value={String(info.loginCount)} />
          </div>

          {info.interests.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Thematic Interests</p>
              <div className="flex flex-wrap gap-2">
                {info.interests.map(i => (
                  <span key={i} className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[#1A5C38] text-xs font-medium">{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1">What happens next?</p>
          <p>The Greenwave Society team will be in touch with programme updates, events, and opportunities to get involved. Stay connected at{" "}
            <a href="https://greenwavesociety.org" className="text-[#1A5C38] underline">greenwavesociety.org</a>.
          </p>
        </div>

        {/* Data Rights & Privacy Compliance Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-[#1A5C38]" />
            <h2>Privacy & Data Rights (Compliance)</h2>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            In accordance with global data protection laws (including GDPR), you have full control over your personal data. You may download a copy of all information stored about you or permanently delete your account at any time.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600" />
              Export My Personal Data (JSON)
            </button>

            <button
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteError(null);
                setConfirmInput("");
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              Delete Account & Data
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          This page is unique to your membership. Do not share the link.
        </p>
      </main>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative space-y-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Confirm Account Deletion</h3>
                <p className="text-xs text-red-600 font-medium">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-xs text-red-950 space-y-2 leading-relaxed">
              <p className="font-semibold">The following data will be permanently purged:</p>
              <ul className="list-disc list-inside space-y-1 text-red-900">
                <li>Member profile and registration records</li>
                <li>Portal access token & login history</li>
                <li>Newsletter subscription records matching your email</li>
                <li>Contact form submissions matching your email</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                To confirm, type <strong className="text-red-600 font-bold select-all">DELETE</strong> in the box below:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-wider"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || confirmInput.trim().toUpperCase() !== "DELETE"}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Permanently Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

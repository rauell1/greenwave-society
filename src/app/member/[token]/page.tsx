"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
    if (!token) return;
    navigator.sendBeacon
      ? navigator.sendBeacon(`/api/member/${token}`, JSON.stringify({ leaving }))
      : fetch(`/api/member/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leaving }),
          keepalive: true,
        });
  }, [token]);

  useEffect(() => {
    if (!token || !info) return;
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
  }, [token, info, ping]);

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" }) : "n/a";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1A5C38] border-t-transparent rounded-full animate-spin" />
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
            <img src="/logo.png" alt="Greenwave Society" className="h-9 w-9 rounded-full" />
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

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-5">
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
            <a href="https://greenwave.rauell.systems" className="text-[#1A5C38] underline">greenwave.rauell.systems</a>.
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center">
          This page is unique to your membership. Do not share the link.
        </p>
      </main>
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

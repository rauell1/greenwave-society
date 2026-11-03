"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  Share2,
  Lock,
  ArrowLeft,
  FileText,
  AlertOctagon,
  CheckCircle2,
  Camera,
} from "lucide-react";
import type { VerifiedGraduand } from "@/lib/events/graduand-registry";

interface CertificateClientProps {
  initialGraduand: VerifiedGraduand | null;
  error?: string | null;
}

export function CertificateClient({ initialGraduand, error: initialError }: CertificateClientProps) {
  const [graduand, setGraduand] = useState<VerifiedGraduand | null>(initialGraduand);
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(initialError || null);
  const [copied, setCopied] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setLookupError(null);

    try {
      const res = await fetch("/api/events/graduation-cohort-1/verify-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLookupError(data.error || "Could not find a certified graduand under this email.");
        toast.error("Access Restricted: Not on the certified graduand roll.");
        return;
      }

      setGraduand(data.graduand);
      toast.success(`Verified: Welcome, ${data.graduand.fullName}!`);
    } catch {
      setLookupError("Network error verifying certificate. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyLink = async () => {
    if (!graduand) return;
    const url = `${window.location.origin}/events/graduation-cohort-1/certificate?token=${graduand.accessToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Permanent certificate pass link copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareLinkedIn = () => {
    if (!graduand) return;
    const url = `${window.location.origin}/events/graduation-cohort-1/certificate?token=${graduand.accessToken}`;
    const text = `I am proud to share that I have officially graduated from the Young Person's Guide to Systems Change (YPG Cohort I) Fellowship with Greenwave Society and The 50 Percent! View my verified digital certificate here:`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white rounded-xl gap-1.5 text-xs">
            <Link href="/events/graduation-cohort-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Convocation Retrospective</span>
            </Link>
          </Button>

          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs font-mono uppercase">
            Official Credential Portal
          </Badge>
        </div>

        {/* View 1: When Graduand is NOT loaded (Lookup Form) */}
        {!graduand && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Graduand Certificate Pass
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Access is strictly restricted to the 12 certified leaders of YPG: Young Person&apos;s Guide to Systems Change Cohort I. Enter your email to verify your credential.
              </p>
            </div>

            {lookupError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-semibold">Access Restricted</strong>
                  <p className="leading-relaxed text-[11px] opacity-90">{lookupError}</p>
                </div>
              </div>
            )}

            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <form onSubmit={handleLookup} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                      Registered Graduand Email
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. your.email@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white rounded-xl h-11 text-sm focus:border-emerald-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 text-sm shadow-md transition-colors"
                  >
                    {isLoading ? "Verifying Credential..." : "Verify & Access My Certificate Pass"}
                  </Button>
                </form>

                <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
                  Credential verification managed by Greenwave Society &bull; The 50 Percent
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View 2: When Graduand is VERIFIED */}
        {graduand && (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            
            {/* Header Identity Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-emerald-950/60 to-slate-950 border-2 border-emerald-500/40 shadow-2xl space-y-4 text-center sm:text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <Badge className="bg-emerald-500 text-slate-950 font-bold text-xs uppercase font-mono px-3 py-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Officially Conferred
                    </Badge>
                    <Badge variant="outline" className="border-gold/50 text-gold text-xs font-mono uppercase">
                      Cohort I Graduand
                    </Badge>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
                    {graduand.fullName}
                  </h1>
                  <p className="text-emerald-400 text-xs sm:text-sm font-medium">
                    Young Person&apos;s Guide to Systems Change Fellowship
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 text-xs gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Link Copied" : "Copy Pass Link"}</span>
                  </Button>

                  <Button
                    onClick={handleShareLinkedIn}
                    size="sm"
                    className="rounded-xl bg-[#0077B5] hover:bg-[#0077B5]/90 text-white text-xs gap-1.5 font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on LinkedIn</span>
                  </Button>
                </div>
              </div>

              {/* Credential Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Credential ID</span>
                  <strong className="text-emerald-400 font-mono text-sm">{graduand.credentialId}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Ceremony Pass</span>
                  <strong className="text-white font-mono text-sm">{graduand.ticketNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Conferment Date</span>
                  <strong className="text-white">{graduand.conferredAt}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Awarding Bodies</span>
                  <strong className="text-white">Greenwave &bull; The 50%</strong>
                </div>
              </div>
            </div>

            {/* Certificate Display Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-black text-xl text-white">
                    Official Digital Certificate of Completion
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-resolution credential verifiable for academic, fellowship, and career portfolios.
                  </p>
                </div>

                {/* Download Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button asChild size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md">
                    <a href={graduand.certificateUrl} download={`${graduand.slug}-certificate.png`}>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG (2000x1414)</span>
                    </a>
                  </Button>

                  <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-700 hover:bg-slate-800 text-white text-xs gap-1.5 font-semibold">
                    <a href={graduand.pdfUrl} download={`${graduand.slug}-certificate.pdf`}>
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      <span>Download PDF</span>
                    </a>
                  </Button>
                </div>
              </div>

              {/* Certificate Image Frame */}
              <div className="relative aspect-[2000/1414] w-full rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl bg-black">
                <Image
                  src={graduand.certificateUrl}
                  alt={`Official Certificate of Completion awarded to ${graduand.fullName}`}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1000px"
                  className="object-contain"
                />
              </div>

              {/* Signatories & Verification Notice */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-white block font-sans">Authorized Institutional Signatories:</strong>
                    <span>Nolita Mvunelo &bull; Mat&iacute;as Ignacio Lara (The 50 Percent) &bull; Martin Kyalo (Greenwave Society)</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setGraduand(null);
                    setEmailInput("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Switch Graduand
                </Button>
              </div>

            </div>

            {/* Additional Resources Strip */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <strong className="text-sm text-white block">Official Ceremony Photo Album</strong>
                  <p className="text-xs text-slate-400">View 296 high-resolution ceremony photos from Ubunifu Hub.</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-700 text-xs shrink-0">
                  <Link href="/events/graduation-cohort-1/album">
                    <Camera className="w-3.5 h-3.5 mr-1 text-gold" />
                    Open Album
                  </Link>
                </Button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <strong className="text-sm text-white block">Official Word Convocation Report</strong>
                  <p className="text-xs text-slate-400">Download the 10-section executive post-session report (.docx).</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-700 text-xs shrink-0">
                  <a href="/downloads/YPG_Cohort_I_Graduation_Comprehensive_Event_Report.docx" download>
                    <FileText className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Report (.docx)
                  </a>
                </Button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

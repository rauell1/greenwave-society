"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock,
  Printer,
  Share2,
  Award,
  Store,
  Users,
  Sparkles,
  ChevronRight,
  Leaf,
  AlertOctagon,
  XCircle,
  Camera,
} from "lucide-react";

export interface PassProps {
  id: string;
  ticketNumber: string;
  fullName: string;
  email: string;
  role: string;
  rawRole: string;
  isGraduand: boolean;
  isVendor: boolean;
  vendorName: string | null;
  vendorCategory: string | null;
  guestCount: number;
  attendanceStatus: "not_checked_in" | "checked_in" | "cancelled";
  checkedInAt: string | null;
  qrCodeDataUrl: string;
  isConcluded?: boolean;
  concludedDate?: string;
  certificatePassUrl?: string | null;
  credentialId?: string | null;
  event: {
    title: string;
    startsAt: string;
    location: string;
    slug?: string;
  };
}

export function PassClient({ pass }: { pass: PassProps }) {
  const [copied, setCopied] = useState(false);

  const isCheckedIn = pass.attendanceStatus === "checked_in";

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Pass link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Failed to copy pass link");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto w-full space-y-6">
        
        {/* Top Brand Header */}
        <div className="text-center space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase transition-colors"
          >
            <Leaf className="w-4 h-4" />
            Greenwave Society
          </Link>
          <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
            Official Event Admission Pass
          </h1>
          <p className="text-xs text-rose-400 font-medium">
            Event Concluded &bull; Pass Expired &amp; Invalid for Entry
          </p>
        </div>

        {/* Prominent Event Concluded / Pass Invalid Alert */}
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs flex items-start gap-3.5 shadow-xl">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-rose-200 uppercase tracking-wider font-mono">
              Event Concluded &bull; Pass Expired &amp; Invalid
            </div>
            <p className="text-rose-200/90 leading-relaxed text-[11px]">
              This event concluded on <strong>Friday, 30th October 2026</strong> at Ubunifu Hub, Nairobi. Admission passes are permanently expired and can no longer be used for door check-in or venue entry.
            </p>
          </div>
        </div>

        {/* Graduand Verified Certificate Alert */}
        {pass.certificatePassUrl && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-950/40 to-slate-900 border-2 border-amber-500/50 text-xs flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-gold flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="font-bold text-sm text-gold uppercase tracking-wider font-mono">
                  Official Certificate Ready
                </div>
                <p className="text-slate-300 text-[11px]">
                  Your YPG Cohort I Certificate of Completion ({pass.credentialId || "Verified"}) is available for instant download in high-res PNG and PDF.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs gap-1.5 shrink-0 shadow-md">
              <Link href={pass.certificatePassUrl}>
                <span>Open Certificate</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* Pass Card Container */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 bg-slate-900/90 backdrop-blur-xl relative">
          
          {/* Header Banner */}
          <div
            className={`p-6 text-white text-center relative overflow-hidden ${
              pass.isGraduand
                ? "bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 border-b-4 border-amber-500/50"
                : pass.isVendor
                ? "bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 border-b-4 border-amber-500/50"
                : "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b-4 border-rose-500/50"
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <Badge className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 border-none shadow-md">
                <XCircle className="w-3.5 h-3.5 mr-1 text-white" /> Pass Expired &bull; Invalid
              </Badge>
              <Badge variant="outline" className="border-rose-400/40 text-rose-300 text-[10px] font-mono uppercase bg-rose-500/10">
                Event Concluded
              </Badge>
              {isCheckedIn && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-mono">
                  Attended on 30 Oct
                </Badge>
              )}
            </div>

            <h2 className="font-serif font-black text-2xl tracking-tight text-white">
              {pass.isGraduand
                ? "Graduand Pass (Concluded)"
                : pass.isVendor
                ? "Vendor Pass (Concluded)"
                : "Admission Pass (Concluded)"}
            </h2>
            <p className="text-white/70 text-xs mt-1 max-w-xs mx-auto line-clamp-2">
              {pass.event.title}
            </p>
          </div>

          {/* Ticket Information & QR */}
          <div className="p-6 space-y-6">
            
            {/* Attendee Details */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  {pass.isVendor ? "Vendor / Brand" : "Attendee"}
                </span>
                <span className="text-xl font-serif font-bold text-white block mt-0.5">
                  {pass.isVendor ? (pass.vendorName || pass.fullName) : pass.fullName}
                </span>
                {pass.isVendor && pass.fullName && (
                  <span className="text-xs text-slate-400 block">
                    Contact: {pass.fullName}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={`font-semibold text-xs ${
                      pass.isGraduand
                        ? "border-amber-400/50 text-amber-300 bg-amber-400/10"
                        : pass.isVendor
                        ? "border-emerald-400/50 text-emerald-300 bg-emerald-400/10"
                        : "border-slate-700 text-slate-300 bg-slate-800"
                    }`}
                  >
                    {pass.isGraduand ? (
                      <Award className="w-3 h-3 mr-1 text-amber-300" />
                    ) : pass.isVendor ? (
                      <Store className="w-3 h-3 mr-1 text-emerald-300" />
                    ) : (
                      <Users className="w-3 h-3 mr-1" />
                    )}
                    {pass.role}
                  </Badge>

                  {pass.guestCount > 1 && (
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                      Party of {pass.guestCount}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Ticket Number
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 block mt-0.5">
                  {pass.ticketNumber}
                </span>
              </div>
            </div>

            {/* Special Instructions */}
            {pass.isGraduand && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Graduand Protocol:</strong> Arrive at 10:00 AM at Ubunifu Hub to receive your graduation sash, certificate folder, and take cohort group photos.
                </div>
              </div>
            )}

            {pass.isVendor && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Vendor Logistics:</strong> Setup begins at 9:30 AM. Tables and chairs provided. Strictly zero single-use plastics.
                </div>
              </div>
            )}

            {/* QR Code Container (Deactivated & Invalidated) */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-rose-500/30 relative overflow-hidden">
              <div className="relative p-3 bg-white rounded-2xl shadow-xl inline-block mb-3 filter grayscale contrast-125 opacity-40">
                <Image
                  src={pass.qrCodeDataUrl}
                  alt={`Concluded Door Pass QR Code for ${pass.fullName}`}
                  width={220}
                  height={220}
                  className="rounded-lg"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-slate-950/30 rounded-2xl flex items-center justify-center p-2">
                  <div className="transform -rotate-12 bg-rose-600 text-white font-mono font-black text-xs sm:text-sm uppercase px-3 py-1.5 rounded-lg border-2 border-white shadow-2xl tracking-widest text-center">
                    INVALID &bull; CONCLUDED
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Door Scanner Deactivated &bull; Pass Expired</span>
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs text-center mt-1 leading-relaxed">
                {isCheckedIn
                  ? `This pass was recorded as attended on event day at ${pass.checkedInAt ? new Date(pass.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "the door"}. The event is now concluded.`
                  : "This admission pass is permanently expired and invalid. Venue admission is closed."}
              </p>
            </div>

            {/* Venue & Time Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Friday, 30 Oct 2026 (Concluded)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ubunifu Hub, Nairobi, Kenya</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Button
                asChild
                className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs shadow-md gap-1.5"
              >
                <Link href="/events/graduation-cohort-1/album">
                  <Camera className="w-4 h-4" />
                  <span>View 296 Ceremony Photos</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
              >
                <Link href="/events/graduation-cohort-1">
                  <Award className="w-4 h-4 text-gold" />
                  <span>Ceremony Retrospective</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800 text-xs gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Record</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800 text-xs gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? "Link Copied!" : "Share Link"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Back Link to Event Page */}
        <div className="text-center pt-2">
          <Link
            href={pass.isVendor ? "/events/community-market" : "/events/graduation-cohort-1"}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <span>Return to Event Information Page</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 pt-8">
        Greenwave Society &bull; YPG Cohort I &bull; Nairobi, Kenya
      </footer>
    </div>
  );
}

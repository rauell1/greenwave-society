"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { toast } from "sonner";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Share2,
  Award,
  Store,
  Users,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Leaf,
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

  const calendarData = {
    title: pass.isVendor
      ? "Empower 360 Community Market - Vendor Stall Setup & Showcase"
      : pass.event.title,
    description: pass.isVendor
      ? "Vendor stall setup (9:30 AM) and showcase at Ubunifu Hub, Nairobi for Greenwave Society Empower 360 Cohort I Graduation."
      : "Graduation celebration for Greenwave Society Empower 360 Ad Hoc Cohort I changemakers with community market.",
    location: pass.event.location,
    startsAt: pass.isVendor ? "2026-10-30T06:30:00Z" : "2026-10-30T07:30:00Z",
    endsAt: "2026-10-30T12:00:00Z",
    url: window?.location?.href || "https://greenwavesociety.org/events/graduation-cohort-1",
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
          <p className="text-xs text-slate-400">
            Present this scannable QR ticket to the Executive Door Station upon arrival
          </p>
        </div>

        {/* Pass Card Container */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-900/90 backdrop-blur-xl relative">
          
          {/* Header Banner */}
          <div
            className={`p-6 text-white text-center relative overflow-hidden ${
              pass.isGraduand
                ? "bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950 border-b-4 border-amber-400"
                : pass.isVendor
                ? "bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 border-b-4 border-amber-400"
                : "bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 border-b-4 border-emerald-500"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {isCheckedIn ? (
                <Badge className="bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-3 py-1 border-none shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Checked In
                </Badge>
              ) : (
                <Badge className="bg-white/20 text-white font-mono text-[11px] uppercase tracking-wider px-3 py-0.5 border-none">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-300" /> Door Pass Verified
                </Badge>
              )}
            </div>

            <h2 className="font-serif font-black text-2xl tracking-tight text-white">
              {pass.isGraduand
                ? "Graduand Official Pass"
                : pass.isVendor
                ? "Vendor Stall Pass"
                : "Digital Entry Ticket"}
            </h2>
            <p className="text-white/80 text-xs mt-1 max-w-xs mx-auto line-clamp-2">
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

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <div className="p-3 bg-white rounded-2xl shadow-xl inline-block mb-3">
                <Image
                  src={pass.qrCodeDataUrl}
                  alt={`Door Pass QR Code for ${pass.fullName}`}
                  width={220}
                  height={220}
                  className="rounded-lg"
                  priority
                  unoptimized
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Executive Door Scanner Code</span>
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs text-center mt-1">
                {isCheckedIn
                  ? `Checked in at ${pass.checkedInAt ? new Date(pass.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "the door"}. Enjoy the event!`
                  : "Keep your screen brightness high. Present this code at the reception desk for instant check-in."}
              </p>
            </div>

            {/* Venue & Time Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Friday, 30 Oct 2026 {pass.isVendor ? "(9:30 AM Setup)" : "(10:30 AM EAT)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ubunifu Hub, Nairobi, Kenya</span>
              </div>
            </div>

            {/* Venue Google Maps Link */}
            <a
              href="https://maps.google.com/?q=Ubunifu+Hub,+Nairobi,+Kenya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Get directions to Ubunifu Hub</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <AddToCalendarButton event={calendarData} size="sm" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800 gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800 gap-1.5"
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
        Greenwave Society &bull; Empower 360 Cohort I &bull; Nairobi, Kenya
      </footer>
    </div>
  );
}

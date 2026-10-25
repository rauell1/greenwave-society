"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Send,
  MailCheck,
  AlertTriangle,
  Award,
  Store,
  Users,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";

interface EventBroadcastPanelProps {
  eventId: string;
  totalCount: number;
  graduandsCount: number;
  vendorsCount: number;
  guestsCount: number;
  remindedCount: number;
}

export default function EventBroadcastPanel({
  eventId,
  totalCount,
  graduandsCount,
  vendorsCount,
  guestsCount,
  remindedCount,
}: EventBroadcastPanelProps) {
  const router = useRouter();
  const [segment, setSegment] = useState<"all" | "graduands" | "vendors" | "guests">("all");
  const [forceResend, setForceResend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const getTargetCount = () => {
    switch (segment) {
      case "graduands":
        return graduandsCount;
      case "vendors":
        return vendorsCount;
      case "guests":
        return guestsCount;
      case "all":
      default:
        return totalCount;
    }
  };

  const getSegmentTitle = () => {
    switch (segment) {
      case "graduands":
        return "Cohort I Graduands";
      case "vendors":
        return "Market Vendors";
      case "guests":
        return "General Guests & Supporters";
      case "all":
      default:
        return "All Event Attendees & Vendors";
    }
  };

  async function handleSendBroadcast() {
    setIsSending(true);
    setLastResult(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/send-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment, forceResend }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch reminders");
      }

      setLastResult(data.message);
      toast.success(data.message);
      setConfirming(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to send reminders");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/50 p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            Executive Broadcast Center
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            1-Day Event Reminder & Logistics Dispatch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver scannable QR ticket passes and tailored 24-hour arrival instructions to confirmed participants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-100/50 text-emerald-800 text-xs">
            <MailCheck className="w-3.5 h-3.5 mr-1" />
            {remindedCount} of {totalCount} Reminded
          </Badge>
        </div>
      </div>

      {/* Target Segment Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Select Target Audience:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSegment("all");
              setConfirming(false);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              segment === "all"
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>All ({totalCount})</span>
              <Users className="w-3.5 h-3.5 opacity-80" />
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">Complete Roster</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSegment("graduands");
              setConfirming(false);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              segment === "graduands"
                ? "border-amber-600 bg-amber-600 text-white shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Graduands ({graduandsCount})</span>
              <Award className="w-3.5 h-3.5 opacity-80" />
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">Cohort I Ceremony</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSegment("vendors");
              setConfirming(false);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              segment === "vendors"
                ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Vendors ({vendorsCount})</span>
              <Store className="w-3.5 h-3.5 opacity-80" />
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">Market Stalls</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSegment("guests");
              setConfirming(false);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              segment === "guests"
                ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Guests ({guestsCount})</span>
              <Users className="w-3.5 h-3.5 opacity-80" />
            </div>
            <div className="text-[11px] opacity-90 mt-0.5">Family & Friends</div>
          </button>
        </div>
      </div>

      {/* Segment Details & Email Preview Summary */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          Content Included in {getSegmentTitle()} Dispatch:
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-500">
          {segment === "graduands" && (
            <>
              <li>Arrival protocol: 10:00 AM induction check-in for sash, certificate folder, and official photo.</li>
              <li>Ceremony commencement: 10:30 AM EAT at Ubunifu Hub main hall.</li>
              <li>Embedded scannable Door Pass QR code for priority admission.</li>
            </>
          )}
          {segment === "vendors" && (
            <>
              <li>Setup logistics: Arrival at 9:30 AM EAT for stall allocation.</li>
              <li>Exhibition setup: 1 table and 2 chairs provided per reservation.</li>
              <li>Environmental policy reminder: Strictly zero single-use plastics.</li>
              <li>Embedded scannable Vendor Stall QR code.</li>
            </>
          )}
          {segment === "guests" && (
            <>
              <li>Event schedule: Doors open at 10:30 AM EAT at Ubunifu Hub, Nairobi.</li>
              <li>Seating arrangement: Reserved guest and family sections.</li>
              <li>Access to community market stalls and eco-conscious exhibitions.</li>
              <li>Embedded scannable Door Pass QR code.</li>
            </>
          )}
          {segment === "all" && (
            <>
              <li>Role-tailored email templates dynamically dispatched to each participant.</li>
              <li>Graduands receive ceremony instructions; Vendors receive 9:30 AM setup guidance; Guests receive arrival details.</li>
              <li>Every recipient receives their unique scannable QR ticket and link to their mobile pass viewer.</li>
            </>
          )}
        </ul>
      </div>

      {/* Resend Option */}
      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="forceResend"
          checked={forceResend}
          onCheckedChange={(checked) => setForceResend(Boolean(checked))}
        />
        <label
          htmlFor="forceResend"
          className="text-xs font-medium text-slate-700 cursor-pointer select-none"
        >
          Force resend to all members in this segment, even if already marked as reminded.
        </label>
      </div>

      {/* Feedback Banner */}
      {lastResult && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{lastResult}</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {!confirming ? (
          <Button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={isSending || getTargetCount() === 0}
            className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs h-10 px-4 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send 1-Day Reminder to {getSegmentTitle()} ({getTargetCount()})
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs text-amber-900 font-medium">
              Confirm sending to {getTargetCount()} recipients?
            </span>
            <Button
              type="button"
              onClick={handleSendBroadcast}
              disabled={isSending}
              className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs h-8 px-3"
            >
              {isSending ? "Sending..." : "Yes, Dispatch Now"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(false)}
              disabled={isSending}
              className="rounded-lg text-xs h-8 px-3 border-slate-300"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

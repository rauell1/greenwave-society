"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  RefreshCw,
  Clock,
  Camera,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Store,
  Users,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { QrCameraScanner } from "@/components/events/QrCameraScanner";
import Link from "next/link";

interface CheckInAttendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  status: string;
  attendanceStatus: string;
  checkedInAt: string | null;
  role: string;
  rawRole?: string;
  segmentType?: "graduand" | "vendor" | "guest";
  isGraduand?: boolean;
  isVendor?: boolean;
  vendorCategory?: string | null;
  guestCount: number;
  ticketNumber: string;
  specialInstructions?: string;
}

interface EventStats {
  totalRegistrations: number;
  checkedInCount: number;
  pendingCount: number;
  totalExpectedHeadcount: number;
  checkedInHeadcount: number;
  totalGraduands: number;
  checkedInGraduands: number;
  totalVendors: number;
  checkedInVendors: number;
  totalGuests: number;
  checkedInGuests: number;
}

interface CheckInClientProps {
  adminEmail: string;
  adminRoles?: string[];
  isExecutive?: boolean;
}

function CheckInContent({ adminEmail }: CheckInClientProps) {
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  // Single scanned pass state
  const [scannedResult, setScannedResult] = useState<{
    success: boolean;
    alreadyCheckedIn: boolean;
    registration?: CheckInAttendee;
    error?: string;
  } | null>(null);

  // Door station state
  const [stats, setStats] = useState<EventStats | null>(null);
  const [attendees, setAttendees] = useState<CheckInAttendee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<"all" | "graduand" | "vendor" | "guest">("all");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const verifyPass = useCallback((regId: string, regToken?: string | null) => {
    fetch(`/api/events/check-in?id=${encodeURIComponent(regId)}${regToken ? `&token=${encodeURIComponent(regToken)}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScannedResult({
            success: true,
            alreadyCheckedIn: data.alreadyCheckedIn,
            registration: data.registration,
          });
          if (data.alreadyCheckedIn) {
            toast.info(`Attendee already checked in: ${data.registration.fullName}`);
          } else {
            toast.success(`Check-in successful! Welcome, ${data.registration.fullName}`);
          }
        } else {
          setScannedResult({
            success: false,
            alreadyCheckedIn: false,
            error: data.error || "Invalid ticket pass",
          });
          toast.error(data.error || "Ticket verification failed");
        }
      })
      .catch(() => {
        setScannedResult({
          success: false,
          alreadyCheckedIn: false,
          error: "Connection error verifying pass",
        });
        toast.error("Network error verifying attendance");
      });
  }, []);

  const loadAttendeeList = useCallback(() => {
    setIsLoadingList(true);
    fetch("/api/events/check-in/list?slug=graduation-cohort-1-2026")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setAttendees(data.registrations);
        }
      })
      .catch(() => toast.error("Failed to load registration list"))
      .finally(() => setIsLoadingList(false));
  }, []);

  useEffect(() => {
    loadAttendeeList();
  }, [loadAttendeeList]);

  useEffect(() => {
    if (id) {
      verifyPass(id, token);
    }
  }, [id, token, verifyPass]);

  const handleManualCheckIn = async (attendeeId: string, newStatus: "checked_in" | "pending") => {
    setUpdatingId(attendeeId);
    try {
      const res = await fetch("/api/events/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: attendeeId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus === "checked_in"
            ? `Checked in ${data.registration.fullName}`
            : `Reverted ${data.registration.fullName} to pending`
        );
        loadAttendeeList();
        if (scannedResult?.registration?.id === attendeeId) {
          setScannedResult((prev) =>
            prev && prev.registration
              ? { ...prev, registration: { ...prev.registration, attendanceStatus: newStatus } }
              : null
          );
        }
      } else {
        toast.error(data.error || "Failed to update check-in");
      }
    } catch {
      toast.error("Network error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAttendees = attendees.filter((a) => {
    const matchesSegment =
      selectedSegment === "all" ||
      (selectedSegment === "graduand" && a.isGraduand) ||
      (selectedSegment === "vendor" && a.isVendor) ||
      (selectedSegment === "guest" && !a.isGraduand && !a.isVendor);

    if (!matchesSegment) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.ticketNumber.toLowerCase().includes(q) ||
      a.organization.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Admin Session Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-600/30 text-xs font-mono uppercase tracking-wider px-3 py-0.5">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Executive Team Station
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">{adminEmail}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            Door Check-in & Usher Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Empower 360 Cohort I Graduation & Community Market &bull; Ubunifu Hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs gap-1.5">
            <Link href="/admin/events">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Events
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsScannerOpen(true)}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Open Camera Scanner</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={loadAttendeeList}
            disabled={isLoadingList}
            className="rounded-xl text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Live Camera Scanner Dialog */}
      <QrCameraScanner
        isActive={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(scannedText: string) => {
          try {
            let regId = "";
            let regToken = "";

            if (scannedText.startsWith("http://") || scannedText.startsWith("https://")) {
              const url = new URL(scannedText);
              regId = url.searchParams.get("id") || "";
              regToken = url.searchParams.get("token") || "";
            } else if (scannedText.includes("id=")) {
              const params = new URLSearchParams(scannedText);
              regId = params.get("id") || "";
              regToken = params.get("token") || "";
            } else {
              regId = scannedText.trim();
            }

            if (regId) {
              verifyPass(regId, regToken);
              loadAttendeeList();
            } else {
              toast.error("Could not parse registration ID from barcode");
            }
          } catch (e) {
            toast.error("Invalid QR format scanned");
          }
        }}
      />

      {/* Scanned Result Banner */}
      {scannedResult && (
        <Card className={`border-2 shadow-lg transition-all ${
          scannedResult.success
            ? scannedResult.alreadyCheckedIn
              ? "border-amber-400 bg-amber-500/10"
              : "border-emerald-500 bg-emerald-500/10"
            : "border-red-500 bg-red-500/10"
        }`}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {scannedResult.success ? (
                  scannedResult.alreadyCheckedIn ? (
                    <Clock className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                  )
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      {scannedResult.success
                        ? scannedResult.alreadyCheckedIn
                          ? "Pass Already Verified"
                          : "Pass Verified: Checked In"
                        : "Verification Failed"}
                    </span>
                    {scannedResult.registration?.ticketNumber && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {scannedResult.registration.ticketNumber}
                      </Badge>
                    )}
                  </div>
                  {scannedResult.registration && (
                    <>
                      <h3 className="text-xl font-bold text-foreground">
                        {scannedResult.registration.fullName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge className={`text-xs ${
                          scannedResult.registration.isGraduand
                            ? "bg-gold/20 text-gold border-gold/30"
                            : scannedResult.registration.isVendor
                            ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
                            : "bg-secondary text-foreground"
                        }`}>
                          {scannedResult.registration.role}
                        </Badge>
                        <span>&bull;</span>
                        <span>{scannedResult.registration.email}</span>
                        <span>&bull;</span>
                        <span>{scannedResult.registration.phone}</span>
                        <span>&bull;</span>
                        <span>Group Size: {scannedResult.registration.guestCount}</span>
                      </div>

                      {/* Role Specific Usher Guidance Banner */}
                      {scannedResult.registration.specialInstructions && (
                        <div className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                          scannedResult.registration.isGraduand
                            ? "bg-gold/15 border-gold/30 text-amber-900 dark:text-amber-200"
                            : scannedResult.registration.isVendor
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-900 dark:text-purple-200"
                            : "bg-background/80 border-border/80 text-foreground"
                        }`}>
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <strong>Usher Action:</strong> {scannedResult.registration.specialInstructions}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {scannedResult.error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {scannedResult.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {scannedResult.registration && (
                  <Button
                    size="sm"
                    variant={scannedResult.registration.attendanceStatus === "checked_in" ? "outline" : "default"}
                    onClick={() =>
                      handleManualCheckIn(
                        scannedResult.registration!.id,
                        scannedResult.registration!.attendanceStatus === "checked_in" ? "pending" : "checked_in"
                      )
                    }
                    className="text-xs"
                  >
                    {scannedResult.registration.attendanceStatus === "checked_in"
                      ? "Revert to Pending"
                      : "Confirm Check-In"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setScannedResult(null)}
                  className="text-xs text-muted-foreground"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segmented Real-time Counts */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Total Registrations
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {stats.totalRegistrations}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {stats.checkedInCount} checked in ({stats.pendingCount} pending)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-gold font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Graduands (Cohort I)
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
              {stats.checkedInGraduands} / {stats.totalGraduands}
            </div>
            <div className="text-[11px] text-amber-800/80 dark:text-gold/80 mt-0.5">
              Certificates & reserved seats
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-800 dark:text-purple-300 font-bold flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Market Vendors
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {stats.checkedInVendors} / {stats.totalVendors}
            </div>
            <div className="text-[11px] text-purple-800/80 dark:text-purple-300/80 mt-0.5">
              Tables & chairs allocated
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 shadow-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-teal-800 dark:text-teal-300 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Venue Headcount
            </div>
            <div className="text-2xl font-bold text-teal-900 dark:text-teal-100 mt-1">
              {stats.checkedInHeadcount} / {stats.totalExpectedHeadcount}
            </div>
            <div className="text-[11px] text-teal-800/80 dark:text-teal-300/80 mt-0.5">
              Includes +1 guests & families
            </div>
          </div>
        </div>
      )}

      {/* Usher Quick Guide Accordion */}
      <div className="rounded-2xl border border-border/70 bg-secondary/15 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-foreground hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Usher & Door Team Instructions (Graduands vs Vendors vs Guests)</span>
          </div>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showGuide && (
          <div className="p-4 pt-0 space-y-3 text-xs text-muted-foreground border-t border-border/40 mt-1">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-card border border-gold/30">
                <div className="font-bold text-amber-800 dark:text-gold flex items-center gap-1 mb-1">
                  <Award className="w-3.5 h-3.5" /> Graduand Protocol
                </div>
                <p className="leading-relaxed text-[11px]">
                  1. Scan pass. Verify name on graduation roster.<br />
                  2. Issue official certificate pack & honor badge.<br />
                  3. Escort graduand to front-row reserved seating.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-purple-500/30">
                <div className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1 mb-1">
                  <Store className="w-3.5 h-3.5" /> Market Vendor Protocol
                </div>
                <p className="leading-relaxed text-[11px]">
                  1. Verify vendor category & brand name.<br />
                  2. Escort to designated market corridor table.<br />
                  3. Confirm zero single-use plastic packaging compliance.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-teal-500/30">
                <div className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5" /> Guest & Family Protocol
                </div>
                <p className="leading-relaxed text-[11px]">
                  1. Scan ticket pass & verify group size count.<br />
                  2. Issue attendee badge or wristband.<br />
                  3. Direct to open seating and refreshments area.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendee Roster Card */}
      <Card className="rounded-3xl border-border/80 shadow-sm">
        <CardHeader className="p-5 sm:p-6 border-b border-border/60">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Attendee & Vendor Roster</CardTitle>
              <CardDescription className="text-xs">
                Search and check in attendees by name, phone, or ticket code.
              </CardDescription>
            </div>

            {/* Segment Filter Switcher */}
            <div className="inline-flex p-1 bg-secondary/40 rounded-xl border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSegment("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedSegment === "all"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({attendees.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSegment("graduand")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  selectedSegment === "graduand"
                    ? "bg-gold/20 text-amber-900 dark:text-gold shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Award className="w-3 h-3" /> Graduands
              </button>
              <button
                type="button"
                onClick={() => setSelectedSegment("vendor")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  selectedSegment === "vendor"
                    ? "bg-purple-500/20 text-purple-800 dark:text-purple-300 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Store className="w-3 h-3" /> Vendors
              </button>
              <button
                type="button"
                onClick={() => setSelectedSegment("guest")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  selectedSegment === "guest"
                    ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-3 h-3" /> Guests
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by attendee name, email, phone number, ticket (GW-...), or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl text-xs h-10 bg-background"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/30 text-muted-foreground font-mono uppercase text-[10px] border-b border-border/60">
                <tr>
                  <th className="p-3 sm:p-4">Ticket</th>
                  <th className="p-3 sm:p-4">Attendee / Brand</th>
                  <th className="p-3 sm:p-4">Track / Role</th>
                  <th className="p-3 sm:p-4">Count</th>
                  <th className="p-3 sm:p-4">Status</th>
                  <th className="p-3 sm:p-4 text-right">Door Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading live attendee roster...
                    </td>
                  </tr>
                ) : filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No registrations match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((att) => {
                    const isCheckedIn = att.attendanceStatus === "checked_in";
                    return (
                      <tr
                        key={att.id}
                        className={`hover:bg-secondary/10 transition-colors ${
                          isCheckedIn ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        <td className="p-3 sm:p-4 font-mono font-bold text-foreground">
                          {att.ticketNumber}
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="font-semibold text-foreground">{att.fullName}</div>
                          <div className="text-[11px] text-muted-foreground">{att.phone}</div>
                          {att.organization && (
                            <div className="text-[10px] text-muted-foreground/80 font-mono">
                              {att.organization}
                            </div>
                          )}
                        </td>
                        <td className="p-3 sm:p-4">
                          <Badge
                            className={`text-[10px] font-medium ${
                              att.isGraduand
                                ? "bg-gold/20 text-amber-900 dark:text-gold border border-gold/40"
                                : att.isVendor
                                ? "bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            {att.role}
                          </Badge>
                        </td>
                        <td className="p-3 sm:p-4 font-mono font-bold">
                          {att.guestCount}
                        </td>
                        <td className="p-3 sm:p-4">
                          {isCheckedIn ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <Button
                            size="sm"
                            variant={isCheckedIn ? "outline" : "default"}
                            disabled={updatingId === att.id}
                            onClick={() =>
                              handleManualCheckIn(att.id, isCheckedIn ? "pending" : "checked_in")
                            }
                            className={`rounded-xl text-xs h-8 ${
                              isCheckedIn
                                ? "text-muted-foreground hover:text-foreground"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            }`}
                          >
                            {updatingId === att.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isCheckedIn ? (
                              "Undo"
                            ) : (
                              "Check In"
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CheckInClient({ adminEmail, adminRoles }: CheckInClientProps) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="pt-24 sm:pt-28 flex-1">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto px-4 py-16 text-center text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Loading check-in station...
            </div>
          }
        >
          <CheckInContent adminEmail={adminEmail} adminRoles={adminRoles} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}

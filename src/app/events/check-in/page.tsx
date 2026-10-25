"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  UserCheck,
  Camera,
  Smartphone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Store,
  Users,
} from "lucide-react";
import { QrCameraScanner } from "@/components/events/QrCameraScanner";

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

function CheckInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  // Single scanned pass state
  const [scannedResult, setScannedResult] = useState<{
    success: boolean;
    alreadyCheckedIn: boolean;
    registration?: CheckInAttendee;
    error?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
    setIsVerifying(true);
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
          error: "Network error while checking in",
        });
      })
      .finally(() => {
        setIsVerifying(false);
        loadEventList();
      });
  }, []);

  // If URL has id, perform auto check-in on page load
  useEffect(() => {
    if (id) {
      verifyPass(id, token);
    } else {
      loadEventList();
    }
  }, [id, token, verifyPass]);

  function loadEventList() {
    setIsLoadingList(true);
    fetch("/api/events/check-in/list?slug=graduation-cohort-1-2026")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setAttendees(data.registrations);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingList(false));
  }

  // Handle in-browser QR camera decode
  const handleCameraScan = useCallback((code: string) => {
    try {
      if (code.includes("/events/check-in")) {
        const url = new URL(code);
        const scannedId = url.searchParams.get("id");
        const scannedToken = url.searchParams.get("token");
        if (scannedId) {
          verifyPass(scannedId, scannedToken);
          return;
        }
      }

      // If raw ticket number (e.g. GW-XXXXXX) or ID was scanned
      const matched = attendees.find(
        (a) => a.id === code || a.ticketNumber.toLowerCase() === code.toLowerCase()
      );
      if (matched) {
        verifyPass(matched.id);
        return;
      }

      toast.error("Unrecognized QR code format. Please verify the ticket.");
    } catch (err) {
      console.error("Scan parse error:", err);
      toast.error("Could not parse scanned ticket.");
    }
  }, [attendees, verifyPass]);

  async function toggleAttendance(attendeeId: string, currentStatus: string) {
    setUpdatingId(attendeeId);
    const targetStatus = currentStatus === "checked_in" ? "not_checked_in" : "checked_in";
    try {
      const res = await fetch("/api/events/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: attendeeId, status: targetStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          targetStatus === "checked_in"
            ? `Checked in ${data.registration.fullName}`
            : `Marked ${data.registration.fullName} as pending`
        );
        loadEventList();
      } else {
        toast.error(data.error || "Failed to update attendance");
      }
    } catch {
      toast.error("Failed to update attendance status");
    } finally {
      setUpdatingId(null);
    }
  }

  // Apply segment and search filters
  const filteredAttendees = attendees.filter((a) => {
    // Segment filter
    if (selectedSegment === "graduand" && !a.isGraduand) return false;
    if (selectedSegment === "vendor" && !a.isVendor) return false;
    if (selectedSegment === "guest" && (a.isGraduand || a.isVendor)) return false;

    // Search filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      a.ticketNumber.toLowerCase().includes(q) ||
      a.organization.toLowerCase().includes(q) ||
      (a.vendorCategory && a.vendorCategory.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-gold" />
              Event Day Attendance Portal
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Ubunifu Hub
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-foreground">
            Empower 360 Cohort I: Door Check-In Station
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Segmented check-in for graduating members, marketplace vendors, and community guests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsScannerOpen(!isScannerOpen)}
            className={`rounded-xl text-xs font-semibold gap-1.5 shadow-sm transition-all ${
              isScannerOpen
                ? "bg-slate-800 text-white hover:bg-slate-900"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isScannerOpen ? "Close Camera" : "Open Camera Scanner"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={loadEventList}
            disabled={isLoadingList}
            className="rounded-xl border-border text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowGuide(!showGuide)}
            className="rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Usher Guide</span>
            {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Visual Usher Guide */}
      {showGuide && (
        <Card className="border-primary/20 bg-primary/5 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="font-serif font-bold text-base text-foreground">Usher Quick Guide for Graduands & Vendors</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="p-4 rounded-2xl bg-background/80 border border-gold/30 space-y-1.5">
              <div className="font-bold text-foreground text-sm flex items-center gap-1.5 text-gold">
                <Award className="w-4 h-4" />
                Graduands Protocol
              </div>
              <p>When a graduand checks in, issue their <strong>Graduation Certificate pack</strong> and honor badge. Direct them to front-row reserved cohort seating.</p>
            </div>
            <div className="p-4 rounded-2xl bg-background/80 border border-emerald-500/30 space-y-1.5">
              <div className="font-bold text-foreground text-sm flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Store className="w-4 h-4" />
                Vendors Protocol
              </div>
              <p>Confirm the vendor brand and category. Escort them to their assigned tables and chairs in the <strong>Market Showcase</strong> zone.</p>
            </div>
            <div className="p-4 rounded-2xl bg-background/80 border border-border/60 space-y-1.5">
              <div className="font-bold text-foreground text-sm flex items-center gap-1.5 text-primary">
                <Users className="w-4 h-4" />
                Guests Protocol
              </div>
              <p>Confirm headcount (+1s). Issue guest admission passes and direct them to general audience seating and refreshments.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Live In-Page Camera Scanner */}
      {isScannerOpen && (
        <QrCameraScanner
          isActive={isScannerOpen}
          onScan={handleCameraScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Auto-Scanned QR Code Result Banner */}
      {isVerifying && (
        <Card className="border-primary/30 bg-primary/5 p-8 text-center rounded-3xl animate-pulse">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <h3 className="font-serif font-bold text-lg text-primary">Verifying Ticket Pass...</h3>
            <p className="text-xs text-muted-foreground">Connecting to Greenwave Society event registry</p>
          </div>
        </Card>
      )}

      {scannedResult && !isVerifying && (
        <Card className={`border-2 rounded-3xl overflow-hidden shadow-xl ${
          scannedResult.success
            ? scannedResult.alreadyCheckedIn
              ? "border-amber-500/40 bg-amber-500/5"
              : scannedResult.registration?.isGraduand
                ? "border-gold/50 bg-gold/5"
                : "border-emerald-600/40 bg-emerald-600/5"
            : "border-red-500/40 bg-red-500/5"
        }`}>
          <div className={`p-6 sm:p-8 text-center ${
            scannedResult.success
              ? scannedResult.alreadyCheckedIn
                ? "bg-amber-600 text-white"
                : scannedResult.registration?.isGraduand
                  ? "bg-gradient-to-r from-emerald-900 via-primary to-emerald-950 text-white border-b-4 border-gold"
                  : scannedResult.registration?.isVendor
                    ? "bg-gradient-to-r from-emerald-800 to-teal-900 text-white"
                    : "bg-emerald-700 text-white"
              : "bg-red-700 text-white"
          }`}>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
              {scannedResult.success ? (
                scannedResult.registration?.isGraduand ? (
                  <Award className="w-8 h-8 text-gold" />
                ) : scannedResult.registration?.isVendor ? (
                  <Store className="w-8 h-8 text-white" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-white" />
                )
              ) : (
                <AlertCircle className="w-8 h-8 text-white" />
              )}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-serif font-black">
              {scannedResult.success
                ? scannedResult.alreadyCheckedIn
                  ? "Already Checked In Previously"
                  : scannedResult.registration?.isGraduand
                    ? "Graduating Member Verified!"
                    : scannedResult.registration?.isVendor
                      ? "Market Vendor Verified!"
                      : "Verified & Checked In!"
                : "Ticket Not Verified"}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              {scannedResult.success
                ? "Empower 360 Ad Hoc Cohort I Graduation & Community Market."
                : scannedResult.error}
            </p>
          </div>

          {scannedResult.registration && (
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-background/80 border border-border/80">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Attendee Name</div>
                  <div className="text-lg font-serif font-black text-foreground">{scannedResult.registration.fullName}</div>
                  <div className="text-xs text-muted-foreground">{scannedResult.registration.email}</div>
                  {scannedResult.registration.organization && (
                    <div className="text-xs font-semibold text-primary mt-0.5">{scannedResult.registration.organization}</div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Track & Role</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-xs font-semibold ${
                      scannedResult.registration.isGraduand
                        ? "border-gold/40 text-gold bg-gold/10"
                        : scannedResult.registration.isVendor
                          ? "border-emerald-600/40 text-emerald-700 bg-emerald-50"
                          : "border-primary/30 text-primary"
                    }`}>
                      {scannedResult.registration.role}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {scannedResult.registration.ticketNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Headcount & Status</div>
                  <div className="text-sm font-semibold text-foreground mt-1">
                    Admit: {scannedResult.registration.guestCount} {scannedResult.registration.guestCount > 1 ? "Attendees" : "Attendee"}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Status: Checked In
                  </div>
                </div>
              </div>

              {/* Usher Action Box */}
              {scannedResult.registration.specialInstructions && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-bold">Action for Door Usher:</strong>{" "}
                    {scannedResult.registration.specialInstructions}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    setScannedResult(null);
                    router.replace("/events/check-in");
                  }}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-6"
                >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  Ready to Check In Next Attendee
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Segmented Real-Time Statistics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Total Registrations</div>
            <div className="text-2xl sm:text-3xl font-serif font-black text-foreground mt-1">
              {stats.totalRegistrations}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{stats.checkedInCount} checked in · {stats.pendingCount} pending</div>
          </div>

          <div className="p-5 rounded-2xl bg-gold/10 border border-gold/30 shadow-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Graduands (Cohort I)
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-black text-foreground mt-1">
              {stats.checkedInGraduands} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalGraduands}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Certificates & honors</div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> Market Vendors
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-black text-foreground mt-1">
              {stats.checkedInVendors} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalVendors}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Stalls set up on-site</div>
          </div>

          <div className="p-5 rounded-2xl bg-secondary/30 border border-border/80 shadow-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Total Headcount (+1s)
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-black text-primary mt-1">
              {stats.checkedInHeadcount} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalExpectedHeadcount}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Persons admitted</div>
          </div>
        </div>
      )}

      {/* Roster & Quick Search Section with Segment Tabs */}
      <Card className="border-border/80 shadow-md rounded-3xl overflow-hidden">
        <CardHeader className="bg-secondary/15 border-b border-border/60 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-foreground">
                Attendee & Vendor Roster
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Filter by segment or search to mark attendance.
              </CardDescription>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search name, phone, ticket, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl text-xs bg-background/80 border-border/80"
              />
            </div>
          </div>

          {/* Segment Filter Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3">
            <button
              type="button"
              onClick={() => setSelectedSegment("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedSegment === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              All Attendees ({stats?.totalRegistrations ?? attendees.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedSegment("graduand")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedSegment === "graduand"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-gold" />
              <span>Graduands ({stats?.totalGraduands ?? 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSegment("vendor")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedSegment === "vendor"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Market Vendors ({stats?.totalVendors ?? 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSegment("guest")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedSegment === "guest"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Guests & Supporters ({stats?.totalGuests ?? 0})</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/20 text-muted-foreground border-b border-border/60 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Attendee / Brand</th>
                  <th className="py-3 px-4">Track / Category</th>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                      {searchQuery
                        ? `No records match "${searchQuery}" in this segment.`
                        : "No records found in this segment."}
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((att) => {
                    const isCheckedIn = att.attendanceStatus === "checked_in";
                    return (
                      <tr
                        key={att.id}
                        className={`hover:bg-secondary/10 transition-colors ${
                          att.isGraduand ? "bg-gold/[0.02]" : att.isVendor ? "bg-emerald-500/[0.02]" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{att.fullName}</span>
                            {att.isGraduand && (
                              <Badge className="bg-gold/15 text-gold border border-gold/30 text-[10px] py-0 px-1.5">
                                Cohort I
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{att.email} &bull; {att.phone}</div>
                          {att.organization && (
                            <div className="text-[10px] text-primary font-medium mt-0.5">{att.organization}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize font-medium ${
                              att.isGraduand
                                ? "border-gold/40 text-gold bg-gold/5"
                                : att.isVendor
                                  ? "border-emerald-600/40 text-emerald-700 bg-emerald-50"
                                  : "border-border text-muted-foreground"
                            }`}
                          >
                            {att.isVendor && att.vendorCategory ? `Stall: ${att.vendorCategory}` : att.role}
                          </Badge>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {att.guestCount} {att.guestCount > 1 ? "Attendees" : "Attendee"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-middle font-mono font-bold text-xs text-primary">
                          {att.ticketNumber}
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          {isCheckedIn ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 border-none text-[11px]">
                              Checked In
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground text-[11px]">
                              Pending
                            </Badge>
                          )}
                          {att.checkedInAt && (
                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {new Date(att.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 align-middle text-right">
                          <Button
                            size="sm"
                            variant={isCheckedIn ? "outline" : "default"}
                            disabled={updatingId === att.id}
                            onClick={() => toggleAttendance(att.id, att.attendanceStatus)}
                            className={`rounded-xl text-xs h-8 ${
                              isCheckedIn
                                ? "border-border text-muted-foreground hover:bg-secondary/40"
                                : "bg-emerald-700 hover:bg-emerald-800 text-white"
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

export default function CheckInPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="pt-24 sm:pt-28 flex-1">
        <Suspense fallback={
          <div className="max-w-5xl mx-auto px-4 py-16 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading check-in station...
          </div>
        }>
          <CheckInContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}

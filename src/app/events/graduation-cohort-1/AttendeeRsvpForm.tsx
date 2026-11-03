"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  Calendar,
  MapPin,
  Printer,
  Award,
  ShieldCheck,
  QrCode,
  HeartHandshake,
  Sparkles,
  UploadCloud,
  Camera,
  X,
  XCircle,
  Store,
  ArrowRight,
} from "lucide-react";

const attendeeSchema = z.object({
  fullName: z.string().trim().min(2, "Your full name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(120),
  phone: z.string().trim().min(5, "Please enter a valid WhatsApp or phone number").max(25),
  role: z.enum([
    "graduand",
    "family_friend",
    "partner_collaborator",
    "community_guest",
  ], {
    message: "Please select your role for this celebration",
  }),
  guestCount: z.number().int().min(1, "Minimum 1 attendee").max(6, "Maximum 6 attendees per group"),
  organization: z.string().trim().max(100).optional(),
  celebrationPhoto: z.string().trim().max(10000000).optional(),
  dietaryOrNotes: z.string().trim().max(500).optional(),
});

type AttendeeFormValues = z.infer<typeof attendeeSchema>;

interface TicketData {
  ticketNumber: string;
  fullName: string;
  role: string;
  guestCount: number;
  qrCodeDataUrl: string;
  checkInUrl: string;
  passUrl?: string;
  message: string;
}

export function AttendeeRsvpForm({ isClosed = true }: { isClosed?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [lookupEmail, setLookupEmail] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "graduand",
      guestCount: 1,
      organization: "",
      celebrationPhoto: "",
      dietaryOrNotes: "",
    },
  });

  const selectedRole = form.watch("role");

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file is too large. Please select a photo under 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
      form.setValue("celebrationPhoto", result);
      toast.success("Picture added for your celebration poster!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    form.setValue("celebrationPhoto", "");
  };

  async function handleLookupPass(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupEmail.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setIsLookingUp(true);
    try {
      const res = await fetch("/api/events/graduation-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Registered Attendee",
          email: lookupEmail.trim(),
          phone: "0700000000",
          role: "graduand",
          guestCount: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isClosed) {
          toast.error("No registration found under this email. Please verify spelling or contact support.");
        } else {
          toast.error(data.error || "Could not retrieve pass.");
        }
        return;
      }

      setTicket({
        ticketNumber: data.ticketNumber,
        fullName: data.fullName,
        role: data.role,
        guestCount: data.guestCount,
        qrCodeDataUrl: data.qrCodeDataUrl,
        checkInUrl: data.checkInUrl,
        passUrl: data.passUrl,
        message: data.message,
      });

      toast.success("Pass record retrieved • Event concluded on 30 Oct 2026.");
    } catch {
      toast.error("Something went wrong retrieving your pass.");
    } finally {
      setIsLookingUp(false);
    }
  }

  async function onSubmit(values: AttendeeFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/events/graduation-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit RSVP");
      }

      setTicket({
        ticketNumber: data.ticketNumber,
        fullName: data.fullName,
        role: data.role,
        guestCount: data.guestCount,
        qrCodeDataUrl: data.qrCodeDataUrl,
        checkInUrl: data.checkInUrl,
        passUrl: data.passUrl,
        message: data.message,
      });

      toast.success(
        data.isExisting
          ? "Found existing RSVP pass record • Ceremony concluded."
          : "Ceremony concluded on 30 Oct 2026 • Pass record retrieved."
      );
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleTitleMap: Record<string, string> = {
    graduand: "YPG Graduand",
    family_friend: "Family & Supporter",
    partner_collaborator: "Partner & Collaborator",
    community_guest: "Community Guest",
  };

  if (isClosed && !ticket) {
    return (
      <Card className="border-border/70 shadow-xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-emerald-500/10 border-b border-border/50 pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" /> Event Concluded &bull; Registrations Closed
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground border-border rounded-full font-medium">
              30 October 2026
            </Badge>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-serif font-black text-foreground">
            YPG: Young Person&apos;s Guide to Systems Change Cohort I Graduation Has Concluded
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
            Thank you to all our graduands, honorees, families, partners, and community members who joined us at Ubunifu Hub, Nairobi to celebrate this inaugural cohort. Registrations are now closed.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Milestone stats banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Cohort</span>
              <strong className="text-sm sm:text-base font-serif font-black text-foreground">Cohort I</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-mono block">Graduands</span>
              <strong className="text-sm sm:text-base font-serif font-black text-gold">12 Graduands (28 Enrolled)</strong>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-mono block">Market & Venue</span>
              <strong className="text-sm sm:text-base font-serif font-black text-emerald-600 dark:text-emerald-400">Ubunifu Hub</strong>
            </div>
          </div>

          {/* Dedicated Graduand Certificate Pass Portal */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-emerald-500/10 border-2 border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-gold flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-serif font-black text-sm text-foreground">
                      YPG Graduand Certificate Pass
                    </h4>
                    <Badge className="bg-gold text-slate-950 font-bold text-[9px] uppercase px-1.5 py-0 font-mono">
                      Exclusive to 12 Graduands
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Access and download your verified Certificate of Completion pass (High-Res PNG &amp; PDF).
                  </p>
                </div>
              </div>

              <Button asChild size="sm" className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs gap-1.5 shrink-0 shadow-sm">
                <Link href="/events/graduation-cohort-1/certificate">
                  <span>Open Certificate Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Pass retrieval section for existing attendees */}
          <div className="p-5 rounded-2xl bg-secondary/20 border border-border/70 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-foreground">Registered Attendee? View Pass Record</h4>
                <p className="text-xs text-muted-foreground">
                  The event has concluded and passes are expired. Enter your email to view your commemorative record.
                </p>
              </div>
            </div>

            <form onSubmit={handleLookupPass} className="flex flex-col sm:flex-row gap-2 pt-1">
              <Input
                type="email"
                placeholder="Enter your registered email..."
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                className="rounded-xl h-10 bg-background border-border/80 text-xs"
              />
              <Button
                type="submit"
                disabled={isLookingUp}
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold shrink-0"
              >
                {isLookingUp ? "Looking up..." : "Find My Pass"}
              </Button>
            </form>
          </div>

          {/* Useful navigation links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <Button asChild size="sm" variant="outline" className="rounded-xl border-border text-xs font-semibold">
              <a href="/media-kit">
                <Award className="w-3.5 h-3.5 mr-1.5 text-gold" />
                Media Kit & Official Posters
              </a>
            </Button>

            <Button asChild size="sm" variant="outline" className="rounded-xl border-border text-xs font-semibold">
              <a href="/events/community-market">
                <Store className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Community Market Portal
              </a>
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong>Questions or Inquiries?</strong> If you attended or were a graduand and need your certificate, please email{" "}
              <a href="mailto:info@greenwavesociety.org" className="text-primary hover:underline font-semibold">
                info@greenwavesociety.org
              </a>.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ticket) {
    const isGraduandTicket = ticket.role === "graduand";

    return (
      <Card className="border-primary/30 shadow-2xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm print:border-none print:shadow-none">
        <div className={`p-6 text-white text-center relative overflow-hidden ${
          isGraduandTicket
            ? "bg-gradient-to-r from-emerald-950 via-primary to-emerald-900 border-b-4 border-gold"
            : "bg-gradient-to-r from-emerald-950 via-primary to-emerald-900"
        }`}>
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <Badge className="mb-2 bg-rose-600 text-white border-none text-[11px] font-mono tracking-wider uppercase">
            <XCircle className="w-3.5 h-3.5 mr-1 text-white" /> Event Concluded &bull; Pass Expired
          </Badge>
          <h3 className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-white">
            {isGraduandTicket ? "Graduand Pass Record (Concluded)" : "Admission Pass Record (Concluded)"}
          </h3>
          <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            YPG: Young Person&apos;s Guide to Systems Change Cohort I Graduation &amp; Community Market
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Concluded / Invalid Alert Banner */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-foreground space-y-1">
            <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-sm">
              <XCircle className="w-4 h-4 text-rose-500" /> Ceremony Concluded &bull; Pass Expired &amp; Invalid
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This ceremony concluded on <strong>Friday, 30th October 2026</strong> at Ubunifu Hub, Nairobi. Admission passes are permanently expired and invalid for door check-in. This pass is retained for personal archival and certificate verification only.
            </p>
          </div>

          {/* Ticket Body / Pass */}
          <div className="p-6 rounded-3xl bg-secondary/20 border-2 border-dashed border-primary/30 relative">
            
            {/* Top Pass Details */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border/60 text-center sm:text-left">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Attendee Name</div>
                <div className="text-xl sm:text-2xl font-serif font-black text-foreground">{ticket.fullName}</div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <Badge variant="outline" className={`font-semibold text-xs ${
                    isGraduandTicket
                      ? "border-gold/40 text-gold bg-gold/10"
                      : "border-primary/30 text-primary bg-primary/5"
                  }`}>
                    <Award className="w-3 h-3 mr-1" />
                    {roleTitleMap[ticket.role] || ticket.role}
                  </Badge>
                  <Badge variant="secondary" className="font-medium text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    Admit: {ticket.guestCount} {ticket.guestCount > 1 ? "Persons" : "Person"}
                  </Badge>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Pass Number</div>
                <div className="text-base sm:text-lg font-mono font-bold text-primary">{ticket.ticketNumber}</div>
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">Expired &bull; Invalid for Entry</div>
              </div>
            </div>

            {/* Graduand Record Notice & Certificate Action */}
            {isGraduandTicket && (
              <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-emerald-500/10 border-2 border-amber-500/50 text-xs text-foreground flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-start gap-2.5">
                  <Award className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block text-sm font-serif">Certified Graduand Record &bull; Certificate Ready</strong>
                    <span className="text-muted-foreground text-xs">
                      Officially recognized as one of the 12 certified graduands of YPG Cohort I. Your digital certificate pass is ready for download in high-res PNG and PDF.
                    </span>
                  </div>
                </div>
                <Button asChild size="sm" className="rounded-xl bg-gold hover:bg-gold/90 text-slate-950 font-bold text-xs gap-1.5 shrink-0 shadow-md">
                  <Link href="/events/graduation-cohort-1/certificate">
                    <span>View Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            )}

            {/* QR Code Section (Concluded & Invalidated) */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-border inline-block mb-3 filter grayscale contrast-125 opacity-40">
                <Image
                  src={ticket.qrCodeDataUrl}
                  alt={`QR Code Pass for ${ticket.fullName}`}
                  width={180}
                  height={180}
                  className="rounded-lg"
                  unoptimized
                />
                <div className="absolute inset-0 bg-slate-950/20 rounded-2xl flex items-center justify-center p-2">
                  <div className="transform -rotate-12 bg-rose-600 text-white font-mono font-black text-xs uppercase px-2.5 py-1 rounded-md border border-white shadow-xl tracking-widest text-center">
                    CONCLUDED &bull; INVALID
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                <XCircle className="w-4 h-4" />
                <span>Door Scanner Deactivated &bull; Pass Expired</span>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                The ceremony concluded on Friday, 30th October 2026. This pass is permanently expired and cannot be scanned for door admission at Ubunifu Hub.
              </p>
            </div>

            {/* Event Time & Venue Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>Friday, 30 Oct 2026 (Ceremony Concluded)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Ubunifu Hub, Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-xl border-border text-foreground hover:bg-secondary/40 gap-1.5 text-xs"
            >
              <Link href="/events/graduation-cohort-1/album">
                <Camera className="w-4 h-4 text-primary" />
                <span>View 296 Celebration Photos</span>
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-xl border-border text-foreground hover:bg-secondary/40 gap-1.5 text-xs"
            >
              <Link href="/events/graduation-cohort-1">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Ceremony Retrospective</span>
              </Link>
            </Button>
            
            {ticket.passUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl border-border text-foreground hover:bg-secondary/40 gap-1.5 text-xs"
              >
                <a href={ticket.passUrl} target="_blank" rel="noopener noreferrer">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Open Mobile Pass</span>
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl border-border text-foreground hover:bg-secondary/40 gap-1.5 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass Record</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTicket(null);
                form.reset();
              }}
              className="rounded-xl text-muted-foreground hover:text-foreground text-xs"
            >
              Look Up Another Pass
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong>Archival Pass Record:</strong> This digital record is permanently retained in the Greenwave Society registry. If you are a graduand and have any questions about your certification honors, contact us at{" "}
              <a href="mailto:info@greenwavesociety.org" className="text-primary hover:underline font-semibold">
                info@greenwavesociety.org
              </a>.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 shadow-xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 border-b border-border/50 pb-6">
        <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold mb-2">
          <HeartHandshake className="w-4 h-4" /> Track I: Guest & Graduand RSVP
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-serif font-black text-foreground">
          RSVP for Cohort I Graduation
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
          Reserve your seat for the graduation ceremony, networking refreshments, and community market. Each RSVP includes a personal digital check-in QR ticket.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 sm:pt-8 px-6 sm:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Amani Odhiambo"
                      {...field}
                      className="rounded-xl h-11 bg-background/50 border-border/80 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Email & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="amani@example.com"
                        {...field}
                        className="rounded-xl h-11 bg-background/50 border-border/80 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      WhatsApp / Phone *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="07XX XXX XXX or +254..."
                        {...field}
                        className="rounded-xl h-11 bg-background/50 border-border/80 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Role & Number of Guests */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Affiliation / Role *
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-11 px-3 rounded-xl bg-background/50 border border-border/80 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="graduand">YPG Graduand (Cohort I)</option>
                        <option value="family_friend">Family Member or Friend</option>
                        <option value="partner_collaborator">Partner, Mentor or Collaborator</option>
                        <option value="community_guest">Community Guest / Supporter</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Attendees in your Party *
                    </FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        className="w-full h-11 px-3 rounded-xl bg-background/50 border border-border/80 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value={1}>1 Person (Just Me)</option>
                        <option value={2}>2 Persons (Me + 1 Guest)</option>
                        <option value={3}>3 Persons (Me + 2 Guests)</option>
                        <option value={4}>4 Persons (Me + 3 Guests)</option>
                        <option value={5}>5 Persons (Me + 4 Guests)</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Dynamic Role Guidance Notice */}
            {selectedRole === "graduand" && (
              <div className="p-3.5 rounded-2xl bg-gold/10 border border-gold/30 text-xs text-foreground flex items-start gap-2.5">
                <Award className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Graduand Priority Pack:</strong> As a YPG Cohort I graduand, this RSVP reserves your official certificate of completion, ceremony recognition slot, and front-row reserved seating for you and your guests.
                </div>
              </div>
            )}

            {/* Graduand Celebration Poster Photo Upload */}
            {selectedRole === "graduand" && (
              <div className="p-4 rounded-2xl bg-secondary/30 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Celebration Poster Photo
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-mono">
                    Recommended
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Share a portrait picture or headshot you would like featured on your personalized celebration poster, ceremony recognition slide, and cohort directory.
                </p>

                {photoPreview ? (
                  <div className="flex items-center gap-4 p-3 bg-background/80 rounded-xl border border-border/80">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-primary/30 shadow-sm shrink-0 bg-stone-100">
                      <Image
                        src={photoPreview}
                        alt="Celebration Photo Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Photo attached successfully</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        Ready for your graduation celebration poster
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="rounded-lg h-8 px-2 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl bg-background/50 hover:bg-primary/5 cursor-pointer transition-all">
                      <UploadCloud className="w-6 h-6 text-primary mb-1.5" />
                      <span className="text-xs font-semibold text-foreground">Click to upload your portrait picture</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG, or WebP (up to 8MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoFileChange}
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Or paste a Google Drive / cloud photo link here..."
                        value={form.watch("celebrationPhoto") || ""}
                        onChange={(e) => {
                          form.setValue("celebrationPhoto", e.target.value);
                          if (e.target.value.startsWith("http")) {
                            setPhotoPreview(null);
                          }
                        }}
                        className="rounded-xl h-9 text-xs bg-background/60 border-border/70 focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedRole === "family_friend" && (
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2.5">
                <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Family & Supporter Seating:</strong> Family members and guests will have dedicated reserved seating directly adjacent to the graduating cohort.
                </div>
              </div>
            )}

            {/* Organization / Affiliation (Optional) */}
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Organization or Community Initiative (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. University, Community Initiative, or Business"
                      {...field}
                      className="rounded-xl h-11 bg-background/50 border-border/80 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Dietary or Notes */}
            <FormField
              control={form.control}
              name="dietaryOrNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Accessibility or Dietary Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any dietary restrictions or accessibility needs we should prepare for..."
                      rows={2}
                      {...field}
                      className="rounded-xl bg-background/50 border-border/80 focus:border-primary resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md transition-all mt-4"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Generating Your Entry Pass...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedRole === "graduand" ? "Confirm Graduand RSVP & Get Pass" : "Confirm RSVP & Get QR Pass"}
                </span>
              )}
            </Button>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Free Admission &bull; Ubunifu Hub</span>
              <span>Instant QR Code Check-in Pass</span>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

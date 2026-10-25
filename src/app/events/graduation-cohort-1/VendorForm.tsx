"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  Store,
  Leaf,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  Printer,
} from "lucide-react";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";

const vendorSchema = z.object({
  vendorName: z.string().trim().min(2, "Brand or Business name is required"),
  contactPerson: z.string().trim().min(2, "Your full name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(5, "Please enter a valid WhatsApp or phone number"),
  category: z.enum([
    "refreshments",
    "books",
    "accessories",
    "lifestyle",
    "other",
  ], {
    message: "Please choose your primary product category",
  }),
  productDescription: z.string().trim().min(10, "Please provide a brief description of what you will be offering"),
  socialOrWebsite: z.string().trim().optional(),
  singleUsePlasticAgreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to our zero single-use plastics policy to vend at this event.",
  }),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorTicketData {
  ticketNumber: string;
  vendorName: string;
  contactPerson: string;
  category: string;
  qrCodeDataUrl: string;
  checkInUrl: string;
  passUrl: string;
  message: string;
}

const VENDOR_CALENDAR_DATA = {
  title: "Empower 360 Community Market - Vendor Stall Setup & Showcase",
  description: "Vendor setup (9:30 AM) and showcase for the Greenwave Society Empower 360 Graduation & Community Market. Tables and chairs provided. Zero single-use plastics.",
  location: "Ubunifu Hub, Nairobi, Kenya",
  startsAt: "2026-10-30T06:30:00Z", // 9:30 AM EAT (setup starts)
  endsAt: "2026-10-30T12:00:00Z",   // 3:00 PM EAT
  url: "https://greenwavesociety.org/events/community-market",
};

export function VendorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState<VendorTicketData | null>(null);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendorName: "",
      contactPerson: "",
      email: "",
      phone: "",
      category: "refreshments",
      productDescription: "",
      socialOrWebsite: "",
      singleUsePlasticAgreement: false,
    },
  });

  async function onSubmit(values: VendorFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/events/graduation-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit vendor application");
      }

      setTicket({
        ticketNumber: data.ticketNumber,
        vendorName: data.vendorName || values.vendorName,
        contactPerson: data.contactPerson || values.contactPerson,
        category: data.category || values.category,
        qrCodeDataUrl: data.qrCodeDataUrl,
        checkInUrl: data.checkInUrl,
        passUrl: data.passUrl,
        message: data.message,
      });

      toast.success(data.isExisting ? "Found existing vendor registration!" : "Application received! Your vendor pass is ready.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryLabels: Record<string, string> = {
    refreshments: "Snacks & Drinks",
    books: "Books & Prints",
    accessories: "Apparel & Beads",
    lifestyle: "Eco-Home & Care",
    other: "Curated Goods",
  };

  if (ticket) {
    return (
      <Card className="border-primary/30 shadow-2xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm print:border-none print:shadow-none">
        <div className="bg-gradient-to-r from-emerald-950 via-primary to-emerald-900 p-6 text-white text-center relative overflow-hidden border-b-4 border-gold">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-none text-[11px] font-mono tracking-wider uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-gold" /> Vendor Pass Confirmed
          </Badge>
          <h3 className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-white">
            Market Vendor Stall Pass
          </h3>
          <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            Empower 360 Ad Hoc Cohort I Graduation & Community Market
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="p-6 rounded-3xl bg-secondary/20 border-2 border-dashed border-primary/30 relative">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border/60 text-center sm:text-left">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Vendor Brand / Stall</div>
                <div className="text-xl sm:text-2xl font-serif font-black text-foreground">{ticket.vendorName}</div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 font-semibold text-xs">
                    <Store className="w-3 h-3 mr-1" />
                    {categoryLabels[ticket.category] || ticket.category}
                  </Badge>
                  <Badge variant="secondary" className="font-medium text-xs">
                    Contact: {ticket.contactPerson}
                  </Badge>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Pass Number</div>
                <div className="text-base sm:text-lg font-mono font-bold text-primary">{ticket.ticketNumber}</div>
                <div className="text-xs text-muted-foreground mt-0.5">KES 1,000 Stall Reservation</div>
              </div>
            </div>

            {/* Vendor Setup Timings & Logistics */}
            <div className="my-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-2">
              <div className="font-bold text-primary flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-primary" /> Vendor Setup Instructions:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Arrival & Setup:</strong> 9:30 AM to 10:15 AM EAT at Ubunifu Hub main hall.</li>
                <li><strong>Provided:</strong> 1 standard exhibition table and 2 chairs per stall.</li>
                <li><strong>Green Standard:</strong> Zero single-use plastic packaging. Use reusable or paper wrapping.</li>
              </ul>
            </div>

            {/* QR Code Section */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-border inline-block mb-3">
                <Image
                  src={ticket.qrCodeDataUrl}
                  alt={`Vendor Pass QR Code for ${ticket.vendorName}`}
                  width={180}
                  height={180}
                  className="rounded-lg"
                  unoptimized
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                <QrCode className="w-4 h-4" />
                <span>Vendor Check-in & Stall Allocation QR</span>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                Present this QR code to the Executive Team at the door upon arrival at Ubunifu Hub to receive your assigned stall number.
              </p>
            </div>

            {/* Venue Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>Friday, 30 Oct 2026 (Setup: 9:30 AM)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Ubunifu Hub, Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
            <AddToCalendarButton event={VENDOR_CALENDAR_DATA} size="sm" />
            
            {ticket.passUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl border-border text-foreground hover:bg-secondary/40 gap-1.5"
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
              className="rounded-xl border-border text-foreground hover:bg-secondary/40 gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stall Pass</span>
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
              Register Another Stall
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong>Email dispatched:</strong> Your official stall confirmation with this scannable QR ticket has been sent to your email address. You will also receive a 1-day reminder before the event.
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
          <Store className="w-4 h-4" /> Vendor Registration
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-serif font-black text-foreground">
          Apply to Vend at the Market
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
          Showcase your crafts, refreshments, books, or eco-conscious creations to graduands, families, partners, and community members.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 sm:pt-8 px-6 sm:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Vendor & Contact Name */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Brand / Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. EcoBites Nairobi" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Full Name" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@domain.com" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Phone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="0712 345 678" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category Select */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Product Category</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {[
                      { value: "refreshments", label: "Snacks & Drinks" },
                      { value: "books", label: "Books & Prints" },
                      { value: "accessories", label: "Apparel & Beads" },
                      { value: "lifestyle", label: "Eco-Home & Care" },
                      { value: "other", label: "Other Creations" },
                    ].map((cat) => {
                      const isSelected = field.value === cat.value;
                      return (
                        <button
                          type="button"
                          key={cat.value}
                          onClick={() => field.onChange(cat.value)}
                          className={`p-3 text-left text-xs font-semibold rounded-xl border transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background text-foreground/80 border-border/70 hover:border-primary/40 hover:bg-secondary/20"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="productDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-semibold text-foreground/80">What will you be offering?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Give a quick summary of your items, prices (if applicable), and display requirements..."
                      className="rounded-xl min-h-[90px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Helps us prevent product duplication across neighboring stalls.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social / Portfolio */}
            <FormField
              control={form.control}
              name="socialOrWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider font-semibold text-foreground/80">
                    Social Handle or Portfolio (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. @ecobites_ke or website URL" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zero Single-Use Plastics Agreement */}
            <FormField
              control={form.control}
              name="singleUsePlasticAgreement"
              render={({ field }) => (
                <FormItem className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                  </FormControl>
                  <div className="space-y-1.5 leading-none">
                    <FormLabel className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      Zero Single-Use Plastics Agreement
                    </FormLabel>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      I understand that Greenwave Society enforces strict environmental standards. I agree to use reusable, paper, fabric, or biodegradable alternatives and avoid single-use polythene bags or plastics at my stall.
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Commitment Note */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                <strong>Commitment Fee:</strong> A flat baseline fee of KES 1,000 will be collected upon acceptance to confirm your table, chairs, and dedicated stall space.
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl h-12 text-sm font-semibold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
            >
              {isSubmitting ? (
                <>Submitting Application...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 text-gold" />
                  Submit Vendor Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

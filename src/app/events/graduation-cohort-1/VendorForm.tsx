"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, Store, Leaf, ShieldCheck, AlertCircle } from "lucide-react";

const vendorSchema = z.object({
  vendorName: z.string().trim().min(2, "Brand or Business name is required"),
  contactPerson: z.string().trim().min(2, "Your full name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(9, "Please enter a valid WhatsApp or phone number"),
  category: z.enum([
    "refreshments",
    "books",
    "accessories",
    "lifestyle",
    "other",
  ], {
    message: "Please choose your primary product category",
  }),
  productDescription: z.string().trim().min(10, "Please provide a brief description of what you'll be offering"),
  socialOrWebsite: z.string().trim().optional(),
  singleUsePlasticAgreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to our zero single-use plastics policy to vend at this event.",
  }),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

export function VendorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

      setIsSuccess(true);
      toast.success("Application received! We look forward to reviewing your offerings.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-primary/20 bg-primary/5 p-8 text-center shadow-lg rounded-3xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white mb-6 shadow-md">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-serif font-black text-foreground mb-3">
          Application Received!
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
          Thank you for applying to be a featured vendor at the Greenwave Society Empower 360 Ad Hoc Cohort I Graduation Celebration.
        </CardDescription>
        <div className="bg-background/80 rounded-2xl p-5 border border-primary/15 text-left text-xs sm:text-sm text-foreground/80 space-y-2 mb-6">
          <p className="font-semibold text-primary flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" /> What happens next:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Our team curates slots to maintain category balance and exclusivity.</li>
            <li>You will receive an email confirmation and setup instructions within 48 hours.</li>
            <li>Tables and chairs will be ready for setup at Ubunifu Hub starting 9:30 AM on Friday, Oct 30.</li>
            <li>A flat commitment fee of KES 1,000 confirms your reserved stall once approved.</li>
          </ul>
        </div>
        <Button
          onClick={() => {
            setIsSuccess(false);
            form.reset();
          }}
          variant="outline"
          className="rounded-xl border-primary/20 text-primary hover:bg-primary/10"
        >
          Submit Another Application
        </Button>
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

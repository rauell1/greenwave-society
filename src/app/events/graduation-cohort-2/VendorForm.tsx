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
          Thank you for applying to be a featured vendor at the Greenwave Society Ad Hoc Cohort II Graduation Celebration.
        </CardDescription>
        <div className="bg-background/80 rounded-2xl p-5 border border-primary/15 text-left text-xs sm:text-sm text-foreground/80 space-y-2 mb-6">
          <p className="font-semibold text-primary flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" /> What happens next:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Our team curates slots to maintain category balance and exclusivity.</li>
            <li>You will receive an email confirmation and setup instructions within 48 hours.</li>
            <li>Tables and chairs will be ready for setup at Ubunifu Hub starting 9:30 AM on Friday, Oct 30.</li>
            <li>A baseline commitment fee of KES 1,000 confirms your spot upon approval.</li>
          </ul>
        </div>
        <Button
          onClick={() => {
            setIsSuccess(false);
            form.reset();
          }}
          variant="outline"
          className="rounded-xl border-primary/25 text-primary hover:bg-primary/10"
        >
          Submit Another Application
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-secondary/20 border-b border-border/50 p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold w-fit mb-2">
          <Store className="w-3.5 h-3.5" />
          Vendor Registration Open
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
          Apply for a Vendor Stall
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm leading-relaxed mt-1">
          Showcase and sell your products to our graduating changemakers, guests, and community partners at Ubunifu Hub.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Business / Brand Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sanaa Eco Crafts" className="rounded-xl" {...field} />
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
                    <FormLabel className="text-foreground font-medium">Contact Person *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@domain.com" className="rounded-xl" {...field} />
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
                    <FormLabel className="text-foreground font-medium">WhatsApp / Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+254 7XX XXX XXX" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Primary Product Category *</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="refreshments">Refreshments, Baked Goods & Healthy Snacks</option>
                      <option value="books">Books, Literature & Educational Materials</option>
                      <option value="accessories">Accessories, Sustainable Apparel & Jewelry</option>
                      <option value="lifestyle">Eco-Friendly Essentials & Lifestyle Innovations</option>
                      <option value="other">Other Community / Creative Goods</option>
                    </select>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Categories are curated to ensure variety and exclusivity for each participating vendor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Product / Offering Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe what items or services you will be displaying, pricing range, and setup requirements..."
                      className="rounded-xl min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialOrWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Instagram / Portfolio / Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://instagram.com/yourhandle" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Environmental Policy Agreement */}
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <FormField
                control={form.control}
                name="singleUsePlasticAgreement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
                        <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        Zero Single-Use Plastics Commitment *
                      </FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        I confirm that all packaging, serving items, and display materials will be reusable, biodegradable, or recyclable. No single-use plastic bags, cups, or straws will be used.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Practical Notes */}
            <div className="text-xs text-muted-foreground space-y-1 border-t border-border/50 pt-4">
              <p className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <strong>Stall Provision:</strong> Tables and chairs are provided by the event at Ubunifu Hub without extra rental charge.
              </p>
              <p className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <strong>Commitment Fee:</strong> A flat baseline fee of KES 1,000 will be collected upon application confirmation to secure your stall.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-6 shadow-md"
            >
              {isSubmitting ? (
                "Submitting Application..."
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" /> Submit Vendor Application
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

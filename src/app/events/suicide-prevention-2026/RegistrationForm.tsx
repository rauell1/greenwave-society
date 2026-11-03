"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CalendarIcon, MapPinIcon, AlertCircle } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  attendedBefore: z.string().min(1, "This field is required"),
  expectations: z.string().min(2, "Expectations are required"),
  makesYouHappy: z.string().min(1, "This field is required"),
  accessibilityNeeds: z.string().min(1, "This field is required"),
  suicidalIdeation: z.string().min(1, "This field is required"),
  knowsSomeoneAttempted: z.string().min(1, "This field is required"),
  stigmaReason: z.string().min(1, "This field is required"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(5, "Emergency contact phone is required"),
  dietaryRestrictions: z.string().optional(),
  liabilityConsent: z.boolean().refine(val => val === true, "You must acknowledge this to register"),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

export function SuicidePreventionRegistrationForm({ isRegistrationOpen }: { isRegistrationOpen: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      attendedBefore: "",
      expectations: "",
      makesYouHappy: "",
      accessibilityNeeds: "",
      suicidalIdeation: "",
      knowsSomeoneAttempted: "",
      stigmaReason: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      dietaryRestrictions: "",
      liabilityConsent: false,
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
    if (!isRegistrationOpen) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          eventSlug: "suicide-prevention-awareness-2026",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register");
      }

      setIsSuccess(true);
      toast.success("Successfully registered! Check your email for confirmation.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Event Details */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 inline-block">
                Concluded Event • Saturday, 3 Oct 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-green-900 dark:text-green-100 mb-4">
              Greenwave Mental Health Circle: Suicide Prevention Month
            </h1>
            <div className="space-y-4 text-base text-green-700 dark:text-green-300">
              <p>
                A Safe-Space Community Gathering in Solidarity with World Suicide Prevention Month.
              </p>
              <p className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg text-sm">
                <strong>Why this is important:</strong> Mental health challenges often thrive in silence. 
                At Greenwave Society, we believe that open dialogue, community support, and shared vulnerability are crucial 
                for breaking stigmas and saving lives. This circle provides a safe, non-judgmental space to learn, 
                share, and stand together in solidarity for suicide prevention month. 
                You are not alone, and your voice matters.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-green-800 dark:text-green-200">
              <CalendarIcon className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold">Date & Time</p>
                <p className="text-sm">Saturday, October 3rd, 2026</p>
                <p className="text-sm">10:00 AM - 1:00 PM (EAT)</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-green-800 dark:text-green-200">
              <MapPinIcon className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-sm">To be confirmed (Physical Meeting)</p>
                <p className="text-xs mt-1 text-green-700/80 dark:text-green-300/80">The exact venue details will be shared directly with all registered attendees once confirmed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="lg:col-span-7">
          <Card className="border-green-100 shadow-lg dark:border-green-900">
            <CardHeader className="bg-green-50/50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900">
              <CardTitle>Reserve your spot</CardTitle>
              <CardDescription>
                Fill in your details below to confirm your attendance.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!isRegistrationOpen ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 inline-block mb-2">
                    Session Concluded • Saturday, 3 Oct 2026
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                    This Mental Health Circle Has Concluded
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Thank you to all who joined our safe-space dialogue. While this session has ended, our Youth Pulse program hosts regular community wellness barazas throughout the year.
                  </p>
                  <div className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 max-w-md mx-auto mt-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-foreground">
                      Free Crisis Helplines in Kenya:
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 font-mono">
                      <li>• Befrienders Kenya: +254 722 178 177</li>
                      <li>• Niskize Helpline: 0900 620 800</li>
                      <li>• Chiromo Crisis Line: +254 729 333 444</li>
                      <li>• Kenya Red Cross: 1199</li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <a href="/programs" className="text-xs font-semibold text-primary underline underline-offset-4">
                      Explore ongoing Youth Pulse Programs &rarr;
                    </a>
                  </div>
                </div>
              ) : isSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-green-900 dark:text-green-100">You're Registered!</h3>
                  <p className="text-green-700 dark:text-green-300">
                    We've sent a confirmation email with all the details. We'll also remind you a few days before the event.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setIsSuccess(false);
                      form.reset();
                    }}
                  >
                    Register another person
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="attendedBefore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attended our events before? *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. First time, 2 times..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="expectations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What are your expectations for the event? *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Share what you hope to gain..." className="resize-none h-20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="makesYouHappy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What makes you happy? *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Share something that brings you joy..." className="resize-none h-20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="suicidalIdeation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Have you struggled with suicide ideation? *</FormLabel>
                            <FormControl>
                              <Input placeholder="Yes, No, Prefer not to say..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="knowsSomeoneAttempted"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Do you know anyone who has attempted suicide? *</FormLabel>
                            <FormControl>
                              <Input placeholder="Yes, No..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="stigmaReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why do you think people are stigmatized when they attempt suicide? *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Share your thoughts..." className="resize-none h-20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accessibilityNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Do you have any accessibility needs or required accommodations? *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Type 'None' if not applicable..." className="resize-none h-20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg text-slate-800">Safety & Safeguarding</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="+254 700 000000" type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="dietaryRestrictions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dietary Restrictions (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Vegan, Nut allergy, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="liabilityConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-slate-50 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium leading-relaxed">
                                I understand that this event provides a community peer support space and is not a substitute for professional clinical therapy or emergency psychiatric care. *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 mt-6" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

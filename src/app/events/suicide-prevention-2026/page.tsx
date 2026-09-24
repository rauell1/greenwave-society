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
import { toast } from "sonner";
import { CalendarIcon, MapPinIcon } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  attendedBefore: z.string().optional(),
  expectations: z.string().min(2, "Expectations are required"),
  makesYouHappy: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

export default function SuicidePreventionEventPage() {
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
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
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
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Event Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-green-900 dark:text-green-100 mb-4">
              RSVP: GreenWave Society Mental Health Circle
            </h1>
            <p className="text-lg text-green-700 dark:text-green-300">
              Confirm Your Place at Our Exclusive Mental Health Circle. Join Greenwave Society as we hold an awareness session for our members to observe Suicide Prevention Month.
            </p>
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
                <p className="text-sm">Virtual / Greenwave HQ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div>
          <Card className="border-green-100 shadow-lg dark:border-green-900">
            <CardHeader className="bg-green-50/50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900">
              <CardTitle>Reserve your spot</CardTitle>
              <CardDescription>
                Fill in your details below to confirm your attendance.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isSuccess ? (
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
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
                          <FormLabel>How many times have you attended Our Events? (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. First time, 2 times..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What are your expectations for the event? *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Share what you hope to gain..." {...field} />
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
                          <FormLabel>What makes you happy? (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Share something that brings you joy..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit"}
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

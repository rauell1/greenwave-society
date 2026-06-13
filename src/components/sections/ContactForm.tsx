"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "general",
    message: "",
  });

  useEffect(() => {
    const interestParam = searchParams.get("interest");
    if (interestParam && ["general", "volunteer", "partner", "donate", "media"].includes(interestParam)) {
      setFormData((prev) => ({ ...prev, interest: interestParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setFormState("success");
      setFormData({ name: "", email: "", interest: "general", message: "" });
      setTimeout(() => setFormState("idle"), 4000);
    } catch {
      setFormState("error");
      setTimeout(() => setFormState("idle"), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1.5"
          >
            Full Name
          </label>
          <Input
            id="name"
            required
            placeholder="Your name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
          >
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            required
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="interest"
          className="block text-sm font-medium mb-1.5"
        >
          I am interested in
        </label>
        <select
          id="interest"
          value={formData.interest}
          onChange={(e) =>
            setFormData({ ...formData, interest: e.target.value })
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="general">General Inquiry</option>
          <option value="volunteer">Volunteering</option>
          <option value="partner">Partnership</option>
          <option value="donate">Donations</option>
          <option value="media">Media / Press</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium mb-1.5"
        >
          Message
        </label>
        <Textarea
          id="message"
          required
          placeholder="Tell us how you would like to get involved..."
          rows={5}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto rounded-full"
        disabled={formState === "loading"}
      >
        {formState === "loading" ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : formState === "success" ? (
          <span className="flex items-center gap-2">
            <Leaf className="w-4 h-4" /> Message Sent!
          </span>
        ) : formState === "error" ? (
          <span className="flex items-center gap-2 text-red-200">
            Something went wrong
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" /> Send Message
          </span>
        )}
      </Button>
    </form>
  );
}

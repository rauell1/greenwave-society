"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Leaf } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
      <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="font-mono text-[10px] uppercase tracking-widest text-gold font-semibold mb-1"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="e.g. Jane Doe"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full bg-transparent border-b border-primary/25 py-3 text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none transition-colors duration-300 font-sans text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="font-mono text-[10px] uppercase tracking-widest text-gold font-semibold mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="e.g. jane@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full bg-transparent border-b border-primary/25 py-3 text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none transition-colors duration-300 font-sans text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="interest"
          className="font-mono text-[10px] uppercase tracking-widest text-gold font-semibold mb-1"
        >
          I am interested in
        </label>
        <div className="relative">
          <select
            id="interest"
            value={formData.interest}
            onChange={(e) =>
              setFormData({ ...formData, interest: e.target.value })
            }
            className="w-full bg-transparent border-b border-primary/25 py-3 pr-8 text-foreground focus:border-primary focus:outline-none transition-colors duration-300 font-sans text-sm appearance-none cursor-pointer"
          >
            <option value="general" className="bg-background text-foreground">General Inquiry</option>
            <option value="volunteer" className="bg-background text-foreground">Volunteering</option>
            <option value="partner" className="bg-background text-foreground">Partnership</option>
            <option value="donate" className="bg-background text-foreground">Donations</option>
            <option value="media" className="bg-background text-foreground">Media / Press</option>
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="message"
          className="font-mono text-[10px] uppercase tracking-widest text-gold font-semibold mb-1"
        >
          Message
        </label>
        <textarea
          id="message"
          required
          placeholder="Tell us how you would like to get involved..."
          rows={4}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="w-full bg-transparent border-b border-primary/25 py-3 text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none transition-colors duration-300 font-sans text-sm resize-none"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-md px-8 py-6 group transition-all duration-300"
        disabled={formState === "loading"}
      >
        {formState === "loading" ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : formState === "success" ? (
          <span className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-gold animate-bounce" /> Message Sent!
          </span>
        ) : formState === "error" ? (
          <span className="flex items-center gap-2 text-red-200">
            Something went wrong
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Message
          </span>
        )}
      </Button>
    </form>
  );
}

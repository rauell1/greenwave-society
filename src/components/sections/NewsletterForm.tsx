"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setState("success");
      setEmail("");
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 w-full">
      <div className="relative flex-1">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border-b border-primary/25 py-2 text-sm text-foreground placeholder:text-muted-foreground/35 focus:border-primary focus:outline-none transition-colors duration-300 font-sans"
        />
      </div>
      <Button
        type="submit"
        size="sm"
        className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 shadow-sm shrink-0"
        disabled={state === "loading"}
      >
        {state === "success" ? "Subscribed!" : state === "loading" ? "..." : "Join"}
      </Button>
    </form>
  );
}

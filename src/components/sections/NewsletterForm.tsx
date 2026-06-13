"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 h-10 text-sm bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
      />
      <Button
        type="submit"
        size="sm"
        className="rounded-full shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
        disabled={state === "loading"}
      >
        {state === "success" ? "Subscribed!" : state === "loading" ? "..." : "Join"}
      </Button>
    </form>
  );
}

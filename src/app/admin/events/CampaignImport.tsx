"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/admin/api-error";

export default function CampaignImport({ missing }: { missing: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/events/import-campaign", { method: "POST" });
      if (!response.ok) return setMessage(await readApiError(response, "Unable to add the campaign events."));
      setMessage(`Added and published: ${(await response.json()).created.join(", ")}.`);
      router.refresh();
    } catch {
      setMessage("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
    <h2 className="font-semibold text-emerald-900">Nov–Dec 2026 campaign events</h2>
    <p className="mt-1 text-sm text-emerald-900/80">Not live on the site yet: {missing.join(", ")}. This publishes each one with its poster, ticket prices and the sign-up form. Times still to be decided show as “to be confirmed” and no venue is shown; set both later with Edit details.</p>
    <button disabled={busy} onClick={() => void run()} className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Adding…" : "Add and publish campaign events"}</button>
    {message && <p className="mt-2 text-sm" role="status">{message}</p>}
  </div>;
}

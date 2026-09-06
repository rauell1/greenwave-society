"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefundButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refund request failed.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-red-700 hover:underline">
        Refund
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-left">
      <p className="mb-2 text-xs text-red-800">Reverse this M-Pesa payment back to the payer&apos;s phone.</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional, shown in the M-Pesa remarks)"
        className="mb-2 w-full rounded border border-red-200 px-2 py-1 text-xs"
        rows={2}
      />
      {error && <p className="mb-2 text-xs text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={submitting} className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40">
          {submitting ? "Submitting..." : "Confirm refund"}
        </button>
        <button onClick={() => { setOpen(false); setError(""); }} disabled={submitting} className="rounded border px-3 py-1 text-xs">
          Cancel
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export function MembershipFeeControl({
  initialFeeKes, canManage,
}: {
  initialFeeKes: number;
  canManage: boolean;
}) {
  const [savedFee, setSavedFee] = useState(initialFeeKes);
  const [input, setInput] = useState(String(initialFeeKes));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const dirty = input.trim() !== String(savedFee);

  async function save() {
    const amountKes = Number(input);
    if (!Number.isInteger(amountKes) || amountKes <= 0) {
      setError("Enter a whole number of KES greater than 0.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings/membership-fee", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountKes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update.");
      setSavedFee(data.amountKes);
      setInput(String(data.amountKes));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      {!error && savedFlash && <span className="text-xs text-emerald-600">Saved</span>}
      <span className="text-sm text-slate-500">KES</span>
      <input
        type="number"
        min={1}
        step={1}
        value={input}
        disabled={!canManage || saving}
        onChange={(e) => setInput(e.target.value)}
        className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
      />
      <button
        onClick={save}
        disabled={!canManage || saving || !dirty}
        className="rounded-lg bg-[#1A5C38] px-3 py-1 text-xs font-semibold text-white disabled:opacity-40 hover:bg-[#154d2f] transition-colors"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

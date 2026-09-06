"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function MpesaFeatureToggle({
  initialEnabled, canManage,
}: {
  initialEnabled: boolean;
  canManage: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function toggle(next: boolean) {
    const previous = enabled;
    setEnabled(next);
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings/mpesa-membership", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update.");
      }
    } catch (err) {
      setEnabled(previous);
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
        {enabled ? "Enabled" : "Disabled"}
      </span>
      <Switch checked={enabled} disabled={!canManage || saving} onCheckedChange={toggle} />
    </div>
  );
}

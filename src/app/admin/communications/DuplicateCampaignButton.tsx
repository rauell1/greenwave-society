"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DuplicateCampaignButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDuplicate() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/communications/campaigns/${id}/duplicate`, { method: "POST" });
      let data;
      try {
        data = await res.json();
      } catch {
        alert(`Unexpected response format from server (${res.status}).`);
        setBusy(false);
        return;
      }

      if (res.ok && data.campaign?.id) {
        // Navigate directly to the edit page of the duplicated campaign
        router.push(`/admin/communications/${data.campaign.id}/edit`);
        router.refresh();
      } else {
        alert(data.error || "Failed to duplicate campaign");
        setBusy(false);
      }
    } catch {
      alert("An unexpected error occurred while duplicating.");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={busy}
      className="font-medium text-slate-500 hover:text-emerald-700 disabled:opacity-50 transition-colors"
    >
      {busy ? "Copying..." : "Duplicate"}
    </button>
  );
}

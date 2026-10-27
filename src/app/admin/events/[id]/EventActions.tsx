"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Send, QrCode } from "lucide-react";
import Link from "next/link";

interface EventActionsProps {
  event: { id: string; status: string; capacity: number | null };
  registrationId?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  checkInToken?: string;
}

export default function EventActions({
  event,
  registrationId,
  attendeeName = "Attendee",
  attendeeEmail = "",
  checkInToken,
}: EventActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingPass, setIsSendingPass] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
  });

  async function send(url: string, body: unknown) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setMessage(response.ok ? "Updated." : data.error || "Failed");
      if (response.ok) {
        toast.success(data.message || "Updated status.");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update.");
      }
    } catch {
      toast.error("Network error.");
    }
  }

  async function handleDelete() {
    if (!registrationId) return;
    const confirmed = window.confirm(
      `Permanently delete registration for "${attendeeName}" (${attendeeEmail})?\n\nThis will remove the test record from the roster and check-in database.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/events/${event.id}/registrations/${registrationId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Deleted registration for ${attendeeName}.`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to delete registration.");
      }
    } catch {
      toast.error("Network error deleting record.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSendPass() {
    if (!registrationId) return;
    setIsSendingPass(true);
    try {
      const res = await fetch(
        `/api/admin/events/${event.id}/registrations/${registrationId}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Digital pass sent to ${attendeeEmail}!`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to dispatch pass.");
      }
    } catch {
      toast.error("Network error dispatching digital pass.");
    } finally {
      setIsSendingPass(false);
    }
  }

  if (registrationId) {
    const passUrl = `/events/pass?id=${registrationId}${checkInToken ? `&token=${checkInToken}` : ""}`;

    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() =>
            void send(
              `/api/admin/events/${event.id}/registrations/${registrationId}/attendance`,
              { attendanceStatus: "checked_in" }
            )
          }
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline px-1 py-0.5"
          title="Mark as Checked In"
        >
          Check in
        </button>

        <button
          type="button"
          onClick={() =>
            void send(
              `/api/admin/events/${event.id}/registrations/${registrationId}/attendance`,
              { attendanceStatus: "not_checked_in" }
            )
          }
          className="text-xs text-amber-600 hover:text-amber-700 hover:underline px-1 py-0.5"
          title="Reset to Pending"
        >
          Pending
        </button>

        <button
          type="button"
          onClick={() =>
            void send(
              `/api/admin/events/${event.id}/registrations/${registrationId}/attendance`,
              { attendanceStatus: "no_show" }
            )
          }
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline px-1 py-0.5"
          title="Mark as No-Show"
        >
          No-show
        </button>

        <span className="text-slate-200">|</span>

        {/* Send digital pass email button */}
        <button
          type="button"
          onClick={handleSendPass}
          disabled={isSendingPass}
          className="text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 px-1 py-0.5"
          title="Send Digital Pass with QR Code via Email"
        >
          <Send className={`w-3 h-3 ${isSendingPass ? "animate-pulse" : ""}`} />
          <span>{isSendingPass ? "Sending..." : "Pass"}</span>
        </button>

        {/* View digital pass card link */}
        <Link
          href={passUrl}
          target="_blank"
          className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-0.5 px-1 py-0.5"
          title="Preview Digital Mobile Pass"
        >
          <QrCode className="w-3 h-3" />
        </Link>

        {/* Delete button for removing test records */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded p-1 transition-colors flex items-center gap-0.5 ml-1"
          title="Delete this registration record"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isDeleting ? "..." : "Delete"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Lifecycle</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["published", "cancelled", "completed"].map((status) => (
            <button
              key={status}
              onClick={() =>
                void send(`/api/admin/events/${event.id}/status`, { status })
              }
              className="rounded-lg border px-3 py-2 text-sm capitalize hover:bg-slate-50"
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Add attendee</h2>
        <div className="mt-3 grid gap-2">
          <input
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="rounded border p-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded border p-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded border p-2 text-sm"
          />
          <button
            onClick={() =>
              void send(`/api/admin/events/${event.id}/registrations`, form)
            }
            className="rounded bg-slate-900 p-2 text-sm text-white hover:bg-slate-800"
          >
            Register attendee
          </button>
        </div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    </div>
  );
}

export function CleanTestRecordsButton({
  eventId,
  testCount,
}: {
  eventId: string;
  testCount: number;
}) {
  const router = useRouter();
  const [cleaning, setCleaning] = useState(false);

  if (testCount <= 0) return null;

  async function handleClean() {
    const confirmed = window.confirm(
      `Clean all ${testCount} test registration record(s)?\n\nThis will remove entries with "test" in their name or email to restore a clean production UI.`
    );
    if (!confirmed) return;

    setCleaning(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/registrations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clean_test_records" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Cleaned ${testCount} test record(s).`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to clean test records.");
      }
    } catch {
      toast.error("Network error cleaning test records.");
    } finally {
      setCleaning(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClean}
      disabled={cleaning}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
      title="Delete all test records from this roster"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>{cleaning ? "Cleaning..." : `Clean ${testCount} Test Record${testCount > 1 ? "s" : ""}`}</span>
    </button>
  );
}

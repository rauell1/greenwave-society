import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import EventActions from "./EventActions";
import { QrCode, Download } from "lucide-react";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.EVENTS_READ);
  if (!(await isCmsFeatureEnabled("events"))) notFound();
  const { id } = await params;
  const event = await getDb().cmsEvent.findUnique({
    where: { id },
    include: {
      registrations: { orderBy: { createdAt: "desc" } },
      legacyBaraza: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!event) notFound();
  return (
    <section className="space-y-6">
      <div>
        <a
          href="/admin/events"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to events
        </a>
        <h1 className="mt-2 text-2xl font-bold">{event.title}</h1>
        <p className="text-sm text-slate-500">
          {event.startsAt.toLocaleString("en-KE")} -{" "}
          {event.endsAt.toLocaleString("en-KE")} · {event.location || "Online"}
        </p>
      </div>
      <EventActions
        event={{ id: event.id, status: event.status, capacity: event.capacity }}
      />
      <div className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">
            Attendees ({event.registrations.length})
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="/events/check-in"
              target="_blank"
              className="rounded-lg bg-emerald-700 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Door Check-in Station</span>
            </Link>
            <a
              href={`/api/admin/events/${event.id}/export`}
              download
              className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-slate-700"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-2">Name & Contact</th>
                <th className="p-2">Registration</th>
                <th className="p-2">Attendance</th>
                <th className="p-2 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {event.registrations.map((item) => {
                const meta = item.metadata as Record<string, any>;
                return (
                  <tr key={item.id} className="border-t hover:bg-slate-50/50 transition-colors">
                    <td className="p-2 align-top">
                      <p className="font-medium text-slate-900">{item.fullName}</p>
                      <p className="text-xs text-slate-500">{item.email} {item.phone ? `· ${item.phone}` : ""}</p>
                      {item.organization && (
                        <p className="text-xs text-emerald-700 font-medium">{item.organization}</p>
                      )}
                      {meta && Object.keys(meta).length > 0 && (
                        <details className="mt-2 text-xs text-slate-600 pb-2">
                          <summary className="cursor-pointer text-emerald-700 hover:underline font-medium">View registration details</summary>
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg border">
                            <ul className="space-y-1.5">
                              {Object.entries(meta).map(([k, v]) => (
                                <li key={k}>
                                  <strong className="text-slate-800">{k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>{" "}
                                  <span>{String(v)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </details>
                      )}
                    </td>
                    <td className="p-2 align-top capitalize text-xs">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2 align-top capitalize text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded-full ${
                        item.attendanceStatus === "checked_in"
                          ? "bg-emerald-100 text-emerald-800 font-medium"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.attendanceStatus.replaceAll("_", " ")}
                      </span>
                      {item.checkedInAt && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          {item.checkedInAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>
                    <td className="p-2 align-top text-right">
                    <EventActions
                      event={{
                        id: event.id,
                        status: event.status,
                        capacity: event.capacity,
                      }}
                      registrationId={item.id}
                    />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {event.legacyBaraza.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Linked legacy Baraza records ({event.legacyBaraza.length})
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Preserved separately from CMS attendee records.
          </p>
        </div>
      )}
    </section>
  );
}

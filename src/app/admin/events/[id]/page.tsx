import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import EventActions from "./EventActions";
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
          className="text-sm font-medium text-emerald-700"
        >
          ← Back to events
        </a>
        <h1 className="mt-2 text-2xl font-bold">{event.title}</h1>
        <p className="text-sm text-slate-500">
          {event.startsAt.toLocaleString("en-KE")} –{" "}
          {event.endsAt.toLocaleString("en-KE")} · {event.location || "Online"}
        </p>
      </div>
      <EventActions
        event={{ id: event.id, status: event.status, capacity: event.capacity }}
      />
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            Attendees ({event.registrations.length})
          </h2>
          <a
            href={`/api/admin/events/${event.id}/export`}
            download
            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export to CSV
          </a>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Registration</th>
                <th className="p-2">Attendance</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {event.registrations.map((item) => {
                const meta = item.metadata as Record<string, any>;
                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-2 align-top">
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-xs text-slate-500">{item.email}</p>
                      {meta && Object.keys(meta).length > 0 && (
                        <details className="mt-2 text-xs text-slate-600 pb-2">
                          <summary className="cursor-pointer text-emerald-700 hover:underline font-medium">View registration answers</summary>
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
                    <td className="p-2 align-top capitalize">{item.status}</td>
                    <td className="p-2 align-top capitalize">
                      {item.attendanceStatus.replaceAll("_", " ")}
                    </td>
                    <td className="p-2 align-top">
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import EventActions, { CleanTestRecordsButton } from "./EventActions";
import EventBroadcastPanel from "./EventBroadcastPanel";
import AdminQuickScanner from "./AdminQuickScanner";
import { QrCode, Download, Award, Store, Users } from "lucide-react";

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

  const graduandsCount = event.registrations.filter((r) => {
    const meta = (r.metadata as Record<string, any>) || {};
    return meta.role === "graduand";
  }).length;

  const vendorsCount = event.registrations.filter((r) => {
    const meta = (r.metadata as Record<string, any>) || {};
    return Boolean(meta.vendorName);
  }).length;

  const guestsCount = event.registrations.length - graduandsCount - vendorsCount;

  const remindedCount = event.registrations.filter((r) => {
    const meta = (r.metadata as Record<string, any>) || {};
    return Boolean(meta.reminderSentAt);
  }).length;

  const testCount = event.registrations.filter((r) => {
    const name = r.fullName.toLowerCase();
    const email = r.email.toLowerCase();
    return name.includes("test") || email.includes("test");
  }).length;

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

      {/* Segmented Counts Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Registrations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{event.registrations.length}</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm">
          <div className="text-xs text-amber-800 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Graduands (Cohort I)
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{graduandsCount}</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
          <div className="text-xs text-emerald-800 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" /> Market Vendors
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{vendorsCount}</div>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Guests & Supporters
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{guestsCount}</div>
        </div>
      </div>

      <EventActions
        event={{ id: event.id, status: event.status, capacity: event.capacity }}
      />

      {/* 1-Day Reminder Broadcast Panel */}
      <EventBroadcastPanel
        eventId={event.id}
        totalCount={event.registrations.length}
        graduandsCount={graduandsCount}
        vendorsCount={vendorsCount}
        guestsCount={guestsCount}
        remindedCount={remindedCount}
      />

      <div className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
          <div>
            <h2 className="font-semibold text-lg text-slate-900">
              Roster & Check-In Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Properly segmented attendee records for ceremony honors and stall allocation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CleanTestRecordsButton eventId={event.id} testCount={testCount} />

            <Link
              href="/events/check-in"
              target="_blank"
              className="rounded-lg bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Door Check-in Station</span>
            </Link>

            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <a
                href={`/api/admin/events/${event.id}/export`}
                download
                className="px-2.5 py-1 rounded-md text-slate-700 hover:bg-white hover:shadow-xs transition-all flex items-center gap-1 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                All CSV
              </a>
              <a
                href={`/api/admin/events/${event.id}/export?segment=graduands`}
                download
                className="px-2.5 py-1 rounded-md text-amber-900 hover:bg-white hover:shadow-xs transition-all flex items-center gap-1 font-medium"
              >
                <Award className="w-3.5 h-3.5 text-amber-700" />
                Graduands CSV
              </a>
              <a
                href={`/api/admin/events/${event.id}/export?segment=vendors`}
                download
                className="px-2.5 py-1 rounded-md text-emerald-900 hover:bg-white hover:shadow-xs transition-all flex items-center gap-1 font-medium"
              >
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                Vendors CSV
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <AdminQuickScanner eventId={event.id} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-2.5">Attendee / Brand</th>
                <th className="p-2.5">Track / Category</th>
                <th className="p-2.5">Registration</th>
                <th className="p-2.5">Attendance</th>
                <th className="p-2.5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {event.registrations.map((item) => {
                const meta = (item.metadata as Record<string, any>) || {};
                const isVendor = Boolean(meta.vendorName);
                const isGraduand = meta.role === "graduand";

                return (
                  <tr
                    key={item.id}
                    className={`border-t hover:bg-slate-50/50 transition-colors ${
                      isGraduand ? "bg-amber-50/20" : isVendor ? "bg-emerald-50/20" : ""
                    }`}
                  >
                    <td className="p-2.5 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{item.fullName}</span>
                        {isGraduand && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Cohort I
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{item.email} {item.phone ? `· ${item.phone}` : ""}</p>
                      {item.organization && (
                        <p className="text-xs text-emerald-700 font-medium mt-0.5">{item.organization}</p>
                      )}
                      {meta && Object.keys(meta).length > 0 && (
                        <details className="mt-2 text-xs text-slate-600 pb-2">
                          <summary className="cursor-pointer text-emerald-700 hover:underline font-medium">View details</summary>
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
                    <td className="p-2.5 align-top">
                      {isGraduand ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200">
                          🎓 Graduand
                        </span>
                      ) : isVendor ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold text-xs border border-emerald-200">
                          🏪 Vendor: {meta.category || "General"}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                          👥 Guest ({meta.guestCount || 1} pax)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 align-top capitalize text-xs">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {item.status}
                      </span>
                      {meta.reminderSentAt && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                          <span>✓ Reminded</span>
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 align-top capitalize text-xs">
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
                    <td className="p-2.5 align-top text-right">
                      <EventActions
                        event={{
                          id: event.id,
                          status: event.status,
                          capacity: event.capacity,
                        }}
                        registrationId={item.id}
                        attendeeName={item.fullName}
                        attendeeEmail={item.email}
                        checkInToken={meta.checkInToken || meta.ticketToken}
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

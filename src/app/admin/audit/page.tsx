import { notFound } from "next/navigation";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission(PERMISSIONS.AUDIT_READ);
  if (!(await isCmsFeatureEnabled("audit"))) notFound();

  const query = await searchParams;
  const { page, pageSize, skip } = parsePagination(query);
  const action = typeof query.action === "string" ? query.action.trim() : "";
  const actor = typeof query.actor === "string" ? query.actor.trim() : "";
  const where = {
    ...(action ? { action: { contains: action, mode: "insensitive" as const } } : {}),
    ...(actor ? { actor: { contains: actor, mode: "insensitive" as const } } : {}),
  };
  const [logs, total] = await Promise.all([
    getDb().auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
    getDb().auditLog.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Audit logs</h1><p className="text-sm text-gray-500">Security and administrative activity across the CMS.</p></div>
      <form className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
        <input name="action" defaultValue={action} placeholder="Filter by action" className="rounded-md border px-3 py-2 text-sm" />
        <input name="actor" defaultValue={actor} placeholder="Filter by actor" className="rounded-md border px-3 py-2 text-sm" />
        <button className="rounded-md bg-[#1A5C38] px-4 py-2 text-sm font-semibold text-white">Filter</button>
      </form>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3">Outcome</th></tr></thead>
          <tbody className="divide-y">{logs.map((log) => <tr key={log.id}><td className="whitespace-nowrap px-4 py-3">{log.createdAt.toLocaleString("en-KE")}</td><td className="px-4 py-3">{log.actor}</td><td className="px-4 py-3 font-medium">{log.action}</td><td className="px-4 py-3 text-gray-500">{log.resourceType ? `${log.resourceType}${log.resourceId ? ` · ${log.resourceId}` : ""}` : "—"}</td><td className="px-4 py-3">{log.outcome ?? "—"}</td></tr>)}</tbody>
        </table></div>
        {!logs.length && <p className="p-8 text-center text-sm text-gray-500">No audit records match these filters.</p>}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600"><span>Page {page} of {pages} · {total} records</span><div className="flex gap-2">{page > 1 && <a className="rounded border px-3 py-1.5" href={`?page=${page - 1}&action=${encodeURIComponent(action)}&actor=${encodeURIComponent(actor)}`}>Previous</a>}{page < pages && <a className="rounded border px-3 py-1.5" href={`?page=${page + 1}&action=${encodeURIComponent(action)}&actor=${encodeURIComponent(actor)}`}>Next</a>}</div></div>
    </section>
  );
}

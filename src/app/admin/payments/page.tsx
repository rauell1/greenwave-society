import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import { PAYMENT_STATUSES } from "@/lib/payments/constants";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const admin = await requirePermission(PERMISSIONS.MEMBERS_READ);
  if (!(await isCmsFeatureEnabled("members"))) notFound();
  const query = await searchParams;
  const { page, pageSize, skip } = parsePagination(query);
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const requestedStatus = typeof query.status === "string" ? query.status : "";
  const status = PAYMENT_STATUSES.includes(requestedStatus as typeof PAYMENT_STATUSES[number]) ? requestedStatus : "";
  const where = {
    ...(status ? { status } : {}),
    ...(search ? {
      OR: [
        { phoneNumber: { contains: search, mode: "insensitive" as const } },
        { mpesaReceiptNumber: { contains: search, mode: "insensitive" as const } },
        { registration: { is: { OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ] } } },
      ],
    } : {}),
  };
  const [payments, total, counts] = await Promise.all([
    getDb().membershipPayment.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: pageSize,
      include: { registration: { select: { id: true, fullName: true, email: true } } },
    }),
    getDb().membershipPayment.count({ where }),
    getDb().membershipPayment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const params = (targetPage: number) => `?page=${targetPage}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;

  return <section className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Membership Payments</h1>
        <p className="text-sm text-slate-500">Every M-Pesa STK Push attempt for the membership fee, successful or not.</p>
      </div>
      {hasPermission(admin, PERMISSIONS.MEMBERS_EXPORT) &&
        <a href={`/api/admin/payments/export${status ? `?status=${status}` : ""}`} className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800">Export filtered CSV</a>}
    </div>
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {PAYMENT_STATUSES.map(value => <div key={value} className="rounded-xl border bg-white p-4"><p className="text-xs uppercase text-slate-500">{value}</p><p className="mt-1 text-2xl font-semibold">{counts.find(item => item.status === value)?._count._all ?? 0}</p></div>)}
    </div>
    <form className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_220px_auto]">
      <input name="search" defaultValue={search} placeholder="Search name, email, phone, or receipt no." className="rounded-lg border px-3 py-2"/>
      <select name="status" defaultValue={status} className="rounded-lg border px-3 py-2"><option value="">All statuses</option>{PAYMENT_STATUSES.map(value => <option key={value} value={value}>{value}</option>)}</select>
      <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white">Filter</button>
    </form>
    <div className="overflow-hidden rounded-xl border bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>
        <th className="px-4 py-3">Applicant</th>
        <th className="px-4 py-3">Phone</th>
        <th className="px-4 py-3">Amount</th>
        <th className="px-4 py-3">Status</th>
        <th className="px-4 py-3">Receipt No.</th>
        <th className="px-4 py-3">Initiated</th>
        <th className="px-4 py-3"></th>
      </tr></thead>
      <tbody className="divide-y">{payments.map(payment => <tr key={payment.id}>
        <td className="px-4 py-3"><p className="font-medium text-slate-900">{payment.registration.fullName}</p><p className="text-xs text-slate-500">{payment.registration.email}</p></td>
        <td className="px-4 py-3">{payment.phoneNumber}</td>
        <td className="px-4 py-3">KES {payment.amount}</td>
        <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${payment.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700" : payment.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{payment.status}</span>{payment.failureReason && <p className="mt-1 text-xs text-slate-400">{payment.failureReason}</p>}</td>
        <td className="px-4 py-3">{payment.mpesaReceiptNumber ?? "—"}</td>
        <td className="whitespace-nowrap px-4 py-3">{payment.initiatedAt.toLocaleString("en-KE")}</td>
        <td className="px-4 py-3"><Link href={`/admin/members/${payment.registration.id}`} className="font-medium text-emerald-700">View applicant</Link></td>
      </tr>)}</tbody>
    </table></div>{!payments.length && <p className="p-8 text-center text-sm text-slate-500">No payment records match these filters.</p>}</div>
    <div className="flex items-center justify-between text-sm text-slate-600"><span>Page {page} of {pages} · {total} records</span><div className="flex gap-2">{page > 1 && <Link className="rounded border px-3 py-1.5" href={params(page - 1)}>Previous</Link>}{page < pages && <Link className="rounded border px-3 py-1.5" href={params(page + 1)}>Next</Link>}</div></div>
  </section>;
}

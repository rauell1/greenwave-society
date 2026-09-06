import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import MemberActions from "./MemberActions";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission(PERMISSIONS.MEMBERS_READ);
  if (!(await isCmsFeatureEnabled("members"))) notFound();
  const { id } = await params;
  const canUpdate = hasPermission(admin, PERMISSIONS.MEMBERS_UPDATE);
  const canReview = hasPermission(admin, PERMISSIONS.MEMBERS_REVIEW);
  const canViewNotes = canUpdate || canReview;
  const [member, notes] = await Promise.all([
    getDb().memberRegistration.findUnique({ where: { id }, include: { statusHistory: { orderBy: { createdAt: "desc" }, take: 50 }, activity: { orderBy: { createdAt: "desc" }, take: 50 } } }),
    canViewNotes ? getDb().memberNote.findMany({ where: { registrationId: id }, orderBy: { createdAt: "desc" }, take: 50 }) : Promise.resolve([]),
  ]);
  if (!member) notFound();
  return <section className="space-y-6"><div><a href="/admin/members" className="text-sm font-medium text-emerald-700">← Back to members</a><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-slate-900">{member.fullName}</h1><span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize">{member.status}</span></div><p className="text-sm text-slate-500">Applied {member.createdAt.toLocaleString("en-KE")}</p></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]"><div className="space-y-6"><div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2"><Field label="Email" value={member.email}/><Field label="Phone" value={member.phone}/><Field label="County" value={member.county}/><Field label="Occupation" value={member.occupation}/><Field label="Organization" value={member.organization || "—"}/><Field label="Interests" value={member.interests.join(", ")}/><div className="sm:col-span-2"><Field label="Motivation" value={member.motivation}/></div></div>
      <div className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Status history</h2><div className="mt-4 space-y-4">{member.statusHistory.map(item => <div key={item.id} className="border-l-2 border-emerald-200 pl-4"><p className="text-sm font-medium capitalize">{item.fromStatus ? `${item.fromStatus} → ` : ""}{item.toStatus}</p><p className="text-xs text-slate-500">{item.actorEmail} · {item.createdAt.toLocaleString("en-KE")}</p>{item.reason && <p className="mt-1 text-sm text-slate-700">{item.reason}</p>}</div>)}</div></div>
      <div className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Portal activity</h2><div className="mt-4 space-y-2">{member.activity.map(item => <p key={item.id} className="text-sm"><span className="capitalize">{item.event}</span> <span className="text-slate-500">· {item.createdAt.toLocaleString("en-KE")}</span></p>)}{!member.activity.length && <p className="text-sm text-slate-500">No portal activity.</p>}</div></div></div>
      <aside><MemberActions memberId={member.id} status={member.status} emailStatus={member.onboardingEmailStatus} emailError={member.onboardingEmailLastError} notes={notes.map(note => ({ id: note.id, body: note.body, authorEmail: note.authorEmail, createdAt: note.createdAt.toISOString() }))} canUpdate={canUpdate} canReview={canReview}/></aside></div>
  </section>;
}

function Field({ label, value }: { label: string; value: string }) { return <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{value}</p></div>; }

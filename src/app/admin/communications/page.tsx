import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import CampaignCreator from "./CampaignCreator";

export default async function CommunicationsPage(){const admin=await getCurrentAdmin();if(!admin)redirect("/admin/login");if(!(await isCmsFeatureEnabled("communications")))notFound();if(!hasPermission(admin,PERMISSIONS.COMMUNICATIONS_READ))redirect("/admin/dashboard");const campaigns=await getDb().cmsCampaign.findMany({orderBy:{createdAt:"desc"},include:{_count:{select:{recipients:true}}}});return <section className="space-y-6"><header><h1 className="text-2xl font-semibold">Communications</h1><p className="text-sm text-slate-500">Draft, preview and deliver branded Greenwave emails with durable recipient records.</p></header>{hasPermission(admin,PERMISSIONS.COMMUNICATIONS_CREATE)&&<CampaignCreator/>}<div className="overflow-hidden rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Campaign</th><th className="p-3">Status</th><th className="p-3">Recipients</th><th className="p-3"></th></tr></thead><tbody>{campaigns.map(item=><tr key={item.id} className="border-t"><td className="p-3"><p className="font-medium">{item.name}</p><p className="text-xs text-slate-500">{item.subject}</p></td><td className="p-3 capitalize">{item.status}</td><td className="p-3">{item._count.recipients}</td><td className="p-3"><Link className="font-medium text-emerald-700" href={`/admin/communications/${item.id}`}>Open</Link></td></tr>)}</tbody></table>{!campaigns.length&&<p className="p-8 text-center text-sm text-slate-500">No campaigns yet.</p>}</div></section>}

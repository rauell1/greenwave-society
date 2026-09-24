import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { getDb } from "@/lib/db";
import CampaignEditor from "./CampaignEditor";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (!(await isCmsFeatureEnabled("communications"))) notFound();
  if (!hasPermission(admin, PERMISSIONS.COMMUNICATIONS_CREATE)) redirect("/admin/dashboard");
  
  const [campaign, events] = await Promise.all([
    getDb().cmsCampaign.findUnique({
      where: { id: (await params).id }
    }),
    getDb().cmsEvent.findMany({ select: { id: true, title: true, slug: true }, orderBy: { startsAt: "desc" } })
  ]);
  
  if (!campaign) notFound();
  if (campaign.status !== "draft") redirect(`/admin/communications/${campaign.id}`);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm uppercase text-emerald-700">Edit</p>
        <h1 className="text-2xl font-semibold">{campaign.name}</h1>
      </header>
      <CampaignEditor campaign={campaign} events={events} />
    </section>
  );
}

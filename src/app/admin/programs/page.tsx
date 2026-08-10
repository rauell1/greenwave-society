import { notFound, redirect } from "next/navigation";
import ContentManager from "../content/ContentManager";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/policy";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";

export const metadata = { title: "Programs | Greenwave Admin" };

export default async function ProgramsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");
  if (!hasPermission(admin, PERMISSIONS.CONTENT_READ)) redirect("/admin/dashboard");
  if (!(await isCmsFeatureEnabled("programs"))) notFound();
  return <ContentManager typeFilter="program" title="Programs" capabilities={{ create: hasPermission(admin, PERMISSIONS.CONTENT_CREATE), update: hasPermission(admin, PERMISSIONS.CONTENT_UPDATE), review: hasPermission(admin, PERMISSIONS.CONTENT_REVIEW), publish: hasPermission(admin, PERMISSIONS.CONTENT_PUBLISH), archive: hasPermission(admin, PERMISSIONS.CONTENT_ARCHIVE) }} />;
}

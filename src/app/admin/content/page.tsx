import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { isCmsFeatureEnabled } from "@/lib/cms/feature-flags";
import { notFound } from "next/navigation";
import { hasPermission } from "@/lib/auth/policy";
import ContentManager from "./ContentManager";

export default async function ContentPage() {
  const admin = await requirePermission(PERMISSIONS.CONTENT_READ);
  if (!(await isCmsFeatureEnabled("content"))) notFound();
  return <ContentManager capabilities={{ create: hasPermission(admin, PERMISSIONS.CONTENT_CREATE), update: hasPermission(admin, PERMISSIONS.CONTENT_UPDATE), review: hasPermission(admin, PERMISSIONS.CONTENT_REVIEW), publish: hasPermission(admin, PERMISSIONS.CONTENT_PUBLISH), archive: hasPermission(admin, PERMISSIONS.CONTENT_ARCHIVE) }} />;
}

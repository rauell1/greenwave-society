import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAdminGalleryConfig } from "@/lib/cms/gallery";
import GalleryManager from "./GalleryManager";

export const metadata: Metadata = {
  title: "Public Gallery Manager | Admin CMS | Greenwave Society",
};

export default async function AdminGalleryPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  if (!hasPermission(admin, PERMISSIONS.CONTENT_READ)) {
    redirect("/admin/dashboard");
  }

  const { curated, available } = await getAdminGalleryConfig();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Public Gallery Manager</h1>
        <p className="text-sm text-slate-500 mt-1">
          Curate which photographs appear on the public photo gallery page (<a href="/gallery" target="_blank" className="text-emerald-600 underline">/gallery</a>) and customize their captions.
        </p>
      </header>

      <GalleryManager
        initialCurated={curated}
        available={available}
        canUpdate={hasPermission(admin, PERMISSIONS.CONTENT_UPDATE)}
        canUploadMedia={hasPermission(admin, PERMISSIONS.MEDIA_UPLOAD)}
      />
    </div>
  );
}

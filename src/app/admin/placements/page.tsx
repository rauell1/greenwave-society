import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/policy";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPublicImagePlacements, getAvailableCmsImages, DEFAULT_PLACEMENTS } from "@/lib/cms/placements";
import PlacementsManager from "./PlacementsManager";

export const metadata: Metadata = {
  title: "Image Placements | Admin CMS | Greenwave Society",
};

export default async function PlacementsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  if (!hasPermission(admin, PERMISSIONS.CONTENT_READ)) {
    redirect("/admin/dashboard");
  }

  const [currentPlacements, availableImages] = await Promise.all([
    getPublicImagePlacements(),
    getAvailableCmsImages(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Frontend Image Placements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and switch photographs displayed in the key visual sections of the website.
        </p>
      </header>

      <PlacementsManager
        initialPlacements={currentPlacements}
        defaultPlacements={DEFAULT_PLACEMENTS}
        availableImages={availableImages}
        canUpdate={hasPermission(admin, PERMISSIONS.CONTENT_UPDATE)}
        canUploadMedia={hasPermission(admin, PERMISSIONS.MEDIA_UPLOAD)}
      />
    </div>
  );
}

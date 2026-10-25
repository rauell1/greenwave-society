import "server-only";

import { cache } from "react";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { GalleryImage } from "@/components/gallery/GalleryGrid";

export interface CuratedGalleryItem {
  src: string;
  alt: string;
  caption?: string;
  active: boolean;
  order?: number;
}

export interface AvailableGalleryImage {
  src: string;
  filename: string;
  source: "repo" | "blob" | "poster";
}

export const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { src: "/images/20241214_135952.jpg", alt: "Community engagement event in 2024" },
  { src: "/images/g-59.jpg", alt: "Youth leadership workshop" },
  { src: "/images/20250404_134843.jpg", alt: "Tree planting and conservation" },
  { src: "/images/g-54.jpg", alt: "Mentorship session" },
  { src: "/images/g.jpg", alt: "Community baraza" },
  { src: "/images/20241214_130327.jpg", alt: "Greenwave volunteers" },
  { src: "/images/g-155.jpg", alt: "Environmental education" },
  { src: "/images/g-230.jpg", alt: "Team building activities" },
  { src: "/images/g-211.jpg", alt: "Local community meeting" },
  { src: "/images/20250215_174908.jpg", alt: "Wellness picnic 2025" },
  { src: "/images/20241214_180058.jpg", alt: "Conservation training" },
  { src: "/images/20250401_100800.jpg", alt: "Kangemi restoration efforts" },
  { src: "/images/g-202.jpg", alt: "Youth enterprise training" },
  { src: "/images/20240706135832_IMG_2321.JPG", alt: "Ngong hike participants" },
  { src: "/images/g-101.jpg", alt: "Group discussion" },
  { src: "/images/20241214_180212.jpg", alt: "School outreach program" },
  { src: "/images/g-221.jpg", alt: "Greenwave strategic meeting" },
  { src: "/images/g-3.jpg", alt: "Mental health awareness" },
  { src: "/images/g-83.jpg", alt: "Field activities" },
  { src: "/images/g-102.jpg", alt: "Volunteer appreciation" },
  { src: "/images/g-136.jpg", alt: "Capacity building session" },
  { src: "/images/g-84.jpg", alt: "Project implementation" },
  { src: "/images/DSC_8039.jpg", alt: "Team planning" },
  { src: "/images/IMG_9411.jpg", alt: "Impact overview" },
  { src: "/images/20250404_134814.jpg", alt: "Community dialogue" },
  { src: "/images/20250726_183058.jpg", alt: "Environmental action day" },
  { src: "/images/g-143.jpg", alt: "Youth leaders network" },
  { src: "/images/g-216.jpg", alt: "Partnership meeting" },
  { src: "/images/20250215_170104.jpg", alt: "Program launch" },
  { src: "/images/20250404_134529.jpg", alt: "Field research" },
  { src: "/images/20250215_173437.jpg", alt: "Awareness campaign" },
  { src: "/images/g-188.jpg", alt: "Community engagement" },
  { src: "/images/20241214_135825.jpg", alt: "Training workshop" },
  { src: "/images/20240706180132_IMG_2493.jpg", alt: "Ngong hike summit" },
  { src: "/images/20240706123308_IMG_2070.jpg", alt: "Ngong hike trail" },
];

export const getPublicGalleryImages = cache(async (): Promise<GalleryImage[]> => {
  try {
    const entry = await getDb().cmsContent.findUnique({
      where: {
        type_slug: {
          type: "gallery",
          slug: "curated-gallery",
        },
      },
      select: { metadata: true, status: true },
    });

    if (!entry || entry.status !== "published" || !entry.metadata) {
      return DEFAULT_GALLERY_IMAGES;
    }

    const parsed = JSON.parse(entry.metadata) as { images?: CuratedGalleryItem[] };
    if (!Array.isArray(parsed?.images) || parsed.images.length === 0) {
      return DEFAULT_GALLERY_IMAGES;
    }

    const activeImages = parsed.images
      .filter((img) => img.active !== false && typeof img.src === "string" && img.src.trim())
      .map((img) => ({
        src: img.src.trim(),
        alt: img.alt?.trim() || "Greenwave Society photo",
      }));

    return activeImages.length > 0 ? activeImages : DEFAULT_GALLERY_IMAGES;
  } catch (error) {
    logger.warn("Unable to load CMS gallery images from database, using defaults", { error: String(error) });
    return DEFAULT_GALLERY_IMAGES;
  }
});

export async function getAdminGalleryConfig(): Promise<{
  curated: CuratedGalleryItem[];
  available: AvailableGalleryImage[];
}> {
  const map = new Map<string, AvailableGalleryImage>();

  // 1. Catalog (all 829 repo images)
  try {
    const catalogPath = path.join(process.cwd(), "docs/repo-image-catalog.json");
    const catalogRaw = await readFile(catalogPath, "utf-8");
    const catalogFiles = JSON.parse(catalogRaw) as string[];
    for (const file of catalogFiles) {
      const src = `/images/${file}`;
      map.set(src, { src, filename: file, source: "repo" });
    }
  } catch (err) {
    logger.warn("Could not read repo-image-catalog.json for gallery", { err: String(err) });
  }

  // 2. Read public/images if present
  try {
    const imagesDir = path.join(process.cwd(), "public/images");
    const files = await readdir(imagesDir);
    for (const file of files) {
      if (/\.(jpe?g|png|webp|svg)$/i.test(file)) {
        const src = `/images/${file}`;
        if (!map.has(src)) {
          map.set(src, { src, filename: file, source: "repo" });
        }
      }
    }
  } catch {
    // Expected in deployments where public/images is gitignored
  }

  // 3. docs/image-manifest.json
  try {
    const manifestPath = path.join(process.cwd(), "docs/image-manifest.json");
    const manifestRaw = await readFile(manifestPath, "utf-8");
    const manifestFiles = JSON.parse(manifestRaw) as string[];
    for (const file of manifestFiles) {
      const src = `/images/${file}`;
      if (!map.has(src)) {
        map.set(src, { src, filename: file, source: "repo" });
      }
    }
  } catch {
    // fallback
  }

  // 4. Read posters from public/posters
  try {
    const postersDir = path.join(process.cwd(), "public/posters");
    const posterFiles = await readdir(postersDir);
    for (const file of posterFiles) {
      if (/\.(png|jpe?g|webp)$/i.test(file)) {
        const src = `/posters/${file}`;
        map.set(src, { src, filename: file, source: "poster" });
      }
    }
  } catch {
    const defaultPosters = [
      "empower360-cohort-1-graduation-flyer.png",
      "empower360-market-vendor-flyer.png",
      "empower360-graduation-story.png",
      "empower360-market-vendor-story.png",
    ];
    for (const file of defaultPosters) {
      const src = `/posters/${file}`;
      map.set(src, { src, filename: file, source: "poster" });
    }
  }

  // 5. Blob / external uploads from database
  try {
    const mediaAssets = await getDb().cmsMediaAsset.findMany({
      where: { status: "active" },
      select: { url: true, filename: true },
      take: 1000,
      orderBy: { createdAt: "desc" },
    });
    for (const asset of mediaAssets) {
      if (!map.has(asset.url)) {
        map.set(asset.url, {
          src: asset.url,
          filename: asset.filename,
          source: "blob",
        });
      }
    }
  } catch (err) {
    logger.warn("Could not query cmsMediaAsset for gallery", { err: String(err) });
  }

  const available = Array.from(map.values());

  // Load stored curation from database
  let storedItems: CuratedGalleryItem[] = [];
  try {
    const entry = await getDb().cmsContent.findUnique({
      where: {
        type_slug: {
          type: "gallery",
          slug: "curated-gallery",
        },
      },
      select: { metadata: true },
    });
    if (entry?.metadata) {
      const parsed = JSON.parse(entry.metadata);
      if (Array.isArray(parsed?.images)) {
        storedItems = parsed.images;
      }
    }
  } catch {
    // fallback
  }

  // If no DB curation yet, initialize with DEFAULT_GALLERY_IMAGES
  if (storedItems.length === 0) {
    storedItems = DEFAULT_GALLERY_IMAGES.map((img) => ({
      src: img.src,
      alt: img.alt,
      active: true,
    }));
  }

  return { curated: storedItems, available };
}

export async function saveAdminGalleryConfig(
  images: CuratedGalleryItem[],
  adminId: string
) {
  const db = getDb();
  const metadata = JSON.stringify({ images });

  const saved = await db.cmsContent.upsert({
    where: {
      type_slug: {
        type: "gallery",
        slug: "curated-gallery",
      },
    },
    create: {
      type: "gallery",
      slug: "curated-gallery",
      title: "Curated Public Photo Gallery",
      excerpt: "Curated collection of images for the public /gallery page.",
      body: "Curated list of public images and alt text.",
      metadata,
      status: "published",
      publishedAt: new Date(),
      createdById: adminId,
      updatedById: adminId,
    },
    update: {
      title: "Curated Public Photo Gallery",
      metadata,
      status: "published",
      publishedAt: new Date(),
      updatedById: adminId,
    },
  });

  revalidatePath("/gallery");
  return saved;
}

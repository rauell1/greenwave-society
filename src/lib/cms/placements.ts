import "server-only";

import { cache } from "react";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export interface PlacementSlotConfig {
  id: string;
  name: string;
  section: string;
  description: string;
  src: string;
  alt: string;
  defaultSrc: string;
  defaultAlt: string;
  aspectRatio: string;
  route: string;
}

export const DEFAULT_PLACEMENTS: Record<string, { src: string; alt: string; name: string; section: string; description: string; route: string; aspectRatio: string }> = {
  heroPrimary: {
    name: "Homepage Hero - Front Feature",
    section: "Homepage",
    description: "The prominent front-facing image on the homepage hero collage.",
    src: "/images/20260827_135241.jpg",
    alt: "Greenwave Society members collaborating during the Members' Meet and Connect in Kenya",
    route: "/",
    aspectRatio: "aspect-square",
  },
  heroSecondary: {
    name: "Homepage Hero - Backdrop Visual",
    section: "Homepage",
    description: "The secondary atmospheric image layered behind the main hero visual.",
    src: "/images/g-28.jpg",
    alt: "Greenwave Society youth celebrating at a community event in Kenya",
    route: "/",
    aspectRatio: "aspect-square",
  },
  about: {
    name: "About Section - Story Feature",
    section: "About Us",
    description: "Featured visual alongside our mission and core systems-thinking pillars.",
    src: "/images/20241214_135952.jpg",
    alt: "Youth in community environmental discussion in Kenya",
    route: "/#about",
    aspectRatio: "aspect-[4/5]",
  },
  programs: {
    name: "Programs Section - Lead Visual",
    section: "Programs",
    description: "Showcase visual highlighting youth leadership and mentorship.",
    src: "/images/g-59.jpg",
    alt: "Youth leadership workshop and mentorship session in Kenya",
    route: "/#programs",
    aspectRatio: "aspect-video",
  },
  graduation: {
    name: "Empower 360 Graduation Feature",
    section: "Events & Graduation",
    description: "Featured visual and open graph preview image for the Cohort I graduation page.",
    src: "/posters/empower360-cohort-1-graduation-flyer.png",
    alt: "Empower 360 Cohort I Graduation Official Flyer",
    route: "/events/graduation-cohort-1",
    aspectRatio: "aspect-[723/1024]",
  },
  mediaKit: {
    name: "Media Kit - Press Visual",
    section: "Press & Media Kit",
    description: "Primary visual asset featured in the downloadable media kit for press and partners.",
    src: "/images/IMG_9415.jpg",
    alt: "Greenwave Society changemakers field work and tree planting in Kenya",
    route: "/media-kit",
    aspectRatio: "aspect-video",
  },
};

export const getPublicImagePlacements = cache(async (): Promise<Record<string, { src: string; alt: string }>> => {
  const fallback = Object.fromEntries(
    Object.entries(DEFAULT_PLACEMENTS).map(([k, v]) => [k, { src: v.src, alt: v.alt }])
  );

  try {
    const entry = await getDb().cmsContent.findUnique({
      where: {
        type_slug: {
          type: "placement",
          slug: "frontend-images",
        },
      },
      select: { metadata: true, status: true },
    });

    if (!entry || entry.status !== "published" || !entry.metadata) {
      return fallback;
    }

    const parsed = JSON.parse(entry.metadata) as Record<string, { src?: string; alt?: string }>;
    const result: Record<string, { src: string; alt: string }> = { ...fallback };

    for (const [key, val] of Object.entries(parsed)) {
      if (val && typeof val.src === "string" && val.src.trim()) {
        result[key] = {
          src: val.src.trim(),
          alt: typeof val.alt === "string" && val.alt.trim() ? val.alt.trim() : (fallback[key]?.alt || ""),
        };
      }
    }

    return result;
  } catch (error) {
    logger.warn("Unable to load CMS image placements from database, using defaults", { error: String(error) });
    return fallback;
  }
});

export interface AvailableCmsImage {
  url: string;
  filename: string;
  source: "repo" | "blob" | "poster";
}

export async function getAvailableCmsImages(): Promise<AvailableCmsImage[]> {
  const map = new Map<string, AvailableCmsImage>();

  // 1. Load from docs/repo-image-catalog.json (contains all 829 repo images, checked into git)
  try {
    const catalogPath = path.join(process.cwd(), "docs/repo-image-catalog.json");
    const catalogRaw = await readFile(catalogPath, "utf-8");
    const catalogFiles = JSON.parse(catalogRaw) as string[];
    for (const file of catalogFiles) {
      const url = `/images/${file}`;
      map.set(url, { url, filename: file, source: "repo" });
    }
  } catch (err) {
    logger.warn("Could not read repo-image-catalog.json", { err: String(err) });
  }

  // 2. Read public/images directory if present on local disk
  try {
    const imagesDir = path.join(process.cwd(), "public/images");
    const files = await readdir(imagesDir);
    for (const file of files) {
      if (/\.(jpe?g|png|webp|svg)$/i.test(file)) {
        const url = `/images/${file}`;
        if (!map.has(url)) {
          map.set(url, { url, filename: file, source: "repo" });
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
      const url = `/images/${file}`;
      if (!map.has(url)) {
        map.set(url, { url, filename: file, source: "repo" });
      }
    }
  } catch {
    // fallback
  }

  // 4. Read posters in public/posters
  try {
    const postersDir = path.join(process.cwd(), "public/posters");
    const posterFiles = await readdir(postersDir);
    for (const file of posterFiles) {
      if (/\.(png|jpe?g|webp)$/i.test(file)) {
        const url = `/posters/${file}`;
        map.set(url, { url, filename: file, source: "poster" });
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
      const url = `/posters/${file}`;
      map.set(url, { url, filename: file, source: "poster" });
    }
  }

  // 5. Query cmsMediaAsset from database for all blob/external storage uploads
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
          url: asset.url,
          filename: asset.filename,
          source: "blob",
        });
      }
    }
  } catch (err) {
    logger.warn("Could not query cmsMediaAsset for placements", { err: String(err) });
  }

  return Array.from(map.values());
}

export async function saveImagePlacements(
  placements: Record<string, { src: string; alt: string }>,
  adminId: string
) {
  const db = getDb();
  const metadata = JSON.stringify(placements);

  const saved = await db.cmsContent.upsert({
    where: {
      type_slug: {
        type: "placement",
        slug: "frontend-images",
      },
    },
    create: {
      type: "placement",
      slug: "frontend-images",
      title: "Frontend Image Placements",
      excerpt: "Configured placements for Hero, About, Programs, Graduation, and Media Kit.",
      body: "Active configuration for key frontend image placements.",
      metadata,
      status: "published",
      publishedAt: new Date(),
      createdById: adminId,
      updatedById: adminId,
    },
    update: {
      title: "Frontend Image Placements",
      metadata,
      status: "published",
      publishedAt: new Date(),
      updatedById: adminId,
    },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/programs");
  revalidatePath("/events/graduation-cohort-1");
  revalidatePath("/media-kit");

  return saved;
}

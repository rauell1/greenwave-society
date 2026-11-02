import "server-only";
import fs from "node:fs";
import path from "node:path";

export interface GraduationPhoto {
  id: string;
  index: number;
  filename: string;
  width: number;
  height: number;
  aspect: "landscape" | "portrait";
  originalUrl: string;
  webUrl: string;
  thumbUrl: string;
  relativeWebPath: string;
  relativeThumbPath: string;
}

const CDN_ORIGIN = process.env.IMAGE_CDN_ORIGIN || "https://cdn.greenwavesociety.org";
const PREFIX = "images/events/graduation-cohort-1";
const TOTAL_PHOTOS = 296;

/**
 * Loads all graduation photos from the generated manifest, or builds
 * the canonical metadata list for all 296 photos if manifest is pending.
 */
export async function getGraduationPhotos(): Promise<GraduationPhoto[]> {
  try {
    const manifestPath = path.join(process.cwd(), "docs/graduation-photos-manifest.json");
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, "utf-8");
      const data = JSON.parse(raw) as GraduationPhoto[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // fallback to predictable canonical format
  }

  // Canonical fallback for all 296 ceremony photos
  const photos: GraduationPhoto[] = [];
  for (let i = 1; i <= TOTAL_PHOTOS; i++) {
    const pad = String(i).padStart(3, "0");
    const id = `graduation_cohort_1_${pad}`;
    photos.push({
      id,
      index: i,
      filename: `${id}.jpg`,
      width: 1600,
      height: 1067,
      aspect: "landscape",
      originalUrl: `${CDN_ORIGIN}/${PREFIX}/original/${id}.jpg`,
      webUrl: `${CDN_ORIGIN}/${PREFIX}/web/${id}.webp`,
      thumbUrl: `${CDN_ORIGIN}/${PREFIX}/thumb/${id}.webp`,
      relativeWebPath: `/${PREFIX}/web/${id}.webp`,
      relativeThumbPath: `/${PREFIX}/thumb/${id}.webp`,
    });
  }

  return photos;
}

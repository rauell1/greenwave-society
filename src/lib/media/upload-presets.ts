// Target sizes for uploaded images, by where they appear on the site. Images are scaled down to fit
// inside the box (never up, aspect ratio kept): in the browser before upload, to stay under the
// hosting request limit, and again on the server, which also converts them to WebP.
// Sizes cover the largest place each image is shown, at 2x for high-density phone screens.
export const UPLOAD_PRESETS = {
  /** Media library and article cover images: shown up to full content width. */
  general: { maxWidth: 2000, maxHeight: 2000, label: "General image" },
  /** Gallery photographs, shown in a lightbox up to full screen. */
  photo: { maxWidth: 2000, maxHeight: 2000, label: "Gallery photo" },
  /** Page image placements such as the homepage hero and section photos. */
  banner: { maxWidth: 2000, maxHeight: 1600, label: "Page image" },
  /** Event posters (portrait), shown at most about 450px wide. */
  poster: { maxWidth: 1200, maxHeight: 1600, label: "Event poster" },
  /** Team portraits, shown at most about 380px wide. */
  portrait: { maxWidth: 800, maxHeight: 1000, label: "Team portrait" },
} as const;

export type UploadPreset = keyof typeof UPLOAD_PRESETS;

export function isUploadPreset(value: unknown): value is UploadPreset {
  return typeof value === "string" && value in UPLOAD_PRESETS;
}

/** WebP quality used for every resized upload: visually lossless for photos at a fraction of the size. */
export const WEBP_QUALITY = 82;

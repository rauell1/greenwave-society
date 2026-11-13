// Vercel rejects request bodies over 4.5 MB before the upload route runs, so a typical phone photo
// (4-10 MB) failed to upload even though the media library advertises a 10 MB limit. Photos are
// resized in the browser to stay under the platform limit; the server still validates the result.
export const UPLOAD_BODY_LIMIT_BYTES = 4 * 1024 * 1024;
export const MAX_SOURCE_IMAGE_BYTES = 30 * 1024 * 1024;
const MAX_DIMENSION = 2560;
const RESIZABLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

export async function prepareUpload(file: File): Promise<File> {
  if (!RESIZABLE_TYPES.includes(file.type)) {
    if (file.size > UPLOAD_BODY_LIMIT_BYTES) throw new Error("GIFs and PDFs must be under 4 MB. Compress the file and try again.");
    return file;
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= UPLOAD_BODY_LIMIT_BYTES) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.75, 0.6]) {
      // Browsers that cannot encode WebP (older Safari) silently return a PNG instead; use JPEG there.
      let blob = await canvasToBlob(canvas, "image/webp", quality);
      if (blob?.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality);
      if (blob && blob.size <= UPLOAD_BODY_LIMIT_BYTES && (blob.type === "image/webp" || blob.type === "image/jpeg")) {
        const extension = blob.type === "image/webp" ? ".webp" : ".jpg";
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + extension, { type: blob.type, lastModified: file.lastModified });
      }
    }
    throw new Error("This photo could not be made small enough to upload. Try a smaller image.");
  } finally {
    bitmap.close();
  }
}

import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";

vi.mock("server-only", () => ({}));
const { optimiseUpload } = await import("./optimize");

const photo = (width: number, height: number, format: "jpeg" | "png" = "jpeg") =>
  sharp({ create: { width, height, channels: 3, background: { r: 40, g: 120, b: 60 } } })[format]().toBuffer();

describe("optimiseUpload", () => {
  it("scales phone photos down to each preset's box and stores WebP", async () => {
    const original = await photo(4000, 3000);
    for (const [preset, width, height] of [["general", 2000, 1500], ["banner", 2000, 1500], ["poster", 1200, 900], ["portrait", 800, 600]] as const) {
      const stored = await optimiseUpload(original, "image/jpeg", preset);
      expect(stored).toMatchObject({ contentType: "image/webp", width, height });
      expect((await sharp(stored.bytes).metadata()).format).toBe("webp");
    }
  });

  it("fits tall posters by height and never enlarges small images", async () => {
    expect(await optimiseUpload(await photo(1080, 2400), "image/jpeg", "poster")).toMatchObject({ width: 720, height: 1600 });
    expect(await optimiseUpload(await photo(600, 400, "png"), "image/png", "general")).toMatchObject({ contentType: "image/webp", width: 600, height: 400 });
  });

  it("turns photos upright and removes EXIF data such as GPS location", async () => {
    // Orientation 6 = the camera was rotated 90 degrees; stored pixels are landscape.
    const rotated = await sharp(await photo(1600, 1200)).withMetadata({ orientation: 6, exif: { IFD3: { GPSLatitudeRef: "S", GPSLatitude: "1/1 17/1 0/1" } } }).jpeg().toBuffer();
    const stored = await optimiseUpload(rotated, "image/jpeg", "general");
    expect(stored).toMatchObject({ width: 1200, height: 1600 });
    const metadata = await sharp(stored.bytes).metadata();
    expect(metadata.exif).toBeUndefined();
    expect(metadata.orientation).toBeUndefined();
  });

  it("keeps GIFs and PDFs as uploaded", async () => {
    const gif = await sharp({ create: { width: 300, height: 200, channels: 3, background: "#fff" } }).gif().toBuffer();
    expect(await optimiseUpload(gif, "image/gif", "general")).toMatchObject({ contentType: "image/gif", width: 300, height: 200, bytes: gif });
    const pdf = new TextEncoder().encode("%PDF-1.4 test");
    expect((await optimiseUpload(pdf, "application/pdf", "general")).contentType).toBe("application/pdf");
  });

  it("rejects files that are not decodable images", async () => {
    await expect(optimiseUpload(new Uint8Array([0xff, 0xd8, 0xff, 0, 1, 2]), "image/jpeg", "general")).rejects.toThrow();
  });
});

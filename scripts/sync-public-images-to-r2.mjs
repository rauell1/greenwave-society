import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const rootDir = process.cwd();
const imagesDir = path.join(rootDir, "public/images");
const manifestPath = path.join(rootDir, "docs/image-manifest.json");

if (!fs.existsSync(imagesDir)) {
  console.error("Images directory not found:", imagesDir);
  process.exit(1);
}

const envPath = path.join(rootDir, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const getEnv = (key) =>
  (envContent.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1] || "")
    .replace(/["']/g, "")
    .trim();

const accessKeyId = getEnv("AWS_ACCESS_KEY_ID");
const secretAccessKey = getEnv("AWS_SECRET_ACCESS_KEY");
const endpoint = getEnv("AWS_ENDPOINT_URL_S3");

if (!accessKeyId || !secretAccessKey || !endpoint) {
  console.error("Missing R2/S3 credentials in .env.local");
  process.exit(1);
}

const BUCKET = "greenwave-society";
const MAX_DIMENSION = 1920;
const CONCURRENCY = 4;

const s3Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

async function objectExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NotFound") {
      return false;
    }
    throw err;
  }
}

async function optimizeImage(filePath, ext) {
  const pipeline = sharp(filePath)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });

  if (ext === ".png") {
    return {
      body: await pipeline.png({ compressionLevel: 8, palette: true }).toBuffer(),
      contentType: "image/png",
    };
  }
  if (ext === ".webp") {
    return {
      body: await pipeline.webp({ quality: 82 }).toBuffer(),
      contentType: "image/webp",
    };
  }
  return {
    body: await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
    contentType: "image/jpeg",
  };
}

async function run() {
  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  const existingManifest = fs.existsSync(manifestPath)
    ? new Set(JSON.parse(fs.readFileSync(manifestPath, "utf-8")))
    : new Set();

  console.log(`Found ${files.length} local images in public/images/`);
  console.log(`Existing manifest entries: ${existingManifest.size}`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const queue = [...files];

  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) continue;
      const key = `images/${file}`;

      try {
        if (await objectExists(key)) {
          existingManifest.add(file);
          skipped++;
          continue;
        }

        const ext = path.extname(file).toLowerCase();
        const { body, contentType } = await optimizeImage(path.join(imagesDir, file), ext);

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        );

        existingManifest.add(file);
        uploaded++;
        if ((uploaded + skipped) % 25 === 0) {
          console.log(`Progress: ${uploaded} uploaded, ${skipped} skipped, ${queue.length} remaining`);
        }
      } catch (err) {
        failed++;
        console.error(`Failed ${file}:`, err?.Code || err?.name || err?.message || err);
        if (err?.Code === "NotEntitled") {
          console.error("R2 is not enabled on this Cloudflare account. Aborting.");
          process.exit(1);
        }
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const sortedManifest = [...existingManifest].sort();
  fs.writeFileSync(manifestPath, JSON.stringify(sortedManifest, null, 2) + "\n", "utf-8");

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} already on R2, ${failed} failed.`);
  console.log(`Updated docs/image-manifest.json (${sortedManifest.length} total entries).`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const rootDir = process.cwd();
const photosDir = path.join(rootDir, "graduation-photos");

if (!fs.existsSync(photosDir)) {
  console.error("Photos directory not found:", photosDir);
  process.exit(1);
}

// Read credentials from .env.local
const envContent = fs.readFileSync(path.join(rootDir, ".env.local"), "utf-8");
let accessKeyId = "";
let secretAccessKey = "";
let endpoint = "";

for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("AWS_ACCESS_KEY_ID=")) {
    accessKeyId = trimmed.split("=")[1].replace(/["']/g, "").trim();
  }
  if (trimmed.startsWith("AWS_SECRET_ACCESS_KEY=")) {
    secretAccessKey = trimmed.split("=")[1].replace(/["']/g, "").trim();
  }
  if (trimmed.startsWith("AWS_ENDPOINT_URL_S3=")) {
    endpoint = trimmed.split("=")[1].replace(/["']/g, "").trim();
  }
}

if (!accessKeyId || !secretAccessKey || !endpoint) {
  console.error("Missing R2/S3 credentials in .env.local");
  process.exit(1);
}

const BUCKET = "greenwave-society";
const CDN_ORIGIN = "https://cdn.greenwavesociety.org";
const PREFIX = "images/events/graduation-cohort-1";

const s3Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

async function objectExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToR2(key, body, contentType, cacheControl = "public, max-age=31536000, immutable") {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  );
}

async function run() {
  const files = fs
    .readdirSync(photosDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  console.log(`Found ${files.length} graduation photos to process and sync to Cloudflare R2...`);
  console.log(`Target Bucket: ${BUCKET}`);
  console.log(`Public CDN Origin: ${CDN_ORIGIN}/${PREFIX}/\n`);

  const manifest = [];
  const CONCURRENCY = 4; // Process 4 high-res images in parallel to prevent high RAM usage
  let processed = 0;
  let skipped = 0;
  let uploaded = 0;

  async function processFile(file, index) {
    const filePath = path.join(photosDir, file);
    const baseName = path.parse(file).name; // e.g. graduation_cohort_1_001

    const origKey = `${PREFIX}/original/${file}`;
    const webKey = `${PREFIX}/web/${baseName}.webp`;
    const thumbKey = `${PREFIX}/thumb/${baseName}.webp`;

    try {
      // 1. Check if both web and thumb exist in R2
      const [origExists, webExists, thumbExists] = await Promise.all([
        objectExists(origKey),
        objectExists(webKey),
        objectExists(thumbKey),
      ]);

      const origBuffer = fs.readFileSync(filePath);
      const metadata = await sharp(origBuffer).metadata();
      const width = metadata.width || 1200;
      const height = metadata.height || 800;
      const aspect = width >= height ? "landscape" : "portrait";

      // 2. Upload original if missing
      if (!origExists) {
        await uploadToR2(origKey, origBuffer, "image/jpeg");
        uploaded++;
      } else {
        skipped++;
      }

      // 3. Generate & upload web-optimized version (1600px wide, ~100-150KB)
      if (!webExists) {
        const webBuffer = await sharp(origBuffer)
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();
        await uploadToR2(webKey, webBuffer, "image/webp");
        // Also upload to root prefix for clean URL
        await uploadToR2(`${PREFIX}/${baseName}.webp`, webBuffer, "image/webp");
        uploaded++;
      }

      // 4. Generate & upload thumbnail version (480px, ~20-30KB)
      if (!thumbExists) {
        const thumbBuffer = await sharp(origBuffer)
          .rotate()
          .resize({ width: 480, height: 480, fit: "cover" })
          .webp({ quality: 75, effort: 3 })
          .toBuffer();
        await uploadToR2(thumbKey, thumbBuffer, "image/webp");
        uploaded++;
      }

      manifest.push({
        id: baseName,
        index: index + 1,
        filename: file,
        width,
        height,
        aspect,
        originalUrl: `${CDN_ORIGIN}/${origKey}`,
        webUrl: `${CDN_ORIGIN}/${webKey}`,
        thumbUrl: `${CDN_ORIGIN}/${thumbKey}`,
        relativeWebPath: `/${PREFIX}/web/${baseName}.webp`,
        relativeThumbPath: `/${PREFIX}/thumb/${baseName}.webp`,
      });

      processed++;
      if (processed % 10 === 0 || processed === files.length) {
        const pct = Math.round((processed / files.length) * 100);
        console.log(`[${processed}/${files.length}] (${pct}%) Synced ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  // Run in chunks with controlled concurrency
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const chunk = files.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map((f, idx) => processFile(f, i + idx)));
  }

  // Sort manifest by index
  manifest.sort((a, b) => a.index - b.index);

  // Write manifest
  const manifestPath = path.join(rootDir, "docs/graduation-photos-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\nWritten manifest to ${manifestPath} (${manifest.length} photos)`);

  // Update docs/image-manifest.json so image validator passes
  const imageManifestPath = path.join(rootDir, "docs/image-manifest.json");
  if (fs.existsSync(imageManifestPath)) {
    const currentManifest = JSON.parse(fs.readFileSync(imageManifestPath, "utf-8"));
    const currentSet = new Set(currentManifest);
    let addedCount = 0;
    for (const item of manifest) {
      const key = `events/graduation-cohort-1/web/${item.id}.webp`;
      if (!currentSet.has(key)) {
        currentManifest.push(key);
        addedCount++;
      }
    }
    fs.writeFileSync(imageManifestPath, JSON.stringify(currentManifest, null, 2), "utf-8");
    console.log(`Updated docs/image-manifest.json (+${addedCount} graduation image keys)`);
  }

  console.log(`\nSync Complete!`);
  console.log(`Total photos processed: ${processed}`);
  console.log(`New uploads to Cloudflare R2: ${uploaded}`);
  console.log(`Skipped existing: ${skipped}`);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

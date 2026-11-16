#!/usr/bin/env node
/**
 * Uploads the site photos in public/images/ to the Neon object-storage bucket
 * the website serves /images/* from (see src/lib/site-images.ts).
 *
 *   node scripts/upload-images-to-neon.mjs            upload what is not uploaded yet
 *   node scripts/upload-images-to-neon.mjs --dry-run  list what would be uploaded
 *   node scripts/upload-images-to-neon.mjs --all      upload everything again
 *
 * Uses the Neon command-line tool with your own Neon sign-in (a browser window
 * opens the first time), so no storage keys are needed. Photos larger than
 * 1920 px (except those in an original/ folder) are scaled down and recompressed first when sharp is installed
 * (npm install), as the Vercel image service used to do; other files are
 * uploaded as they are. Finished files are listed in
 * public/images/.neon-uploaded.txt, so the script can be stopped and run again.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROJECT_ID = process.env.NEON_STORAGE_PROJECT_ID || "fancy-math-09311878";
const BUCKET = process.env.NEON_IMAGE_BUCKET || "greenwave-media";
const MAX_DIMENSION = 1920;
const CONCURRENCY = 4;
const TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const imagesDir = path.join(process.cwd(), "public", "images");
const doneFile = path.join(imagesDir, ".neon-uploaded.txt");

if (!fs.existsSync(imagesDir)) {
  console.error(`No public/images folder in ${process.cwd()}. Run this from the greenwave-society folder.`);
  process.exit(1);
}

/** Every image under public/images, as forward-slash paths relative to it. */
function listImages(dir, prefix = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listImages(path.join(dir, entry.name), rel));
    else if (TYPES[path.extname(entry.name).toLowerCase()]) out.push(rel);
  }
  return out.sort();
}

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.log("sharp is not installed: photos are uploaded at full size. Run npm install first to shrink them.");
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "greenwave-images-"));

/** The file to upload: a scaled-down copy for large photos, else the original. */
async function prepare(rel) {
  const source = path.join(imagesDir, ...rel.split("/"));
  const ext = path.extname(rel).toLowerCase();
  // Files under an original/ folder are full-resolution downloads: keep them as they are.
  if (!sharp || rel.split("/").includes("original") || ![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return source;
  const image = sharp(source, { failOn: "none" }).rotate();
  const { width = 0, height = 0 } = await image.metadata();
  if (Math.max(width, height) <= MAX_DIMENSION) return source;
  const resized = image.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });
  const encoded =
    ext === ".png" ? resized.png({ compressionLevel: 9 })
    : ext === ".webp" ? resized.webp({ quality: 82 })
    : resized.jpeg({ quality: 82, mozjpeg: true });
  const target = path.join(tempDir, `${Math.random().toString(36).slice(2)}${ext}`);
  await encoded.toFile(target);
  // Keep the original when recompressing would not make it smaller.
  return fs.statSync(target).size < fs.statSync(source).size ? target : source;
}

function neon(argv) {
  return new Promise((resolve) => {
    const child = spawn("npx", ["-y", "neonctl@latest", ...argv], { shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (code) => resolve({ ok: code === 0, output: output.trim() }));
  });
}

const quote = (value) => (process.platform === "win32" ? `"${value}"` : value);

const all = listImages(imagesDir);
const done = new Set(args.has("--all") || !fs.existsSync(doneFile) ? [] : fs.readFileSync(doneFile, "utf8").split(/\r?\n/).filter(Boolean));
const queue = all.filter((rel) => !done.has(rel));
console.log(`${all.length} images in public/images, ${all.length - queue.length} already uploaded, ${queue.length} to upload.`);
if (dryRun) {
  for (const rel of queue) console.log(`  images/${rel}`);
  process.exit(0);
}
if (!queue.length) process.exit(0);

// Sign in once before uploading in parallel.
const check = await neon(["buckets", "list", "--project-id", PROJECT_ID]);
if (!check.ok || !check.output.includes(BUCKET)) {
  console.error(`Could not reach the "${BUCKET}" bucket in Neon project ${PROJECT_ID}:\n${check.output}`);
  process.exit(1);
}

let uploaded = 0;
const failed = [];
async function worker() {
  for (let rel = queue.shift(); rel; rel = queue.shift()) {
    try {
      const file = await prepare(rel);
      const type = TYPES[path.extname(rel).toLowerCase()];
      const result = await neon(["buckets", "object", "put", quote(`${BUCKET}/images/${rel}`), "--project-id", PROJECT_ID, "--file", quote(file), "--content-type", type]);
      if (file.startsWith(tempDir)) fs.rmSync(file, { force: true });
      if (!result.ok) throw new Error(result.output.split("\n").pop());
      fs.appendFileSync(doneFile, `${rel}\n`);
      uploaded++;
      if (uploaded % 10 === 0) console.log(`  ${uploaded} uploaded, ${queue.length} to go`);
    } catch (error) {
      failed.push(rel);
      console.error(`  failed: images/${rel} (${error.message})`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\nDone: ${uploaded} uploaded, ${failed.length} failed.`);
if (failed.length) {
  console.log("Run the same command again to retry the failed ones.");
  process.exit(1);
}

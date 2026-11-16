#!/usr/bin/env node
/**
 * Builds the graduation album photo files from graduation-photos/ (the
 * full-resolution originals, kept out of Git) into
 * public/images/events/graduation-cohort-1/, with the same names
 * scripts/sync-graduation-photos-to-r2.mjs used on the CDN:
 *
 *   original/<file>           the original, for downloads
 *   web/<name>.webp           1600 px wide, for the album and page images
 *   <name>.webp               the same, at the shorter address
 *   thumb/<name>.webp         480 px square thumbnail
 *
 * Then `npm run images:upload` sends them to object storage with the other
 * site photos. Files that already exist are skipped.
 *
 *   node scripts/prepare-graduation-photos.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.join(process.cwd(), "graduation-photos");
const targetDir = path.join(process.cwd(), "public", "images", "events", "graduation-cohort-1");
const CONCURRENCY = 4;

if (!fs.existsSync(sourceDir)) {
  console.error(`No graduation-photos folder in ${process.cwd()}. Put the original graduation photos there first.`);
  process.exit(1);
}
for (const folder of ["original", "web", "thumb"]) fs.mkdirSync(path.join(targetDir, folder), { recursive: true });

const files = fs.readdirSync(sourceDir).filter((file) => /\.(jpe?g|png|webp)$/i.test(file)).sort();
console.log(`${files.length} graduation photos found.`);

let made = 0;
let failed = 0;
const queue = [...files];

async function worker() {
  for (let file = queue.shift(); file; file = queue.shift()) {
    const source = path.join(sourceDir, file);
    const name = path.parse(file).name;
    const outputs = {
      original: path.join(targetDir, "original", file),
      web: path.join(targetDir, "web", `${name}.webp`),
      short: path.join(targetDir, `${name}.webp`),
      thumb: path.join(targetDir, "thumb", `${name}.webp`),
    };
    try {
      if (!fs.existsSync(outputs.original)) fs.copyFileSync(source, outputs.original);
      if (!fs.existsSync(outputs.web)) {
        await sharp(source).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(outputs.web);
      }
      if (!fs.existsSync(outputs.short)) fs.copyFileSync(outputs.web, outputs.short);
      if (!fs.existsSync(outputs.thumb)) {
        await sharp(source).rotate().resize({ width: 480, height: 480, fit: "cover" }).webp({ quality: 75, effort: 3 }).toFile(outputs.thumb);
      }
      made++;
      if (made % 25 === 0) console.log(`  ${made} of ${files.length} done`);
    } catch (error) {
      failed++;
      console.error(`  failed: ${file} (${error.message})`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\nDone: ${made} photos ready in public/images/events/graduation-cohort-1, ${failed} failed.`);
console.log("Next: npm run images:upload");
if (failed) process.exit(1);

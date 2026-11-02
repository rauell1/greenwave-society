#!/usr/bin/env node
/**
 * Empower 360 Cohort I Graduation Photo Downloader
 * 
 * Downloads all full-resolution photographs from the shared Google Photos album:
 * https://photos.app.goo.gl/9wmows3AZ1XrzS4J6
 *
 * Usage:
 *   node scripts/download-graduation-photos.mjs
 *   node scripts/download-graduation-photos.mjs --dest=./my-folder
 *   node scripts/download-graduation-photos.mjs --max=20
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const ALBUM_SHORT_URL = 'https://photos.app.goo.gl/9wmows3AZ1XrzS4J6';

// Parse CLI args
const args = process.argv.slice(2);
let outputDir = './graduation-photos';
let maxPhotos = Infinity;
let qualityParam = '=s0'; // =s0 for original full resolution, =w2048 for high-res web

for (const arg of args) {
  if (arg.startsWith('--dest=')) {
    outputDir = arg.split('=')[1];
  } else if (arg.startsWith('--max=')) {
    maxPhotos = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--quality=')) {
    qualityParam = arg.split('=')[1];
  }
}

const resolvedOutputDir = path.resolve(process.cwd(), outputDir);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ url, data }));
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return resolve(downloadBinary(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(fs.statSync(destPath).size);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function main() {
  console.log('🌿 Greenwave Society • Empower 360 Graduation Photo Archive');
  console.log(`Connecting to Google Photos Album: ${ALBUM_SHORT_URL}...`);
  
  if (!fs.existsSync(resolvedOutputDir)) {
    fs.mkdirSync(resolvedOutputDir, { recursive: true });
  }

  const { data: html } = await fetchUrl(ALBUM_SHORT_URL);
  
  // Extract photo IDs from the Google Photos album HTML
  const matches = html.match(/https?:\/\/[a-zA-Z0-9\.\-]+googleusercontent\.com\/pw\/([a-zA-Z0-9_\-]+)/g) || [];
  const uniqueIds = [];
  const seen = new Set();

  for (const m of matches) {
    const id = m.split('/pw/')[1].split('=')[0];
    if (!seen.has(id)) {
      seen.add(id);
      uniqueIds.push(id);
    }
  }

  if (uniqueIds.length === 0) {
    console.error('❌ Could not parse photo entries from album. The album might be private or format changed.');
    process.exit(1);
  }

  const targetList = uniqueIds.slice(0, maxPhotos);
  console.log(`✅ Discovered ${uniqueIds.length} photos in the graduation album.`);
  console.log(`📁 Target directory: ${resolvedOutputDir}`);
  console.log(`🚀 Starting download of ${targetList.length} photographs...\n`);

  let downloadedCount = 0;
  let skippedCount = 0;
  let totalBytes = 0;
  const concurrency = 4;

  for (let i = 0; i < targetList.length; i += concurrency) {
    const batch = targetList.slice(i, i + concurrency);
    await Promise.all(batch.map(async (id, batchIdx) => {
      const photoIndex = i + batchIdx + 1;
      const fileName = `graduation_cohort_1_${String(photoIndex).padStart(3, '0')}.jpg`;
      const filePath = path.join(resolvedOutputDir, fileName);
      const downloadUrl = `https://lh3.googleusercontent.com/pw/${id}${qualityParam}`;

      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
        skippedCount++;
        process.stdout.write(`[${photoIndex}/${targetList.length}] ⏩ Skipped (already exists): ${fileName}\n`);
        return;
      }

      try {
        const bytes = await downloadBinary(downloadUrl, filePath);
        downloadedCount++;
        totalBytes += bytes;
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        process.stdout.write(`[${photoIndex}/${targetList.length}] ⬇️ Downloaded: ${fileName} (${mb} MB)\n`);
      } catch (err) {
        process.stdout.write(`[${photoIndex}/${targetList.length}] ⚠️ Failed to download: ${fileName} (${err.message})\n`);
      }
    }));
  }

  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
  console.log('\n=========================================');
  console.log(`🎉 Download Complete!`);
  console.log(`📥 Downloaded: ${downloadedCount} new photos (${totalMb} MB)`);
  console.log(`⏩ Skipped: ${skippedCount} existing photos`);
  console.log(`📂 Location: ${resolvedOutputDir}`);
  console.log('=========================================\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

#!/usr/bin/env node
// Deterministic page → video renderer.
//
// A page (films/<name>/index.html, stills/index.html) exposes:
//   window.DUR            length in seconds
//   window.render(t)      draws the frame at time t; deterministic, no carried state
//   window.READY = true   once fonts and data are loaded
//   window.EV             optional [{t, type, ...}] sound cues, exported with --events
// Pages lay themselves out from innerWidth × innerHeight, so one source renders every size.
//
// Usage (from marketing/):
//   node engine/render.mjs films/anthem --size 1080x1920 --fps 30 --out out/anthem-9x16.silent.mp4
//   node engine/render.mjs films/anthem --size 1920x1080 --stills 1,5,12 --outdir out/stills
//   node engine/render.mjs films/anthem --events out/anthem.events.json
//   node engine/render.mjs stills --size 1080x1080 --query tpl=impact --still out/impact.jpg
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { startServer, ROOT } from './serve.mjs';

const CHROME = process.env.GW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith('--')) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) a[k.slice(2)] = true;
      else { a[k.slice(2)] = next; i++; }
    } else a._.push(k);
  }
  return a;
}

function ffmpeg(args) {
  const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => p.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
  return { p, done };
}

function write(stream, buf) {
  return new Promise((res) => { if (!stream.write(buf)) stream.once('drain', res); else res(); });
}

async function openPage(browser, url, w, h, tag) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => { console.error(`${tag}[page error] ${e.message}`); process.exitCode = 1; });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error(`${tag}[page ${m.type()}] ${m.text()}`); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.READY === true', null, { timeout: 60000, polling: 50 });
  return page;
}

async function frame(page, t, w, h, quality = 95) {
  await page.evaluate((t) => window.render(t), t);
  return page.screenshot({ type: 'jpeg', quality, clip: { x: 0, y: 0, width: w, height: h } });
}

const args = parseArgs(process.argv.slice(2));
const target = args._[0];
if (!target) { console.error('usage: render.mjs <page dir> [--size WxH] [--fps 30] [--out file.mp4]'); process.exit(2); }
const [W, H] = String(args.size || '1920x1080').split('x').map(Number);
const FPS = Number(args.fps || 30);
const query = args.query ? `&${args.query}` : '';

const srv = await startServer();
const url = `http://127.0.0.1:${srv.address().port}/${target.replace(/\/?$/, '/')}?w=${W}&h=${H}${query}`;
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb'] });

try {
  if (args.events) {
    const page = await openPage(browser, url, W, H, '');
    const data = await page.evaluate(() => ({ DUR: window.DUR, EV: window.EV || [], TL: window.TL || null }));
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.events)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.events), JSON.stringify(data, null, 1));
    console.log(`events → ${args.events} (${data.EV.length} cues, ${data.DUR}s)`);
  } else if (args.still || args.stills) {
    const page = await openPage(browser, url, W, H, '');
    if (args.still) {
      const out = path.resolve(ROOT, args.still);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const t = Number(args.t || 0);
      await page.evaluate((t) => window.render(t), t);
      if (out.endsWith('.pdf')) {
        const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
        const pdfPage = await browser.newPage();
        await pdfPage.setContent(`<html><body style="margin:0"><img src="data:image/png;base64,${png.toString('base64')}" style="width:210mm;height:297mm;display:block"></body></html>`);
        await pdfPage.pdf({ path: out, width: '210mm', height: '297mm', printBackground: true, pageRanges: '1' });
      } else {
        const png = out.endsWith('.png');
        fs.writeFileSync(out, await page.screenshot({ type: png ? 'png' : 'jpeg', quality: png ? undefined : 92, clip: { x: 0, y: 0, width: W, height: H } }));
      }
      console.log(`still → ${args.still}`);
    } else {
      const dir = path.resolve(ROOT, args.outdir || `${target}/out/stills`);
      fs.mkdirSync(dir, { recursive: true });
      const DUR = await page.evaluate(() => window.DUR);
      let times = String(args.stills).split(',').map(Number);
      if (args.stills === 'sheet') times = Array.from({ length: Math.floor(DUR) }, (_, i) => i + 0.5);
      for (const t of times) {
        fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.jpg`), await frame(page, t, W, H, 88));
      }
      console.log(`${times.length} stills → ${path.relative(ROOT, dir)}`);
    }
  } else {
    const probe = await openPage(browser, url, W, H, '');
    const DUR = await probe.evaluate(() => window.DUR);
    await probe.close();
    const N = Math.round(DUR * FPS);
    const workers = Math.max(1, Math.min(Number(args.workers || os.cpus().length), 8));
    const out = path.resolve(ROOT, args.out || `out/${path.basename(target)}-${W}x${H}.silent.mp4`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gw-render-'));
    const chunk = Math.ceil(N / workers);
    const t0 = Date.now();
    let doneFrames = 0;
    const segs = await Promise.all(Array.from({ length: workers }, async (_, wi) => {
      const from = wi * chunk, to = Math.min(N, from + chunk);
      const seg = path.join(tmp, `seg${wi}.mp4`);
      if (from >= to) return null;
      const page = await openPage(browser, url, W, H, `[w${wi}]`);
      const enc = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg]);
      for (let i = from; i < to; i++) {
        await write(enc.p.stdin, await frame(page, (i + 0.5) / FPS, W, H));
        if (++doneFrames % 60 === 0) process.stdout.write(`\r${doneFrames}/${N} frames, ${((Date.now() - t0) / doneFrames).toFixed(0)} ms/frame   `);
      }
      enc.p.stdin.end();
      await enc.done;
      await page.close();
      return seg;
    }));
    const list = path.join(tmp, 'list.txt');
    fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s}'`).join('\n'));
    await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]).done;
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`\n${N} frames (${W}x${H}@${FPS}) → ${path.relative(ROOT, out)} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
} finally {
  await browser.close();
  srv.close();
}

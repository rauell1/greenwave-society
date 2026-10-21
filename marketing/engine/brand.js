// Greenwave Society brand kit for code-drawn films and stills.
// Colours are the website's own tokens (src/app/globals.css), fonts are the site's
// Playfair Display + Plus Jakarta Sans. Everything here is deterministic.

export const C = {
  night: 'oklch(0.16 0.025 145)',      // --background (dark)
  night2: 'oklch(0.21 0.035 150)',
  forest: 'oklch(0.35 0.09 145)',      // --primary
  forestBright: 'oklch(0.58 0.1 145)', // --primary (dark)
  leaf: 'oklch(0.62 0.16 135)',        // logo green
  leafDark: 'oklch(0.45 0.13 140)',
  lime: 'oklch(0.86 0.15 128)',
  mint: 'oklch(0.92 0.04 145)',        // --forest-light
  sand: 'oklch(0.975 0.015 85)',       // --background (light)
  sand2: 'oklch(0.94 0.02 85)',
  gold: 'oklch(0.74 0.12 80)',         // --gold
  goldLight: 'oklch(0.96 0.03 80)',
  earth: 'oklch(0.55 0.08 60)',        // --earth
  earthLight: 'oklch(0.93 0.03 60)',
  teal: 'oklch(0.42 0.07 200)',
  ink: 'oklch(0.22 0.035 145)',        // --foreground (light)
};
// oklch triplets for interpolated skies
export const ok = ([l, c, h], al = 1) => `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)} / ${al})`;
export function mixOk(p, q, t) {
  let dh = q[2] - p[2]; if (dh > 180) dh -= 360; if (dh < -180) dh += 360;
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + dh * t];
}
export const a = (col, alpha) => col.replace(')', ` / ${alpha})`);

export const FONTS = [
  ['Playfair', 'playfair-display-latin-900-normal.woff2', { weight: '900' }],
  ['Playfair', 'playfair-display-latin-700-normal.woff2', { weight: '700' }],
  ['Playfair', 'playfair-display-latin-400-italic.woff2', { weight: '400', style: 'italic' }],
  ['Playfair', 'playfair-display-latin-900-italic.woff2', { weight: '900', style: 'italic' }],
  ['Jakarta', 'plus-jakarta-sans-latin-400-normal.woff2', { weight: '400' }],
  ['Jakarta', 'plus-jakarta-sans-latin-500-normal.woff2', { weight: '500' }],
  ['Jakarta', 'plus-jakarta-sans-latin-600-normal.woff2', { weight: '600' }],
  ['Jakarta', 'plus-jakarta-sans-latin-700-normal.woff2', { weight: '700' }],
  ['Jakarta', 'plus-jakarta-sans-latin-800-normal.woff2', { weight: '800' }],
];

// ---------- maths ----------
export const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (p, q, t) => p + (q - p) * t;
export const seg = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
export const E = {
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  outElastic: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
};
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const hash = (n) => { const r = rng(n * 9301 + 49297); r(); return r(); };

// ---------- responsive layout ----------
// One layout object per frame size: every film and still positions itself from it.
export function layout(W, H) {
  const ar = W / H;
  const mode = ar > 1.25 ? 'land' : ar < 0.85 ? 'tall' : 'square';
  const u = Math.min(W, H) / 1080;
  const m = Math.round(Math.min(W, H) * 0.07);
  return { W, H, ar, mode, u, m, cx: W / 2, cy: H / 2, land: mode === 'land', tall: mode === 'tall', square: mode === 'square' };
}

// ---------- page boot ----------
// Sets up the canvas at ?w=&h= (renderer) or the window size (preview / embed), loads fonts,
// and exposes window.render / DUR / READY / EV. ?preview=1 plays in real time with a scrubber.
export async function boot({ dur, draw, events = [], base = '../../' }) {
  const q = new URLSearchParams(location.search);
  const fit = !q.get('w');
  const canvas = document.createElement('canvas');
  document.body.style.cssText = 'margin:0;background:#0c1a10;overflow:hidden';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let L;
  const size = () => {
    const dpr = fit ? Math.min(2, window.devicePixelRatio || 1) : 1;
    const W = fit ? innerWidth : Number(q.get('w'));
    const H = fit ? innerHeight : Number(q.get('h'));
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.cssText = `display:block;width:${W}px;height:${H}px`;
    L = layout(W, H); L.dpr = dpr;
  };
  size();
  await Promise.all(FONTS.map(async ([fam, file, desc]) => {
    const f = new FontFace(fam, `url(${base}fonts/${file})`, desc);
    await f.load(); document.fonts.add(f);
  }));
  window.DUR = dur;
  window.EV = events;
  window.render = (t) => {
    ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    draw(ctx, t, L);
  };
  if (q.get('preview') || fit) {
    let t0 = performance.now(), paused = false, tp = 0;
    const audioSrc = q.get('audio');
    const audio = audioSrc ? new Audio(audioSrc) : null;
    addEventListener('resize', () => { size(); });
    addEventListener('click', () => {
      paused = !paused; tp = ((performance.now() - t0) / 1000) % dur;
      if (!paused) { t0 = performance.now() - tp * 1000; audio?.play(); } else audio?.pause();
    });
    const loop = () => {
      const t = paused ? tp : ((performance.now() - t0) / 1000) % dur;
      window.render(t);
      requestAnimationFrame(loop);
    };
    if (fit) requestAnimationFrame(loop);
  }
  window.READY = true;
  return { ctx, get L() { return L; } };
}

// ---------- text ----------
export function font(ctx, fam, weight, px, italic = false) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${Math.round(px)}px ${fam === 'serif' ? 'Playfair' : 'Jakarta'}`;
}
// Fit a string to maxW by shrinking the size; returns the size used.
export function fitSize(ctx, text, fam, weight, px, maxW, italic = false) {
  font(ctx, fam, weight, px, italic);
  const w = ctx.measureText(text).width;
  return w > maxW ? px * (maxW / w) : px;
}
// Word-by-word rise-in reveal. p in [0,1+]; words stagger.
export function riseText(ctx, text, x, y, p, { align = 'left', stagger = 0.12, rise = 0.6, color = C.sand, px = 40 } = {}) {
  const words = text.split(' ');
  const space = ctx.measureText(' ').width;
  const widths = words.map((w) => ctx.measureText(w).width);
  const total = widths.reduce((s, w) => s + w, 0) + space * (words.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  words.forEach((w, i) => {
    const k = E.outCubic(clamp((p - i * stagger) / 0.5));
    if (k > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - px * 0.2, y - px * 1.15, widths[i] + px * 0.4, px * 1.5); ctx.clip();
      ctx.globalAlpha *= k;
      ctx.fillStyle = color;
      ctx.fillText(w, cx, y + (1 - k) * px * rise);
      ctx.restore();
    }
    cx += widths[i] + space;
  });
  return total;
}
export const fmt = (n) => Math.round(n).toLocaleString('en-US');

// ---------- drawing primitives ----------
export function glow(ctx, x, y, r, col, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, a(col, alpha)); g.addColorStop(1, a(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

const SKIN = ['oklch(0.42 0.07 50)', 'oklch(0.36 0.06 45)', 'oklch(0.5 0.08 55)', 'oklch(0.3 0.05 40)', 'oklch(0.46 0.07 48)'];
const CLOTH = [C.gold, C.leaf, C.sand, C.earth, C.lime, C.forestBright, 'oklch(0.62 0.13 35)', C.teal];
// A young person, feet at (x,y), height s. k = pop-in (0..1), wave = arm raise (0..1).
export function person(ctx, x, y, s, seed, { k = 1, wave = 0, scarf = false } = {}) {
  if (k <= 0) return;
  const r = rng(seed * 7919 + 13); r();
  const skin = SKIN[Math.floor(r() * SKIN.length)];
  const cloth = CLOTH[Math.floor(r() * CLOTH.length)];
  const lean = (r() - 0.5) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  const sc = E.outBack(clamp(k), 2.2);
  ctx.scale(sc, sc);
  ctx.rotate(lean);
  const bw = s * 0.34, bh = s * 0.58, hr = s * 0.13;
  // raised arm
  if (wave > 0) {
    ctx.strokeStyle = skin; ctx.lineCap = 'round'; ctx.lineWidth = s * 0.075;
    const ang = lerp(0.35, -1.25, E.outBack(clamp(wave)));
    ctx.beginPath(); ctx.moveTo(bw * 0.38, -bh * 0.82);
    ctx.lineTo(bw * 0.38 + Math.cos(ang) * s * 0.32, -bh * 0.82 + Math.sin(ang) * s * 0.32); ctx.stroke();
  }
  ctx.fillStyle = cloth;
  ctx.beginPath();
  ctx.moveTo(-bw * 0.5, 0); ctx.lineTo(-bw * 0.42, -bh * 0.78);
  ctx.quadraticCurveTo(0, -bh * 1.02, bw * 0.42, -bh * 0.78);
  ctx.lineTo(bw * 0.5, 0); ctx.closePath(); ctx.fill();
  if (scarf) { ctx.fillStyle = C.gold; ctx.fillRect(-bw * 0.46, -bh * 0.86, bw * 0.92, s * 0.07); }
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, -bh - hr * 0.95, hr, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Flat-topped acacia, base at (x,y), height s, growth g (0..1).
export function acacia(ctx, x, y, s, g, col = C.leafDark, seed = 1) {
  if (g <= 0) return;
  const r = rng(seed);
  const tg = E.outCubic(clamp(g / 0.55));
  const cg = E.outBack(clamp((g - 0.35) / 0.65), 1.6);
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  const th = s * 0.62 * tg;
  ctx.lineWidth = s * 0.045;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.03, -th * 0.5, 0, -th); ctx.stroke();
  ctx.lineWidth = s * 0.03;
  for (const d of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, -th * 0.55); ctx.quadraticCurveTo(d * s * 0.12, -th * 0.8, d * s * 0.26 * tg, -th * 1.02); ctx.stroke();
  }
  if (cg > 0) {
    ctx.fillStyle = col;
    const cw = s * 0.62 * cg, ch = s * 0.16 * cg, cy = -s * 0.68;
    for (let i = 0; i < 5; i++) {
      const ox = (i - 2) * cw * 0.32 + (r() - 0.5) * cw * 0.1;
      const oy = cy - Math.abs(i - 2) * -ch * 0.18 - r() * ch * 0.3;
      ctx.beginPath(); ctx.ellipse(ox, oy, cw * 0.34, ch * (0.62 + r() * 0.25), 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// Rounded broadleaf tree like the logo's.
export function roundTree(ctx, x, y, s, g, col = C.leaf, seed = 2) {
  if (g <= 0) return;
  const r = rng(seed);
  const tg = E.outCubic(clamp(g / 0.5));
  const cg = E.outBack(clamp((g - 0.3) / 0.7), 1.8);
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = s * 0.05;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 0.5 * tg); ctx.stroke();
  ctx.fillStyle = col;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + r();
    const rr = s * (0.17 + r() * 0.07) * cg;
    ctx.beginPath(); ctx.arc(Math.cos(ang) * s * 0.14 * cg, -s * 0.66 + Math.sin(ang) * s * 0.1 * cg, rr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, -s * 0.68, s * 0.2 * cg, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function solarPanel(ctx, x, y, s, g, col = C.leaf) {
  if (g <= 0) return;
  const k = E.outBack(clamp(g), 1.8);
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.lineWidth = s * 0.06; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 0.45 * k); ctx.stroke();
  ctx.translate(0, -s * 0.5 * k); ctx.rotate(-0.42); ctx.scale(k, k);
  const w = s * 0.62, h = s * 0.4;
  ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = C.mint; ctx.lineWidth = s * 0.018; ctx.globalAlpha *= 0.75;
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + (w * i) / 4, -h / 2); ctx.lineTo(-w / 2 + (w * i) / 4, h / 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.stroke();
  ctx.restore();
}

// Building with window grid. g grows it upward from the base.
export function building(ctx, x, y, w, h, g, col = C.leaf, seed = 3, lit = 0) {
  if (g <= 0) return;
  const r = rng(seed);
  const hh = h * E.outBack(clamp(g), 1.3);
  ctx.fillStyle = col;
  ctx.fillRect(x, y - hh, w, hh);
  const spire = r() < 0.3;
  if (spire) { ctx.fillRect(x + w * 0.4, y - hh - h * 0.12, w * 0.2, h * 0.12); }
  const cols = Math.max(2, Math.round(w / (h * 0.09 + 6)));
  const rows = Math.max(3, Math.round(hh / (w / cols) / 1.1));
  const cw = w / cols, rh = hh / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows - 1; j++) {
    const on = lit > 0 && r() < 0.55;
    ctx.fillStyle = on ? a(C.gold, 0.55 + 0.45 * lit) : a(C.mint, 0.55);
    ctx.fillRect(x + i * cw + cw * 0.22, y - hh + j * rh + rh * 0.3, cw * 0.56, rh * 0.45);
  }
}

// Wind turbine with leaf-shaped blades (the logo's signature). Base at (x,y), height h.
export function turbine(ctx, x, y, h, ang, g, col = C.leaf) {
  if (g <= 0) return;
  const k = E.outCubic(clamp(g / 0.6));
  const bk = E.outBack(clamp((g - 0.45) / 0.55), 1.5);
  ctx.save(); ctx.translate(x, y);
  const hubY = -h * k;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-h * 0.028, 0); ctx.lineTo(-h * 0.012, hubY); ctx.lineTo(h * 0.012, hubY); ctx.lineTo(h * 0.028, 0);
  ctx.closePath(); ctx.fill();
  // root flare like the logo
  ctx.beginPath(); ctx.moveTo(-h * 0.09, 0); ctx.quadraticCurveTo(-h * 0.018, -h * 0.01, -h * 0.016, -h * 0.08);
  ctx.lineTo(h * 0.016, -h * 0.08); ctx.quadraticCurveTo(h * 0.018, -h * 0.01, h * 0.09, 0); ctx.closePath(); ctx.fill();
  if (bk > 0) {
    ctx.translate(0, hubY);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(ang + (i * Math.PI * 2) / 3);
      ctx.scale(bk, bk);
      const L = h * 0.62, Wd = h * 0.2;
      ctx.fillStyle = i === 0 ? col : C.leaf;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(Wd * 1.1, -L * 0.25, Wd * 0.9, -L * 0.85, 0, -L);
      ctx.bezierCurveTo(-Wd * 0.15, -L * 0.6, -Wd * 0.1, -L * 0.3, 0, 0);
      ctx.fill();
      ctx.strokeStyle = a(C.mint, 0.85); ctx.lineWidth = h * 0.008;
      ctx.beginPath(); ctx.moveTo(0, -h * 0.03); ctx.quadraticCurveTo(Wd * 0.25, -L * 0.5, 0, -L * 0.96); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, h * 0.045 * bk, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.mint; ctx.lineWidth = h * 0.01; ctx.stroke();
  }
  ctx.restore();
}

// Continents inside a unit lower half-disc (y down, flat top at y=0), drawn like the logo.
const LAND = [
  // Africa
  [[-0.08, 0.2], [0.05, 0.15], [0.18, 0.17], [0.29, 0.19], [0.34, 0.27], [0.4, 0.33], [0.48, 0.37], [0.45, 0.45], [0.39, 0.52], [0.36, 0.61], [0.3, 0.69], [0.26, 0.78], [0.2, 0.85], [0.15, 0.83], [0.12, 0.74], [0.1, 0.62], [0.06, 0.53], [0.0, 0.46], [-0.1, 0.43], [-0.17, 0.36], [-0.15, 0.27]],
  // Madagascar
  [[0.4, 0.64], [0.44, 0.66], [0.43, 0.75], [0.39, 0.74]],
  // Europe strip
  [[-0.12, 0.0], [0.38, 0.0], [0.32, 0.07], [0.2, 0.1], [0.06, 0.11], [-0.06, 0.08]],
  // Arabia
  [[0.38, 0.2], [0.5, 0.22], [0.58, 0.3], [0.52, 0.35], [0.44, 0.29]],
  // South Asia
  [[0.6, 0.06], [0.76, 0.1], [0.86, 0.19], [0.8, 0.3], [0.72, 0.39], [0.67, 0.3], [0.62, 0.18]],
  // South America
  [[-0.78, 0.26], [-0.63, 0.29], [-0.5, 0.37], [-0.47, 0.47], [-0.55, 0.57], [-0.61, 0.69], [-0.66, 0.8], [-0.7, 0.7], [-0.73, 0.55], [-0.82, 0.4]],
  // Caribbean / N. America tail
  [[-0.95, 0.04], [-0.72, 0.02], [-0.66, 0.1], [-0.74, 0.16], [-0.88, 0.18]],
];
function smoothPoly(ctx, pts, cx, cy, R) {
  const P = pts.map(([x, y]) => [cx + x * R, cy + y * R]);
  const n = P.length;
  ctx.moveTo((P[n - 1][0] + P[0][0]) / 2, (P[n - 1][1] + P[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = P[i], q = P[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}
export function continents(ctx, cx, cy, R, alpha = 1, col = C.leafDark) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = col;
  ctx.beginPath();
  for (const p of LAND) smoothPoly(ctx, p, cx, cy, R);
  ctx.fill();
  ctx.restore();
}

// The full Greenwave emblem: half-globe, turbine, trees, panels, skyline.
// (cx,cy) = centre of the flat top. R = globe radius. g = build progress 0..1.
// Parts can be driven separately (globe, land, left, sky, turbine), which the anthem uses
// to grow the emblem out of the film's own landscape.
export function emblem(ctx, cx, cy, R, opt = {}) {
  const g = opt.g ?? 1;
  const P = {
    globe: E.outCubic(clamp(g / 0.35)),
    land: E.outCubic(clamp((g - 0.15) / 0.3)),
    left: clamp((g - 0.35) / 0.65),
    sky: clamp((g - 0.35) / 0.65),
    turbine: clamp((g - 0.3) / 0.6),
    spin: 0, glowA: 0.35, people: 0, lit: 0,
    ...opt,
  };
  ctx.save();
  if (P.glowA > 0) glow(ctx, cx, cy, R * 1.9, C.leaf, P.glowA * 0.35);
  if (P.globe > 0) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI); ctx.closePath(); ctx.clip();
    ctx.fillStyle = C.leaf; ctx.fillRect(cx - R, cy, 2 * R, R * P.globe);
    continents(ctx, cx, cy, R, P.land);
    ctx.restore();
    ctx.globalAlpha = clamp(P.globe * 2);
    ctx.strokeStyle = C.leafDark; ctx.lineWidth = R * 0.03;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.985, 0, Math.PI); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = C.leafDark; ctx.fillRect(cx - R, cy - R * 0.012, 2 * R, R * 0.03);
    ctx.globalAlpha = 1;
  }
  const s = R / 400;
  const st = (p, i, n) => clamp((p - (i / n) * 0.5) / 0.5);
  const L = P.left;
  solarPanel(ctx, cx - R * 0.72, cy, 70 * s, st(L, 0, 6));
  roundTree(ctx, cx - R * 0.58, cy, 95 * s, st(L, 1, 6), C.leaf, 11);
  solarPanel(ctx, cx - R * 0.44, cy, 74 * s, st(L, 2, 6));
  roundTree(ctx, cx - R * 0.31, cy, 170 * s, st(L, 3, 6), C.leaf, 12);
  acacia(ctx, cx - R * 0.17, cy, 200 * s, st(L, 4, 6), C.leaf, 13);
  solarPanel(ctx, cx - R * 0.07, cy, 82 * s, st(L, 5, 6));
  skyline(ctx, cx, cy, R, P.sky, P.lit);
  if (P.people > 0) for (let i = 0; i < 3; i++) person(ctx, cx - R * (0.52 - i * 0.17), cy, 46 * s, 70 + i, { k: st(P.people, i, 3) });
  turbine(ctx, cx, cy, R * 0.98, P.spin, P.turbine, C.leafDark);
  ctx.restore();
}
export const SKYLINE = [[0.08, 0.06, 0.18], [0.15, 0.05, 0.27], [0.215, 0.05, 0.14], [0.275, 0.06, 0.21], [0.345, 0.05, 0.3], [0.405, 0.055, 0.16], [0.47, 0.06, 0.24], [0.54, 0.05, 0.12], [0.6, 0.055, 0.32], [0.665, 0.06, 0.2]];
export function skyline(ctx, cx, cy, R, g, lit = 0) {
  SKYLINE.forEach(([x, w, h], i) => building(ctx, cx + R * x, cy, R * w, R * h, clamp((g - (i / SKYLINE.length) * 0.5) / 0.5), C.leaf, 30 + i, lit));
}

// A pill button with label.
export function pill(ctx, x, y, text, px, { bg = C.gold, fg = C.night, align = 'center', k = 1 } = {}) {
  font(ctx, 'sans', 800, px);
  ctx.letterSpacing = `${px * 0.02}px`;
  const tw = ctx.measureText(text).width;
  const w = tw + px * 1.8, h = px * 2.2;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.globalAlpha *= clamp(k);
  ctx.translate(x0 + w / 2, y); ctx.scale(lerp(0.85, 1, E.outBack(clamp(k))), lerp(0.85, 1, E.outBack(clamp(k)))); ctx.translate(-(x0 + w / 2), -y);
  ctx.fillStyle = bg; roundRect(ctx, x0, y - h / 2, w, h, h / 2); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x0 + w / 2, y + px * 0.04);
  ctx.restore();
  ctx.letterSpacing = '0px'; ctx.textBaseline = 'alphabetic';
  return { x0, w, h };
}

// Sine-edged wipe panel used as the house transition ("the wave").
export function waveWipe(ctx, W, H, p, col, { dir = 1, amp = 0.05, freq = 2.2, phase = 0 } = {}) {
  if (p <= 0) return;
  const A = Math.max(W, H) * amp;
  const span = W + A * 2;
  const edge = -A + span * p;
  ctx.fillStyle = col;
  ctx.beginPath();
  const steps = 48;
  if (dir > 0) {
    ctx.moveTo(-1, -1);
    for (let i = 0; i <= steps; i++) { const y = (i / steps) * H; ctx.lineTo(edge + Math.sin((y / H) * Math.PI * freq + phase) * A, y); }
    ctx.lineTo(-1, H + 1);
  } else {
    ctx.moveTo(W + 1, -1);
    for (let i = 0; i <= steps; i++) { const y = (i / steps) * H; ctx.lineTo(W - edge - Math.sin((y / H) * Math.PI * freq + phase) * A, y); }
    ctx.lineTo(W + 1, H + 1);
  }
  ctx.closePath(); ctx.fill();
}

export function vignette(ctx, W, H, k = 0.45) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

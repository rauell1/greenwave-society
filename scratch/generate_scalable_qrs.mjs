import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const QR_DIR = path.join(process.cwd(), "public", "qr");
const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");
const BRAIN_DIR = "C:\\Users\\royok\\.gemini\\antigravity\\brain\\5a54f75e-7e2c-429c-abdc-25229a56d1e0";

fs.mkdirSync(QR_DIR, { recursive: true });

const targets = [
  {
    name: "attendee",
    url: "https://greenwavesociety.org/events/graduation-cohort-1",
    title: "RSVP & GUEST PASS",
    subtitle: "SCAN TO REGISTER",
    note: "Free • Instant Pass Confirmation",
    domain: "greenwavesociety.org/events",
  },
  {
    name: "vendor",
    url: "https://greenwavesociety.org/events/community-market",
    title: "BOOK A VENDOR BOOTH",
    subtitle: "SCAN TO REGISTER",
    note: "Subsidized Stall • Tables Provided",
    domain: "greenwavesociety.org/events",
  },
];

async function main() {
  for (const t of targets) {
    // 1. Raw responsive SVGs
    // Emerald
    const svgEmeraldRaw = await QRCode.toString(t.url, {
      type: "svg",
      margin: 2,
      color: { dark: "#002d1e", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    // Ensure viewBox is present and remove hardcoded px dimensions for responsive autoscaling
    const responsiveSvgEmerald = svgEmeraldRaw
      .replace(/width="[0-9]+"/, 'width="100%"')
      .replace(/height="[0-9]+"/, 'height="100%"');

    // Black & White
    const svgBwRaw = await QRCode.toString(t.url, {
      type: "svg",
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    const responsiveSvgBw = svgBwRaw
      .replace(/width="[0-9]+"/, 'width="100%"')
      .replace(/height="[0-9]+"/, 'height="100%"');

    // 2. Standalone Scalable Branded Cards in SVG
    // Extract inner content from svgEmeraldRaw (between <svg...> and </svg>)
    const innerSvgContent = svgEmeraldRaw.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");
    const vbMatch = svgEmeraldRaw.match(/viewBox="([^"]+)"/);
    const qrVb = vbMatch ? vbMatch[1] : "0 0 45 45";

    const cardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 525" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="card-shadow" x="-8%" y="-6%" width="116%" height="114%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#001810" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- Main Card Background -->
  <rect x="8" y="8" width="404" height="509" rx="24" fill="#ffffff" stroke="#d4af37" stroke-width="3" filter="url(#card-shadow)"/>
  
  <!-- Header Title -->
  <text x="210" y="52" text-anchor="middle" font-family="Segoe UI, -apple-system, Roboto, sans-serif" font-weight="700" font-size="22" fill="#002d1e" letter-spacing="1">${t.title}</text>
  
  <!-- Embedded Scalable QR Code -->
  <svg x="55" y="75" width="310" height="310" viewBox="${qrVb}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">
    ${innerSvgContent}
  </svg>
  
  <!-- Bottom Action & Labels -->
  <text x="210" y="425" text-anchor="middle" font-family="Segoe UI, -apple-system, Roboto, sans-serif" font-weight="700" font-size="19" fill="#025c3e" letter-spacing="0.5">${t.subtitle}</text>
  <text x="210" y="452" text-anchor="middle" font-family="Segoe UI, -apple-system, Roboto, sans-serif" font-weight="400" font-size="15" fill="#64746e">${t.domain}</text>
  <text x="210" y="478" text-anchor="middle" font-family="Segoe UI, -apple-system, Roboto, sans-serif" font-weight="600" font-size="14" fill="#c38e20">${t.note}</text>
</svg>`;

    const files = [
      { name: `qr-${t.name}-registration-emerald.svg`, content: responsiveSvgEmerald },
      { name: `qr-${t.name}-registration.svg`, content: responsiveSvgBw },
      { name: `${t.name}-poster-qr-card.svg`, content: cardSvg },
    ];

    for (const f of files) {
      fs.writeFileSync(path.join(QR_DIR, f.name), f.content, "utf8");
      fs.writeFileSync(path.join(DOWNLOADS_DIR, f.name), f.content, "utf8");
      if (fs.existsSync(BRAIN_DIR)) {
        fs.writeFileSync(path.join(BRAIN_DIR, f.name), f.content, "utf8");
      }
    }

    // 3. Multi-resolution PNGs: 256, 512, 1024, 2048, 4096
    const sizes = [256, 512, 1024, 2048, 4096];
    for (const s of sizes) {
      // Emerald
      const bufEmerald = await QRCode.toBuffer(t.url, {
        width: s,
        margin: 2,
        color: { dark: "#002d1e", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      // BW
      const bufBw = await QRCode.toBuffer(t.url, {
        width: s,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });

      const pEmerald = `qr-${t.name}-registration-emerald-${s}px.png`;
      const pBw = `qr-${t.name}-registration-${s}px.png`;

      fs.writeFileSync(path.join(QR_DIR, pEmerald), bufEmerald);
      fs.writeFileSync(path.join(QR_DIR, pBw), bufBw);
      fs.writeFileSync(path.join(DOWNLOADS_DIR, pEmerald), bufEmerald);
      fs.writeFileSync(path.join(DOWNLOADS_DIR, pBw), bufBw);
    }
  }

  console.log("All SVGs, Branded Cards, and Multi-Resolution PNGs generated successfully!");
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
async function sources(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = await Promise.all(entries.map(entry => entry.isDirectory()
    ? sources(path.join(directory, entry.name))
    : /\.(tsx?|jsx?)$/.test(entry.name) ? readFile(path.join(directory, entry.name), "utf8") : ""));
  return results.flat();
}
const references = new Set((await sources(path.join(root, "src"))).flatMap(source =>
  [...source.matchAll(/\/images\/([A-Za-z0-9_.%-]+\.(?:jpe?g|png|webp|avif|svg|gif))/gi)].map(match => match[1])));
const inventory = new Set(JSON.parse(await readFile(path.join(root, "docs/image-manifest.json"), "utf8")));
const missing = [...references].filter(name => !inventory.has(name));
if (missing.length) throw new Error(`Images missing from the CDN inventory: ${missing.join(", ")}`);
if (process.argv.includes("--remote")) {
  const origin = new URL(process.env.IMAGE_CDN_ORIGIN || "https://cdn.greenwavesociety.org");
  const failures = [];
  const queue = [...references];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const name = queue.shift();
      try {
        const response = await fetch(new URL(`/images/${encodeURIComponent(name)}`, origin), { method: "HEAD", signal: AbortSignal.timeout(15000) });
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) failures.push(`${name}: HTTP ${response.status}`);
      } catch (error) { failures.push(`${name}: ${error.message}`); }
    }
  }));
  if (failures.length) throw new Error(`CDN verification failed:\n${failures.join("\n")}`);
}
console.log(`Validated ${references.size} referenced images${process.argv.includes("--remote") ? " on the CDN" : " against the CDN inventory"}.`);

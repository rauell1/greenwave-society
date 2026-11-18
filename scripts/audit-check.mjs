// CI security gate: `npm audit --omit=dev --audit-level=high`, except for the
// advisories listed below. Any other high or critical advisory still fails.
import { execFileSync } from "node:child_process";

// Each entry needs a reason and is removed once a patched release is out.
const EXEMPT = new Map([
  [
    "GHSA-fc5q-39xc-vjpf",
    "picomatch ReDoS (<=4.0.7). 4.0.7 is the latest release, so no fix exists yet; " +
      "picomatch is only reached through build tooling (OpenNext, Sentry's bundler plugin, vite, @parcel/watcher). " +
      "Remove once picomatch ships a patched version.",
  ],
]);

const BLOCKING = new Set(["high", "critical"]);

let output;
try {
  output = execFileSync("npm", ["audit", "--omit=dev", "--json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (error) {
  // npm audit exits non-zero when it finds anything; the report is still on stdout.
  output = error.stdout;
  if (!output) throw error;
}

const report = JSON.parse(output);
if (report.error) throw new Error(`npm audit failed: ${report.error.summary ?? JSON.stringify(report.error)}`);

const advisories = new Map();
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vulnerability.via) {
    if (typeof via !== "object" || !BLOCKING.has(via.severity)) continue;
    const id = via.url?.split("/").pop() ?? String(via.source);
    advisories.set(id, { title: via.title, severity: via.severity, package: via.name, range: via.range });
  }
}

const blocking = [...advisories].filter(([id]) => !EXEMPT.has(id));
for (const [id] of advisories) {
  if (EXEMPT.has(id)) console.log(`Exempt: ${id}: ${EXEMPT.get(id)}`);
}
for (const id of EXEMPT.keys()) {
  if (!advisories.has(id)) console.log(`Exemption no longer needed: ${id} is not reported any more; remove it from scripts/audit-check.mjs.`);
}
if (blocking.length) {
  for (const [id, a] of blocking) console.error(`${a.severity.toUpperCase()} ${id}: ${a.package} ${a.range}: ${a.title}`);
  console.error(`${blocking.length} high or critical advisories in production dependencies.`);
  process.exit(1);
}
console.log("No high or critical advisories in production dependencies outside the exemptions.");

import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const standaloneRoot = join(".next", "standalone");
const standaloneNext = join(standaloneRoot, ".next");
const staticSource = join(".next", "static");
const staticTarget = join(standaloneNext, "static");
const publicSource = "public";
const publicTarget = join(standaloneRoot, "public");

mkdirSync(standaloneNext, { recursive: true });

if (existsSync(staticSource)) {
  cpSync(staticSource, staticTarget, { recursive: true });
}

if (existsSync(publicSource)) {
  cpSync(publicSource, publicTarget, { recursive: true });
}

import { spawnSync } from "node:child_process";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("Set TEST_DATABASE_URL to a disposable local PostgreSQL database ending in _test");
const parsed = new URL(url);
if (!["postgresql:", "postgres:"].includes(parsed.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname) || !parsed.pathname.endsWith("_test")) {
  throw new Error("Integration tests only accept a local PostgreSQL database with a name ending in _test");
}
const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run"], {
  stdio: "inherit",
  env: { ...process.env, RUN_DATABASE_TESTS: "true", DATABASE_URL: url, DIRECT_DATABASE_URL: url, RATE_LIMIT_STORE: "database", ADMIN_EMAILS: "", RESEND_API_KEY: "" },
});
process.exit(result.status ?? 1);

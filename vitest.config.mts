import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: process.env.RUN_DATABASE_TESTS === "true" ? ["src/**/*.integration.test.ts"] : ["src/**/*.test.ts"],
    exclude: process.env.RUN_DATABASE_TESTS === "true" ? [] : ["src/**/*.integration.test.ts"],
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});

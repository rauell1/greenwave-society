# Dependency audit

The October 6, 2026 update installs compatible security fixes through the npm lockfile, including Next.js 16.3.8, sharp 0.35.5, and Vitest 4.1.11. Use `npm ci` to reproduce the reviewed dependency tree.

The full audit still reports the unpatched `braces` advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), reached through `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch`. This is development tooling. The full CI audit remains enabled and will fail until an upstream fix is available. Do not run `npm audit fix --force`: its proposed Next.js ESLint configuration downgrade is incompatible with this repository's framework version.

Run `npm audit --omit=dev --audit-level=high` for the production dependency tree, and `npm audit --audit-level=high` for the complete tree. Recheck the advisory when updating the ESLint tooling.

/**
 * What a public content loader does when the database read fails.
 *
 * The public pages are cached (revalidate in src/app). While the site is
 * built there is no earlier page to keep, so the curated defaults are used
 * and the deploy goes ahead. At runtime the error is rethrown: Next.js then
 * keeps serving the last good page and retries the refresh later, instead of
 * caching the defaults for the page's whole revalidate time.
 */
export function fallbackDuringBuild<T>(error: unknown, fallback: T): T {
  if (process.env.NEXT_PHASE === "phase-production-build") return fallback;
  throw error;
}

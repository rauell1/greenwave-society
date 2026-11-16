/**
 * Cloudflare Worker entry point.
 *
 * Wraps the OpenNext-generated worker so that the cron trigger declared in wrangler.jsonc can
 * call the same route Vercel Cron used to call. The .open-next directory is build output, so
 * these imports only resolve after `opennextjs-cloudflare build`. Wrangler bundles this file; it
 * is excluded from tsconfig.json because the generated worker has no stable types.
 */
import { Client } from "pg";
import { siteImageRoute } from "./src/lib/site-images";
// @ts-expect-error Generated at build time.
import openNextWorker from "./.open-next/worker.js";

// @ts-expect-error Generated at build time.
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string; NEXT_PUBLIC_APP_URL?: string; IMAGE_DELIVERY?: string };
type Context = { waitUntil(promise: Promise<unknown>): void };

/**
 * Minimal SQL access for src/lib/rate-limit.ts. This file is bundled for Workers, so `pg` gets
 * its Workers socket here, which the Node-targeted proxy bundle does not. One connection per
 * query, because Workers cannot share a socket between requests.
 */
(globalThis as Record<symbol, unknown>)[Symbol.for("greenwave.sqlQuery")] = async (text: string, values: unknown[]) => {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const client = new Client({ connectionString });
  await client.connect();
  try {
    return (await client.query(text, values)).rows;
  } finally {
    await client.end().catch(() => undefined);
  }
};

const CRON_ROUTES = ["/api/cron/event-emails"];

/**
 * Site photos come from object storage (src/lib/site-images.ts). They never
 * change under the same name, so each one is kept in the Cloudflare edge cache
 * after the first visit instead of being read from storage every time.
 */
async function serveSiteImage(request: Request, route: string, env: Env, ctx: Context): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(new URL(route, request.url).toString(), { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return request.method === "HEAD" ? new Response(null, cached) : cached;
  const response: Response = await openNextWorker.fetch(cacheKey, env, ctx);
  if (response.status === 200) ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return request.method === "HEAD" ? new Response(null, response) : response;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: Context) {
    if ((request.method === "GET" || request.method === "HEAD") && env.IMAGE_DELIVERY !== "cdn") {
      const route = siteImageRoute(new URL(request.url));
      if (route) return serveSiteImage(request, route, env, ctx);
    }
    return openNextWorker.fetch(request, env, ctx);
  },

  async scheduled(_controller: unknown, env: Env, ctx: Context) {
    const origin = env.NEXT_PUBLIC_APP_URL || "https://greenwavesociety.org";
    for (const path of CRON_ROUTES) {
      const request = new Request(new URL(path, origin), {
        headers: { authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
      });
      const response: Response = await openNextWorker.fetch(request, env, ctx);
      const body = await response.text();
      if (response.ok) console.log(`cron ${path} ${response.status} ${body.slice(0, 500)}`);
      else console.error(`cron ${path} failed ${response.status} ${body.slice(0, 500)}`);
    }
  },
};

export default worker;

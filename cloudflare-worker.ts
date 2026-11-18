/**
 * Cloudflare Worker entry point.
 *
 * Wraps the OpenNext-generated worker so that the cron trigger declared in wrangler.jsonc can
 * call the same route Vercel Cron used to call. The .open-next directory is build output, so
 * these imports only resolve after `opennextjs-cloudflare build`. Wrangler bundles this file; it
 * is excluded from tsconfig.json because the generated worker has no stable types.
 */
import { Client } from "pg";
import { AwsClient } from "aws4fetch";
import { siteImageRoute, storedImageRequest, type StoredImageRequest } from "./src/lib/site-images";
// @ts-expect-error Generated at build time.
import openNextWorker from "./.open-next/worker.js";

// @ts-expect-error Generated at build time.
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

type ImagesBinding = {
  input(stream: ReadableStream): {
    transform(options: { width?: number; fit?: string }): {
      output(options: { format: string; quality?: number }): Promise<{ response(): Response }>;
    };
  };
};
type Env = {
  CRON_SECRET?: string;
  NEXT_PUBLIC_APP_URL?: string;
  IMAGE_DELIVERY?: string;
  AWS_ENDPOINT_URL_S3?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  OBJECT_STORAGE_BUCKET?: string;
  IMAGES?: ImagesBinding;
  SITE_IMAGES?: SiteImageBucket;
};
/** The parts of an R2 bucket binding used here. */
type SiteImageBucket = {
  get(key: string): Promise<{ body: ReadableStream; size: number; httpMetadata?: { contentType?: string } } | null>;
};
type Context = { waitUntil(promise: Promise<unknown>): void };

/**
 * Minimal SQL access for src/lib/rate-limit.ts. This file is bundled for Workers, so `pg` gets
 * its Workers socket here, which the Node-targeted proxy bundle does not. One connection per
 * query, because Workers cannot share a socket between requests.
 */
(globalThis as Record<symbol, unknown>)[Symbol.for("greenwave.sqlQuery")] = async (text: string, values: unknown[]) => {
  const hyperdrive = ((globalThis as Record<symbol, unknown>)[Symbol.for("__cloudflare-context__")] as
    | { env?: { HYPERDRIVE?: { connectionString?: string } } }
    | undefined)?.env?.HYPERDRIVE?.connectionString;
  const connectionString = hyperdrive || process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;
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
 * Site photos come from object storage (src/lib/site-images.ts) and are served
 * here, before Next.js: the stored object's body is passed straight through,
 * which costs the Worker almost no CPU, where streaming it through a Next.js
 * route used up the Free plan's CPU budget and cut large photos off part-way.
 *
 * For next/image requests the IMAGES binding returns a copy at the width the
 * page asked for (WebP when the browser accepts it), so a gallery tile is tens
 * of kilobytes instead of the full photo. If resizing is unavailable (for
 * example the monthly transformation allowance is used up) the original is
 * served. Every result is kept in the Cloudflare edge cache: photos never
 * change under the same name (docs/image-delivery.md).
 */
const IMMUTABLE = "public, max-age=31536000, immutable";

function storageClient(env: Env): { client: AwsClient; endpoint: string; bucket: string } | null {
  const endpoint = env.AWS_ENDPOINT_URL_S3?.replace(/\/+$/, "");
  if (!endpoint || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.OBJECT_STORAGE_BUCKET) return null;
  const client = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    service: "s3",
    region: env.AWS_REGION || "auto",
  });
  return { client, endpoint, bucket: env.OBJECT_STORAGE_BUCKET };
}

function withHeaders(body: BodyInit | null, type: string, length: string | null, resized: boolean): Response {
  const headers = new Headers({ "Content-Type": type, "Cache-Control": IMMUTABLE, "X-Content-Type-Options": "nosniff" });
  if (length) headers.set("Content-Length", length);
  if (resized) headers.set("Vary", "Accept");
  return new Response(body, { headers });
}

async function serveSiteImage(request: Request, image: StoredImageRequest, env: Env, ctx: Context): Promise<Response> {
  const head = (response: Response) => (request.method === "HEAD" ? new Response(null, response) : response);
  const webp = /image\/webp/.test(request.headers.get("accept") || "");
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(
    new URL(`/__site-image/${encodeURIComponent(image.key)}?w=${image.width ?? 0}&q=${image.quality}&webp=${webp ? 1 : 0}`, request.url).toString(),
  );
  const cached = await cache.match(cacheKey);
  if (cached) return head(cached);

  // Web-sized copies (WebP, at most 1600px wide) live in the R2 bucket bound
  // as SITE_IMAGES, next to the Worker. The HD originals stay in Neon object
  // storage, which is also used for anything not copied to R2 (for example
  // photos uploaded in the admin since the copy).
  let source: { body: ReadableStream; type: string; length: string | null } | null = null;
  // The copies are WebP, so a browser that does not accept WebP gets the
  // original from Neon instead.
  const copy = env.SITE_IMAGES && webp ? await env.SITE_IMAGES.get(image.key) : null;
  if (copy) {
    source = { body: copy.body, type: copy.httpMetadata?.contentType || "application/octet-stream", length: String(copy.size) };
  } else {
    const storage = storageClient(env);
    if (!storage) {
      // Not configured here: fall back to the Next.js route.
      const route = siteImageRoute(new URL(request.url));
      return head(await openNextWorker.fetch(new Request(new URL(route!, request.url)), env, ctx));
    }
    const objectUrl = `${storage.endpoint}/${encodeURIComponent(storage.bucket)}/${image.key.split("/").map(encodeURIComponent).join("/")}`;
    const fetched = await storage.client.fetch(objectUrl, { method: "GET" });
    if (fetched.status === 404) return new Response("Not found", { status: 404 });
    if (!fetched.ok || !fetched.body) return new Response("Image unavailable", { status: 502 });
    source = { body: fetched.body, type: fetched.headers.get("content-type") || "application/octet-stream", length: fetched.headers.get("content-length") };
  }
  const original = { body: source.body, headers: new Headers({ "content-type": source.type, ...(source.length ? { "content-length": source.length } : {}) }) };
  const type = source.type;

  let response: Response | null = null;
  if (image.width && env.IMAGES && /^image\/(jpeg|png|webp)$/.test(type)) {
    const [forResize, spare] = original.body.tee();
    try {
      const output = await env.IMAGES.input(forResize)
        .transform({ width: image.width, fit: "scale-down" })
        .output({ format: webp ? "image/webp" : type, quality: image.quality });
      const resized = output.response();
      response = withHeaders(resized.body, resized.headers.get("content-type") || type, resized.headers.get("content-length"), true);
      ctx.waitUntil(spare.cancel());
    } catch (error) {
      console.warn(`[site-images] resize failed for ${image.key}, serving the original: ${(error as Error).message}`);
      response = withHeaders(spare, type, original.headers.get("content-length"), false);
    }
  } else {
    response = withHeaders(original.body, type, original.headers.get("content-length"), false);
  }
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return head(response);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: Context) {
    if ((request.method === "GET" || request.method === "HEAD") && env.IMAGE_DELIVERY !== "cdn") {
      const image = storedImageRequest(new URL(request.url));
      if (image) return serveSiteImage(request, image, env, ctx);
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

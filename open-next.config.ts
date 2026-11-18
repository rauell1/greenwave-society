import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

// Serve prerendered and ISR pages from cache instead of rendering them on
// every request: an R2 bucket holds them (filled at deploy), the Cloudflare cache
// in each data center keeps a copy close to visitors, and the queue refreshes
// pages in the background when their revalidate time passes.
// The tag cache makes revalidatePath/revalidateTag clear cached pages.
// Pages are kept in R2 rather than Workers KV: every deploy and every page
// refresh writes to the page cache, and KV's write allowance ran out (a deploy
// failed with "free usage limit for this operation", code 10048).
const config = defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: memoryQueue,
  tagCache: kvNextTagCache,
  enableCacheInterception: true,
});

export default config;

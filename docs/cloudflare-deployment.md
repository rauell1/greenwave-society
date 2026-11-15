# Cloudflare deployment

Hosting runs on Cloudflare Workers through the OpenNext Cloudflare adapter. `.github/workflows/deploy-cloudflare.yml` builds and deploys on every push to `main`.

## Files

- `open-next.config.ts`, `wrangler.jsonc`: adapter and Worker configuration, including the custom domains and the daily cron trigger.
- `cloudflare-worker.ts`: Worker entry point. It wraps the generated OpenNext worker, runs `/api/cron/event-emails` from the cron trigger with `CRON_SECRET`, and registers the SQL hook the rate limiter uses.

## GitHub repository settings

Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `DATABASE_URL`, `DIRECT_DATABASE_URL`, `SENTRY_AUTH_TOKEN` (optional, for source maps).

Variables: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ENABLE_ANALYTICS`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `IMAGE_CDN_ORIGIN`.

## Worker secrets

Every runtime variable in `.env.example`, set with `npx wrangler secret put NAME` or in the Cloudflare dashboard. Also set `TRUST_CLOUDFLARE_IP=true` so the rate limiter keys on the real client address.

## Differences from Vercel

- The Prisma client is created per request on Workers (`src/lib/db.ts`), because Workers cannot share a socket between requests.
- `src/proxy.ts` loads the rate limiter on demand, and on Workers the limiter runs its query through the hook in `cloudflare-worker.ts` (see the comments in `src/lib/rate-limit.ts`).
- The `/index` and `/home` redirects moved from `vercel.json` to `next.config.ts`. Security headers were already set in `src/proxy.ts` and `next.config.ts`.
- The Worker bundle is about 8.2 MB compressed. The Workers Paid plan allows 10 MB, so watch this when adding dependencies.
- CMS media storage: new uploads go to Neon object storage when `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` and `OBJECT_STORAGE_BUCKET` are set (Neon project `fancy-math-09311878` "rauell-file-storage", private bucket `greenwave-media`; these are already stored as Worker secrets). The site serves them from `/media-files/media/...` (`src/app/media-files/[...path]/route.ts`), so stored URLs are same-origin paths. Assets uploaded earlier keep their Vercel Blob URLs until they are copied.
- CMS uploads no longer use `sharp` (a native library that cannot run on Workers). The media library scales JPEG, PNG and WebP photos to their preset's box and converts them to WebP in the browser (`src/lib/media/prepare-upload.ts`). The server rebuilds each file from its image data alone (`src/lib/media/image-sanitize.ts`): EXIF including GPS location, XMP, comments and appended bytes are dropped, only the camera orientation is kept, and images larger than the preset are refused. It does not decode the image, because a decode and re-encode of a photo needs several hundred MB and a Worker has 128 MB.

## Local check

`npm run cf:preview` with the variables in a `.dev.vars` file. Add `--test-scheduled` to `wrangler dev` and open `/__scheduled?cron=0+5+*+*+*` to fire the cron handler.

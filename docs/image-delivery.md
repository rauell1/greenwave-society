# Image delivery

On Cloudflare the website serves `/images/*` from the Neon object-storage
bucket `greenwave-media` (project `fancy-math-09311878`), under the same
`images/` keys. `cloudflare-worker.ts` sends `/images/*` and
`/_next/image?url=/images/*` to `src/app/media-files/[...path]/route.ts`
(`src/lib/site-images.ts`), and keeps each photo in the Cloudflare edge cache
after the first visit. Local `public/images/` files are working copies and are
deliberately excluded from Git.

`cdn.greenwavesociety.org` still points at the R2 bucket, which is not enabled,
and its DNS record can only be changed from the R2 settings. Absolute photo
links therefore use `https://greenwavesociety.org/images/...`; next/image
requests for old `cdn.greenwavesociety.org` links stored in CMS content are
mapped to object storage too.

Graduation album photos are built from the originals in `graduation-photos/`
(not in Git) with `npm run images:graduation`, then uploaded with
`npm run images:upload`.

Upload new or changed photos from a folder that has them in `public/images/`:

```bash
npm run images:upload -- --dry-run   # list what would be uploaded
npm run images:upload                # upload what is not uploaded yet
```

The script signs in with the Neon command-line tool, scales photos larger than
1920 px down first, and records finished files in
`public/images/.neon-uploaded.txt`, so it can be stopped and run again.

To go back to the CDN below (for example once Cloudflare R2 is enabled and
`scripts/sync-public-images-to-r2.mjs` has run), set the Worker variable
`IMAGE_DELIVERY=cdn`. The `next.config.ts` rewrite then applies again.

## CDN

The CDN setup serves `/images/*` from `https://cdn.greenwavesociety.org/images/*`
through a Next.js rewrite.

Set `IMAGE_CDN_ORIGIN` to an HTTPS origin to use a different image host. Upload
images under its `/images/` prefix before publishing references to them.
The same origin is allowed by the Next.js image optimizer.

`docs/image-manifest.json` records the image filenames available for use. Add
new filenames after uploading them. Run `npm run images:check` to detect source
references missing from this inventory, and `npm run images:check -- --remote`
to verify every referenced image returns an image response from the CDN.
The inventory check runs in CI; the remote check should run before a release.

Filenames are case sensitive on the CDN. Use a new filename when replacing an
image because image responses and optimized variants have long cache lifetimes.

# Image delivery

The website serves `/images/*` from `https://cdn.greenwavesociety.org/images/*`
through a Next.js rewrite. Local `public/images/` files are working copies and
are deliberately excluded from Git. A clean checkout uses the CDN.

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

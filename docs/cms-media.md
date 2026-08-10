# CMS media library

The media module stores public website assets in Vercel Blob and searchable metadata in Neon. Uploads require `media.upload`, the `cms.media` feature flag, and `BLOB_READ_WRITE_TOKEN`. The server enforces a 10 MB limit, an allow-list of JPEG/PNG/WebP/GIF/PDF, magic-byte validation, image decoding limits, safe generated paths, and SHA-256 checksums.

Asset metadata includes dimensions, alternative text, captions, uploader, timestamps, and explicit usage references. An asset with usages cannot be deleted. Deletion uses a compare-and-swap state, removes Blob content first, and preserves/reactivates the database record if storage deletion fails. Upload cleanup removes orphaned Blob content when the metadata transaction fails. All mutations are audited.

Before production activation, provision Vercel Blob, set `BLOB_READ_WRITE_TOKEN`, apply `20260810210000_cms_media`, seed RBAC, verify upload/delete in preview, and enable `cms.media`. Public Blob access is intentional for assets rendered on the public website; sensitive documents must use a separate private-storage workflow.

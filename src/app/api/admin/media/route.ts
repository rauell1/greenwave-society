import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { createHash, randomUUID } from "crypto";
import { authorizeRoute } from "@/lib/auth/route-authorization";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { ALLOWED_MEDIA_TYPES, hasValidSignature, MAX_MEDIA_BYTES, mediaMetadataSchema, safeMediaFilename } from "@/lib/media/validation";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-service";

export const runtime = "nodejs";

function hasBlobCredentials(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
}

export async function GET(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.MEDIA_READ); if (!auth.ok) return auth.response;
  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const assets = await getDb().cmsMediaAsset.findMany({ where: { status: "active", ...(search ? { OR: [{ filename: { contains: search, mode: "insensitive" } }, { altText: { contains: search, mode: "insensitive" } }, { caption: { contains: search, mode: "insensitive" } }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { usages: true } } } });
  return NextResponse.json({ assets }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await authorizeRoute(PERMISSIONS.MEDIA_UPLOAD); if (!auth.ok) return auth.response;
  if (!hasBlobCredentials()) return NextResponse.json({ error: "Media storage is not configured" }, { status: 503 });
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_MEDIA_BYTES + 64 * 1024) return NextResponse.json({ error: "Upload request is too large" }, { status: 413 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "A file is required" }, { status: 400 });
  if (!ALLOWED_MEDIA_TYPES.includes(file.type as typeof ALLOWED_MEDIA_TYPES[number])) return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF, and PDF files are allowed" }, { status: 415 });
  if (file.size < 1 || file.size > MAX_MEDIA_BYTES) return NextResponse.json({ error: "Files must be between 1 byte and 10 MB" }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type)) return NextResponse.json({ error: "File content does not match its declared type" }, { status: 415 });
  const metadataInput = mediaMetadataSchema.safeParse({ altText: String(form.get("altText") ?? "").trim() || null, caption: String(form.get("caption") ?? "").trim() || null });
  if (!metadataInput.success) return NextResponse.json({ error: "Invalid media metadata" }, { status: 400 });
  if (file.type.startsWith("image/") && !metadataInput.data.altText) return NextResponse.json({ error: "Alternative text is required for images" }, { status: 400 });
  let dimensions: { width?: number; height?: number } = {};
  if (file.type.startsWith("image/")) { try { const metadata = await sharp(bytes, { animated: false, limitInputPixels: 40_000_000 }).metadata(); dimensions = { width: metadata.width, height: metadata.height }; } catch { return NextResponse.json({ error: "The image is corrupt or unsafe to process" }, { status: 415 }); } }
  const extensionByType: Record<string,string> = { "image/jpeg":".jpg", "image/png":".png", "image/webp":".webp", "image/gif":".gif", "application/pdf":".pdf" };
  const filename = safeMediaFilename(file.name).replace(/\.[a-z0-9]{1,8}$/i, "") + extensionByType[file.type]; const pathname = `media/${randomUUID()}-${filename}`;
  const blob = await put(pathname, Buffer.from(bytes), { access: "public", addRandomSuffix: false, contentType: file.type, token: process.env.BLOB_READ_WRITE_TOKEN });
  try {
    const asset = await getDb().$transaction(async tx => { const created = await tx.cmsMediaAsset.create({ data: { filename, pathname: blob.pathname, url: blob.url, contentType: file.type, size: file.size, checksum: createHash("sha256").update(bytes).digest("hex"), width: dimensions.width, height: dimensions.height, altText: metadataInput.data.altText || null, caption: metadataInput.data.caption || null, uploadedById: auth.admin.id, updatedById: auth.admin.id } }); await tx.auditLog.create({ data: { action: AUDIT_ACTIONS.MEDIA_UPLOADED, actor: auth.admin.email, actorUserId: auth.admin.id, resourceType: "cms_media_asset", resourceId: created.id, outcome: "SUCCESS", afterState: JSON.stringify({ filename, contentType: file.type, size: file.size, checksum: created.checksum }) } }); return created; });
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) { await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => undefined); throw error; }
}

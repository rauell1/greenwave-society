import "server-only";
import { AwsClient } from "aws4fetch";

/**
 * S3-compatible object storage (Neon object storage today; Cloudflare R2 or
 * any S3 service later, by changing only the environment).
 *
 *   AWS_ENDPOINT_URL_S3     e.g. https://<branch>.storage.<cell>.<region>.aws.neon.tech
 *   AWS_ACCESS_KEY_ID       storage credential
 *   AWS_SECRET_ACCESS_KEY   storage credential
 *   AWS_REGION              e.g. us-east-2 ("auto" for R2)
 *   OBJECT_STORAGE_BUCKET   private bucket for this app
 *
 * aws4fetch signs plain fetch() requests, so the same code runs on Node and
 * on Cloudflare Workers. Objects are addressed path-style:
 * <endpoint>/<bucket>/<key>.
 */

export const OBJECT_STORAGE_PROVIDER = "object-storage";

interface StorageConfig {
  endpoint: string;
  bucket: string;
  client: AwsClient;
}

let cached: { key: string; config: StorageConfig } | undefined;

function config(): StorageConfig | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/+$/, "");
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.OBJECT_STORAGE_BUCKET;
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) return null;
  const region = process.env.AWS_REGION || "auto";
  const key = [endpoint, accessKeyId, bucket, region].join("|");
  if (cached?.key !== key) {
    cached = { key, config: { endpoint, bucket, client: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region }) } };
  }
  return cached.config;
}

export function objectStorageConfigured(): boolean {
  return config() !== null;
}

function requireConfig(): StorageConfig {
  const value = config();
  if (!value) throw new Error("Object storage is not configured");
  return value;
}

/** Encodes each path segment but keeps the slashes that separate them. */
function objectUrl({ endpoint, bucket }: StorageConfig, key: string): string {
  if (!key || key.startsWith("/") || key.split("/").some((part) => part === ".." || part === "")) {
    throw new Error("Invalid object key");
  }
  return `${endpoint}/${encodeURIComponent(bucket)}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function putObject(key: string, body: ArrayBuffer | Uint8Array | Blob, contentType: string): Promise<void> {
  const storage = requireConfig();
  const payload = body instanceof Blob ? await body.arrayBuffer() : body;
  const response = await storage.client.fetch(objectUrl(storage, key), {
    method: "PUT",
    body: payload as BodyInit,
    headers: { "Content-Type": contentType || "application/octet-stream" },
  });
  if (!response.ok) throw new Error(`Object storage upload failed (${response.status})`);
}

/** The object as a streaming response, or null when it does not exist. */
export async function getObject(key: string): Promise<Response | null> {
  const storage = requireConfig();
  const response = await storage.client.fetch(objectUrl(storage, key), { method: "GET" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Object storage download failed (${response.status})`);
  return response;
}

export async function deleteObject(key: string): Promise<void> {
  const storage = requireConfig();
  const response = await storage.client.fetch(objectUrl(storage, key), { method: "DELETE" });
  if (!response.ok && response.status !== 404) throw new Error(`Object storage delete failed (${response.status})`);
}

/** Same-origin URL that serves a stored media object (see app/media-files/[...path]/route.ts). */
export const MEDIA_FILES_PREFIX = "/media-files/";
export function mediaFileUrl(pathname: string): string {
  return MEDIA_FILES_PREFIX + pathname.split("/").map(encodeURIComponent).join("/");
}

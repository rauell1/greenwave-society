import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getDb } from "./db";

const COOKIE_NAME   = "gw_admin_session";
const SESSION_TTL   = 8 * 60 * 60 * 1000; // 8 hours
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN       = 64;

// â”€â”€ email allow-list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getAllowedEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email: string): boolean {
  return getAllowedEmails().includes(email.trim().toLowerCase());
}

// â”€â”€ password hashing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
    return timingSafeEqual(derived, Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// â”€â”€ session cookie â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function signToken(token: string): string {
  const secret = process.env.SESSION_SECRET ?? "greenwave-fallback-secret-change-me-now";
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function createAdminSession(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const db    = getDb();
  // store email in token payload: token|email
  const payload = `${token}|${email}`;
  await db.adminSession.create({
    data: { token: payload, expiresAt: new Date(Date.now() + SESSION_TTL) },
  });
  return payload;
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${token}.${signToken(token)}`, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   SESSION_TTL / 1000,
    path:     "/",
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<{ valid: boolean; email?: string }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return { valid: false };

  const lastDot = raw.lastIndexOf(".");
  const payload = raw.slice(0, lastDot);
  const sig     = raw.slice(lastDot + 1);
  if (!payload || !sig || sig !== signToken(payload)) return { valid: false };

  const db      = getDb();
  const session = await db.adminSession.findUnique({ where: { token: payload } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.adminSession.delete({ where: { token: payload } });
    return { valid: false };
  }

  const email = payload.split("|")[1];
  return { valid: true, email };
}

export async function requireAdminSession() {
  const { valid } = await getAdminSession();
  if (!valid) {
    const { redirect } = await import("next/navigation");
    redirect("/admin");
  }
}

// ── super admin ───────────────────────────────────────────────────────────────

const SUPER_ADMIN_EMAIL = “royokola3@gmail.com”;

export function isSuperAdmin(email: string | undefined): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL;
}

export async function getAdminEmail(): Promise<string | undefined> {
  const { email } = await getAdminSession();
  return email;
}

// ── reset token ───────────────────────────────────────────────────────────────

export function generateResetToken(): { token: string; expiry: Date } {
  return {
    token:  randomBytes(32).toString("hex"),
    expiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };
}


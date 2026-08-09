import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  createAdminSession,
  getAdminSession as getVerifiedSession,
  revokeAllUserSessions,
  setAdminSessionCookie,
} from "./auth/session";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;
const SUPER_ADMIN_EMAIL = "royokola3@gmail.com";

export function getAllowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email: string): boolean {
  return getAllowedEmails().includes(email.trim().toLowerCase());
}

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

export { clearAdminSessionCookie, createAdminSession, revokeAllUserSessions, setAdminSessionCookie };

export async function getAdminSession(): Promise<{ valid: boolean; email?: string }> {
  const session = await getVerifiedSession();
  return session ? { valid: true, email: session.email } : { valid: false };
}

export async function requireAdminSession(): Promise<void> {
  if (!(await getVerifiedSession())) redirect("/admin");
}

export function isSuperAdmin(email: string | undefined): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL;
}

export async function getAdminEmail(): Promise<string | undefined> {
  return (await getVerifiedSession())?.email;
}

export function generateResetToken(): { token: string; expiry: Date } {
  return { token: randomBytes(32).toString("hex"), expiry: new Date(Date.now() + 60 * 60 * 1000) };
}

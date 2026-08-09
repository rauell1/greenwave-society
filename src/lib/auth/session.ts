import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes } from "crypto";
import { getDb } from "../db";
import { AdminSessionDto } from "./types";

const COOKIE_NAME = "gw_admin_session";
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours
const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

export function signToken(token: string): string {
  const secret = process.env.SESSION_SECRET ?? "greenwave-fallback-secret-change-me-now";
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function createAdminSession(userId: string | null, email?: string, userAgent?: string, ipHash?: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const db = getDb();
  
  // Backward compatibility: store email if provided, but prefer userId.
  const payload = userId ? `${token}|uid:${userId}` : `${token}|${email}`;

  await db.adminSession.create({
    data: { 
      token: payload, 
      userId,
      userAgent,
      ipHash,
      expiresAt: new Date(Date.now() + SESSION_TTL),
      idleExpiresAt: new Date(Date.now() + IDLE_TIMEOUT),
    },
  });
  
  return payload;
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${token}.${signToken(token)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL / 1000,
    path: "/",
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(userAgent?: string, ipHash?: string): Promise<{ valid: boolean; session?: AdminSessionDto }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return { valid: false };

  const lastDot = raw.lastIndexOf(".");
  const payload = raw.slice(0, lastDot);
  const sig = raw.slice(lastDot + 1);
  if (!payload || !sig || sig !== signToken(payload)) return { valid: false };

  const db = getDb();
  const session = await db.adminSession.findUnique({ where: { token: payload } });
  
  if (!session) return { valid: false };
  
  if (
    session.revokedAt || 
    session.expiresAt < new Date() || 
    (session.idleExpiresAt && session.idleExpiresAt < new Date())
  ) {
    await db.adminSession.delete({ where: { token: payload } });
    return { valid: false };
  }

  // Optional: Verify IP/UA binding here
  // If strict, we could invalidate on ipHash/userAgent mismatch.
  
  // Extend idle expiration
  await db.adminSession.update({
    where: { token: payload },
    data: { idleExpiresAt: new Date(Date.now() + IDLE_TIMEOUT) }
  });

  // Extract old email fallback if uid is not present in token payload
  const parts = payload.split("|");
  let fallbackEmail: string | undefined;
  if (parts[1] && !parts[1].startsWith("uid:")) {
    fallbackEmail = parts[1];
  }

  return { 
    valid: true, 
    session: {
      id: session.id,
      userId: session.userId,
      email: fallbackEmail,
      expiresAt: session.expiresAt,
      idleExpiresAt: session.idleExpiresAt
    } 
  };
}

export async function revokeAllUserSessions(userId: string, reason?: string) {
  const db = getDb();
  await db.adminSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revocationReason: reason }
  });
}

export async function revokeSession(sessionId: string, reason?: string) {
  const db = getDb();
  await db.adminSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date(), revocationReason: reason }
  });
}

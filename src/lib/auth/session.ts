import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDb } from "../db";
import { hashSessionToken } from "./session-token";

const COOKIE_NAME = "gw_admin_session";
const ABSOLUTE_TTL_MS = 8 * 60 * 60 * 1000;
const IDLE_TTL_MS = 2 * 60 * 60 * 1000;

export interface VerifiedAdminSession {
  id: string;
  userId: string | null;
  email: string | undefined;
  expiresAt: Date;
  idleExpiresAt: Date | null;
}

function safeEqualHex(left: string, right: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
  } catch {
    return false;
  }
}

function legacySecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") return null;
  return secret ?? "development-only-session-secret";
}

export async function createAdminSession(
  userId: string,
  metadata: { userAgent?: string; ipHash?: string } = {},
): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const now = Date.now();
  await getDb().adminSession.create({
    data: {
      tokenHash: hashSessionToken(rawToken),
      userId,
      userAgent: metadata.userAgent?.slice(0, 500),
      ipHash: metadata.ipHash,
      expiresAt: new Date(now + ABSOLUTE_TTL_MS),
      idleExpiresAt: new Date(now + IDLE_TTL_MS),
    },
  });
  return rawToken;
}

export async function setAdminSessionCookie(rawToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ABSOLUTE_TTL_MS / 1000,
    path: "/",
  });
}

async function findLegacySession(cookieValue: string) {
  const splitAt = cookieValue.lastIndexOf(".");
  if (splitAt < 1) return null;
  const payload = cookieValue.slice(0, splitAt);
  const suppliedSignature = cookieValue.slice(splitAt + 1);
  const secret = legacySecret();
  if (!secret) return null;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (!safeEqualHex(suppliedSignature, expected)) return null;
  return getDb().adminSession.findUnique({
    where: { token: payload },
    include: { user: { select: { email: true, isActive: true } } },
  });
}

export async function getAdminSession(): Promise<VerifiedAdminSession | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const db = getDb();
  const session = await db.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(raw) },
    include: { user: { select: { email: true, isActive: true } } },
  }) ?? await findLegacySession(raw);

  if (!session) return null;
  const now = new Date();
  const user = session.user;
  const expired = session.expiresAt <= now || Boolean(session.idleExpiresAt && session.idleExpiresAt <= now);
  if (session.revokedAt || expired || (user && !user.isActive)) {
    if (!session.revokedAt) {
      await db.adminSession.update({ where: { id: session.id }, data: { revokedAt: now, revocationReason: expired ? "expired" : "user-disabled" } });
    }
    return null;
  }

  const legacyEmail = session.token?.includes("|") ? session.token.split("|")[1] : undefined;
  const email = user?.email ?? legacyEmail;
  await db.adminSession.update({
    where: { id: session.id },
    data: { idleExpiresAt: new Date(Date.now() + IDLE_TTL_MS) },
  });

  return { id: session.id, userId: session.userId, email, expiresAt: session.expiresAt, idleExpiresAt: session.idleExpiresAt };
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (raw) {
    const db = getDb();
    const current = await db.adminSession.findUnique({ where: { tokenHash: hashSessionToken(raw) } }) ?? await findLegacySession(raw);
    if (current && !current.revokedAt) {
      await db.adminSession.update({ where: { id: current.id }, data: { revokedAt: new Date(), revocationReason: "logout" } });
    }
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function revokeAllUserSessions(userId: string, reason: string): Promise<void> {
  await getDb().adminSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revocationReason: reason },
  });
}

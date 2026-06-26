import { NextRequest, NextResponse } from "next/server";
import { isAllowedEmail, verifyPassword, createAdminSession, setAdminSessionCookie } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email    = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (!isAllowedEmail(email)) {
      return NextResponse.json({ error: "This email is not authorised to access the admin dashboard." }, { status: 403 });
    }

    const db   = getDb();
    const user = await db.adminUser.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      // Account exists in allow-list but password not yet set
      return NextResponse.json({ error: "No password set yet. Please set your password first.", code: "NO_PASSWORD" }, { status: 401 });
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = await createAdminSession(email);
    await setAdminSessionCookie(token);

    logger.info("Admin login successful", { email });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Admin login failed", error as Error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

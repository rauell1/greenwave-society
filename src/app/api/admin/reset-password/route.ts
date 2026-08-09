import { NextRequest, NextResponse } from "next/server";
import { hashPassword, revokeAllUserSessions } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body     = await request.json().catch(() => null);
    const token    = body?.token;
    const password = body?.password;
    const confirm  = body?.confirm;

    if (!token || !password || !confirm) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (password !== confirm) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const db   = getDb();
    const user = await db.adminUser.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    await db.adminUser.update({
      where: { id: user.id },
      data:  { passwordHash: hashPassword(password), resetToken: null, resetTokenExpiry: null, updatedAt: new Date() },
    });
    await revokeAllUserSessions(user.id, "password-reset");

    logger.info("Admin password reset successful", { email: user.email });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Reset password failed", error as Error);
    return NextResponse.json({ error: "Reset failed." }, { status: 500 });
  }
}

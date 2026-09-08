import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body     = await request.json().catch(() => null);
    const token    = body?.token;
    const password = body?.password;
    const confirm  = body?.confirm;

    if (typeof token !== "string" || !token || typeof password !== "string" || !password || typeof confirm !== "string" || !confirm) {
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

    if (!user || !user.isActive || user.deletedAt || !user.resetTokenExpiry || user.resetTokenExpiry <= new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const changed = await db.$transaction(async tx => {
      // Consume the token once, and recheck access in the same transaction.
      const result = await tx.adminUser.updateMany({
        where: { id: user.id, isActive: true, deletedAt: null, resetToken: token, resetTokenExpiry: { gt: new Date() } },
        data: { passwordHash, resetToken: null, resetTokenExpiry: null },
      });
      if (!result.count) return false;
      await tx.adminSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date(), revocationReason: "password-reset" } });
      return true;
    });
    if (!changed) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });

    logger.info("Admin password reset successful", { email: user.email });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Reset password failed", error as Error);
    return NextResponse.json({ error: "Reset failed." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateResetToken } from "@/lib/admin-auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/email-template";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

    const db = getDb();
    const user = await db.adminUser.findUnique({ where: { email } });
    // Do not create accounts or disclose unknown, disabled, or deleted addresses.
    if (!user || !user.isActive || user.deletedAt) return NextResponse.json({ success: true });

    const { token, expiry } = generateResetToken();
    const updated = await db.adminUser.updateMany({
      where: { id: user.id, isActive: true, deletedAt: null },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
    if (!updated.count) return NextResponse.json({ success: true });

    const resetUrl = `${SITE_URL}/admin/reset-password/${token}`;

    const emailSent = await sendPasswordResetEmail(email, resetUrl);

    logger.info("Password reset requested", { email, emailSent });

    if (!emailSent) {
      await db.adminUser.updateMany({
        where: { email, resetToken: token },
        data: { resetToken: null, resetTokenExpiry: null },
      });
      return NextResponse.json({ error: "Unable to send a reset email. Please try again later." }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Forgot password failed", error as Error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

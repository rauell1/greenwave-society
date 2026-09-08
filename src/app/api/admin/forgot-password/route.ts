import { NextRequest, NextResponse } from "next/server";
import { isAllowedEmail, generateResetToken } from "@/lib/admin-auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/email-template";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

    // Always return success to avoid revealing which emails are registered
    if (!isAllowedEmail(email)) return NextResponse.json({ success: true });

    const db = getDb();
    await db.adminUser.upsert({
      where:  { email },
      update: {},
      create: { email },
    });

    const { token, expiry } = generateResetToken();
    await db.adminUser.update({
      where: { email },
      data:  { resetToken: token, resetTokenExpiry: expiry },
    });

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

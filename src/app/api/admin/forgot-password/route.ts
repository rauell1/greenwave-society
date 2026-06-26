import { NextRequest, NextResponse } from "next/server";
import { isAllowedEmail, generateResetToken } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();

    if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });
    if (!isAllowedEmail(email)) {
      // Don't reveal whether the email exists — always return success
      return NextResponse.json({ success: true });
    }

    const db = getDb();
    await db.adminUser.upsert({
      where:  { email },
      update: {},
      create: { email },
    });

    const { token, expiry } = generateResetToken();
    await db.adminUser.update({
      where:  { email },
      data:   { resetToken: token, resetTokenExpiry: expiry },
    });

    const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "https://greenwave.rauell.systems";
    const resetUrl = `${appUrl}/admin/reset-password/${token}`;

    // Send via email if SMTP is configured
    if (process.env.SMTP_HOST) {
      try {
        const nodemailer = await import("nodemailer");
        const transport  = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        });
        await transport.sendMail({
          from:    `"Greenwave Society" <${process.env.FROM_EMAIL ?? "info@greenwavesociety.org"}>`,
          to:      email,
          subject: "Greenwave Society — Admin Password Reset",
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
            <div style="background:#1A5C38;padding:24px;text-align:center">
              <img src="${appUrl}/logo.png" height="52" style="margin-bottom:8px;display:block;margin-left:auto;margin-right:auto"/>
              <p style="color:#fff;font-weight:bold;margin:0">GREENWAVE SOCIETY</p>
            </div>
            <div style="padding:32px">
              <p>A password reset was requested for your admin account (<strong>${email}</strong>).</p>
              <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
              <div style="text-align:center;margin:28px 0">
                <a href="${resetUrl}" style="background:#1A5C38;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;display:inline-block">Reset My Password</a>
              </div>
              <p style="font-size:13px;color:#666">If you did not request this, you can safely ignore this email.</p>
            </div>
          </div>`,
        });
      } catch (err) {
        logger.error("Reset email send failed", err as Error, { email });
      }
    } else {
      // No SMTP — log reset URL for manual sharing
      logger.info("Password reset link generated (no SMTP)", { email, resetUrl });
    }

    return NextResponse.json({ success: true, resetUrl: process.env.SMTP_HOST ? undefined : resetUrl });
  } catch (error) {
    logger.error("Forgot password failed", error as Error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

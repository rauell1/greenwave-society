/**
 * Newsletter subscription endpoint.
 * Handles newsletter subscriptions with validation, sanitization,
 * and super-admin notification via Resend.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Resend } from "resend";
import { brandedEmail, emailButton, escapeHtml, FROM_EMAIL, SITE_URL } from "@/lib/email-template";

const SUPER_ADMIN = "royokola3@gmail.com";

function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

export async function POST(request: NextRequest) {
  const requestLogger = logger.child({ endpoint: "/api/newsletter" });

  try {
    const body  = await request.json().catch(() => null);
    const email = (body?.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Please provide a valid email address." }, { status: 400 });
    }

    const db       = getDb();
    const existing = await db.newsletterSubscriber.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ success: true, message: "You are already subscribed to our newsletter!" });
    }

    await db.newsletterSubscriber.create({ data: { id: crypto.randomUUID(), email } });

    requestLogger.info("Newsletter subscriber added", { email });

    // Notify super admin
    const resend = getResend();
    if (resend) {
      resend.emails.send({
        from:    FROM_EMAIL,
        to:      SUPER_ADMIN,
        subject: "New Newsletter Subscriber — Greenwave Society",
        html: brandedEmail({ eyebrow: "Newsletter", title: "New newsletter subscriber", body: `
            <p style="margin:0 0 12px">A new subscriber has joined the newsletter:</p>
            <div style="background:#EFF9E9;border:1px solid #CFE6C2;border-radius:10px;padding:16px;margin:0 0 20px">
              <p style="margin:0;font-size:16px;font-weight:bold;color:#1A5C38">${escapeHtml(email)}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#555">Subscribed at ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT</p>
            </div>
            ${emailButton("View Dashboard", `${SITE_URL}/admin/dashboard`)}` }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Welcome! You have been subscribed to our newsletter." });
  } catch (error) {
    requestLogger.error("Newsletter subscription failed", error as Error);
    return NextResponse.json({ success: false, message: "Subscription failed. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { brandedEmail, CONTACT_EMAIL, escapeHtml, FROM_EMAIL } from "@/lib/email-template";
import { consumeRateLimit, getClientIdentifier, rateLimitUnavailable } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const clientIp = getClientIdentifier(req);
  try {
    const rateCheck = await consumeRateLimit(`privacy-erasure:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  } catch (err) {
    logger.error("Rate limit check failed in privacy erasure", err as Error);
    return rateLimitUnavailable();
  }

  const body = await req.json().catch(() => ({}));
  const { email } = body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = getDb();

  try {
    // Check for member registration, newsletter subscription, and contact inquiries
    const [memberReg, subscriber, contacts] = await Promise.all([
      db.memberRegistration.findFirst({ where: { email: cleanEmail } }),
      db.newsletterSubscriber.findUnique({ where: { email: cleanEmail } }),
      db.contactSubmission.findMany({ where: { email: cleanEmail } }),
    ]);

    const transactions = [];

    // Public erasure tool is permitted to delete unauthenticated records (newsletter, contacts).
    // Member profiles require authenticated self-deletion via their secure member portal link
    // (/api/member/[token]) to prevent malicious unauthenticated account takeover/destruction.
    if (subscriber) {
      transactions.push(db.newsletterSubscriber.delete({ where: { id: subscriber.id } }));
    }
    if (contacts.length > 0) {
      transactions.push(db.contactSubmission.deleteMany({ where: { email: cleanEmail } }));
    }

    if (transactions.length > 0) {
      await db.$transaction(transactions);

      await db.auditLog.create({
        data: {
          id: randomBytes(12).toString("hex"),
          action: "PUBLIC_DATA_ERASURE_FULFILLED",
          actor: "privacy:public_erasure_form",
          detail: `Public data erasure executed for unauthenticated inquiries/newsletter. Purged ${transactions.length} record set(s).`,
        },
      });
    }

    // Send notification email to the address owner
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      let emailBody = `<p style="margin:0 0 16px">Hello,</p><p style="margin:0 0 16px">A privacy erasure request for <strong>${escapeHtml(cleanEmail)}</strong> has been processed.</p>`;

      if (subscriber || contacts.length > 0) {
        emailBody += `<p style="margin:0 0 16px">All newsletter subscriptions and contact form submissions associated with this address have been permanently deleted from our active records.</p>`;
      }

      if (memberReg) {
        emailBody += `<p style="margin:0 0 16px;background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:12px;color:#92400E"><strong>Note on Member Registration:</strong> An active Greenwave Society membership profile exists for this email address. To protect your membership from unauthorized deletion, member profiles must be managed directly from your Member Portal or by contacting our data protection officer at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`;
      }

      emailBody += `<p style="margin:0">Warm regards,<br><strong>Greenwave Society Data Protection Team</strong></p>`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: cleanEmail,
        subject: "Data Privacy Request - Greenwave Society",
        html: brandedEmail({
          eyebrow: "Privacy & Compliance",
          title: "Privacy Request Processed",
          body: emailBody,
        }),
      }).catch((err) => {
        logger.error("Failed to send privacy erasure notification email", err as Error);
      });
    }

    // Always return a uniform response to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "Your request has been received. If active records associated with this email address exist, they have been processed in accordance with our privacy policy.",
    });
  } catch (error) {
    logger.error("Privacy erasure request failed", error as Error);
    return NextResponse.json(
      { error: "Unable to process privacy request at this time." },
      { status: 500 }
    );
  }
}

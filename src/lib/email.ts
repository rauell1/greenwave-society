import { Resend } from "resend";
import { logger } from "./logger";
import { brandedEmail, CONTACT_EMAIL, emailButton, escapeHtml, FROM_EMAIL, SITE_URL } from "./email-template";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[email] RESEND_API_KEY is not set — emails will not be sent");
    return null;
  }
  console.log("[email] RESEND_API_KEY present, length:", key.length);
  return new Resend(key);
}

export interface SigningEmailOptions {
  to: string;
  name: string;
  role: string;
  token: string;
}

export async function sendSigningEmail(opts: SigningEmailOptions): Promise<boolean> {
  const signingUrl = `${SITE_URL}/sign/${opts.token}`;
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set — signing link generated", { name: opts.name, signingUrl });
    return true;
  }

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      opts.to,
      subject: "Action Required: Sign the Greenwave Society Executive Constitution",
      html: brandedEmail({
        eyebrow: "Executive Leadership",
        title: "Constitution signature required",
        preheader: `Review and sign the Greenwave Society constitution, ${opts.name}.`,
        body: `<p style="margin:0 0 16px">Dear ${escapeHtml(opts.name)},</p><p style="margin:0 0 16px">As <strong>${escapeHtml(opts.role)}</strong>, please review and sign the Executive Leadership Constitution.</p>${emailButton("Review & Sign Constitution", signingUrl)}<p style="margin:0;color:#607068;font-size:13px">This private link is unique to you. Please do not share it. Questions? <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.</p>`,
      }),
    });
    logger.info("Signing email sent via Resend", { name: opts.name, to: opts.to });
    return true;
  } catch (error) {
    logger.error("Failed to send signing email", error as Error, { to: opts.to });
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set — reset link generated", { to, resetUrl });
    return false;
  }

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to,
      subject: "Greenwave Society — Admin Password Reset",
      html: brandedEmail({
        eyebrow: "Account Security",
        title: "Reset your admin password",
        body: `<p style="margin:0 0 16px">A password reset was requested for <strong>${escapeHtml(to)}</strong>.</p><p style="margin:0 0 16px">Use the secure link below within <strong>1 hour</strong>.</p>${emailButton("Reset My Password", resetUrl)}<p style="margin:0;color:#607068;font-size:13px">If you did not request this reset, you can safely ignore this email.</p>`,
      }),
    });
    logger.info("Password reset email sent via Resend", { to });
    return true;
  } catch (error) {
    logger.error("Failed to send reset email", error as Error, { to });
    return false;
  }
}

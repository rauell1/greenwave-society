import { Resend } from "resend";
import { logger } from "./logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://greenwave.rauell.systems";
const FROM    = "Greenwave Society <info@rauell.systems>";

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
  const signingUrl = `${APP_URL}/sign/${opts.token}`;
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set — signing link generated", { name: opts.name, signingUrl });
    return true;
  }

  try {
    await resend.emails.send({
      from:    FROM,
      to:      opts.to,
      subject: "Action Required: Sign the Greenwave Society Executive Constitution",
      html: `
        <div style="font-family:'Times New Roman',serif;max-width:600px;margin:0 auto;color:#111">
          <div style="background:#1A5C38;padding:24px;text-align:center">
            <img src="${APP_URL}/logo.png" alt="Greenwave Society" height="60" style="display:block;margin:0 auto 12px;border-radius:10px"/>
            <p style="color:#fff;margin:0;font-size:18px;font-weight:bold">GREENWAVE SOCIETY</p>
          </div>
          <div style="padding:32px">
            <p>Dear ${opts.name},</p>
            <p>As ${opts.role} of the Greenwave Society, you are required to review and sign the Executive Leadership Constitution.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="${signingUrl}" style="background:#1A5C38;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;display:inline-block">Review &amp; Sign Constitution</a>
            </div>
            <p style="font-size:13px;color:#555">This link is unique to you. Do not share it. Questions? <a href="mailto:info@greenwavesociety.org">info@greenwavesociety.org</a></p>
          </div>
          <div style="background:#f4f4f4;padding:16px;text-align:center;font-size:12px;color:#777">
            Greenwave Society &bull; Nairobi, Kenya &bull; greenwave.rauell.systems
          </div>
        </div>`,
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
      from:    FROM,
      to,
      subject: "Greenwave Society — Admin Password Reset",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#1A5C38;padding:24px;text-align:center">
            <img src="${APP_URL}/logo.png" height="52" style="display:block;margin:0 auto 8px;border-radius:10px"/>
            <p style="color:#fff;font-weight:bold;margin:0">GREENWAVE SOCIETY</p>
          </div>
          <div style="padding:32px">
            <p>A password reset was requested for your admin account (<strong>${to}</strong>).</p>
            <p>Click below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <div style="text-align:center;margin:28px 0">
              <a href="${resetUrl}" style="background:#1A5C38;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;display:inline-block">Reset My Password</a>
            </div>
            <p style="font-size:13px;color:#666">If you did not request this, you can safely ignore this email.</p>
          </div>
        </div>`,
    });
    logger.info("Password reset email sent via Resend", { to });
    return true;
  } catch (error) {
    logger.error("Failed to send reset email", error as Error, { to });
    return false;
  }
}


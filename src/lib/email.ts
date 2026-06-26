import { logger } from "./logger";

export interface SigningEmailOptions {
  to: string;
  name: string;
  role: string;
  token: string;
}

export async function sendSigningEmail(opts: SigningEmailOptions): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://greenwave.rauell.systems";
  const signingUrl = `${appUrl}/sign/${opts.token}`;

  // If SMTP is not configured, log the link so admin can share it manually
  if (!process.env.SMTP_HOST) {
    logger.info("SMTP not configured — signing link generated", {
      name: opts.name,
      role: opts.role,
      signingUrl,
    });
    return true;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const fromEmail = process.env.FROM_EMAIL ?? "info@greenwavesociety.org";

    await transporter.sendMail({
      from: `"Greenwave Society" <${fromEmail}>`,
      to: opts.to,
      subject: "Action Required: Sign the Greenwave Society Executive Constitution",
      html: `
        <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #1A5C38; padding: 24px; text-align: center;">
            <img src="${appUrl}/logo.png" alt="Greenwave Society" height="60" style="margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />
            <p style="color: #fff; margin: 0; font-size: 18px; font-weight: bold;">GREENWAVE SOCIETY</p>
          </div>
          <div style="padding: 32px;">
            <p>Dear ${opts.name},</p>
            <p>As ${opts.role} of the Greenwave Society, you are required to review and sign the Executive Leadership Constitution — the governing covenant that formalises our collective commitment to the mission, values, and accountability standards of the Organization.</p>
            <p>Please click the link below to review and sign the Constitution:</p>
            <div style="text-align:center; margin: 32px 0;">
              <a href="${signingUrl}" style="background:#1A5C38;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;display:inline-block;">Review &amp; Sign Constitution</a>
            </div>
            <p style="font-size:13px;color:#555;">This link is unique to you. Please do not share it. If you did not expect this email, contact <a href="mailto:info@greenwavesociety.org">info@greenwavesociety.org</a>.</p>
          </div>
          <div style="background:#f4f4f4;padding:16px;text-align:center;font-size:12px;color:#777;">
            Greenwave Society &bull; Nairobi, Kenya &bull; greenwave.rauell.systems
          </div>
        </div>
      `,
    });

    logger.info("Signing email sent", { name: opts.name, to: opts.to });
    return true;
  } catch (error) {
    logger.error("Failed to send signing email", error as Error, { to: opts.to });
    return false;
  }
}

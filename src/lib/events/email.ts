import { Resend } from "resend";
import { logger } from "../logger";
import { brandedEmail, CONTACT_EMAIL, emailButton, escapeHtml, FROM_EMAIL, SITE_URL } from "../email-template";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[email] RESEND_API_KEY is not set — emails will not be sent");
    return null;
  }
  return new Resend(key);
}

export interface EventRegistrationEmailOptions {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
}

export async function sendEventRegistrationConfirmation(opts: EventRegistrationEmailOptions): Promise<boolean> {
  const resend = getResend();
  const eventUrl = `${SITE_URL}`; // Default back to site, or a specific event URL if you have one.

  if (!resend) {
    logger.info("RESEND_API_KEY not set — event registration confirmation simulated", { name: opts.name, to: opts.to });
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Registration Confirmed: ${opts.eventTitle}`,
      html: brandedEmail({
        eyebrow: "Greenwave Events",
        title: "Registration Confirmed",
        preheader: `You are registered for ${opts.eventTitle}.`,
        body: `<p style="margin:0 0 16px">Dear ${escapeHtml(opts.name)},</p><p style="margin:0 0 16px">Thank you for registering for <strong>${escapeHtml(opts.eventTitle)}</strong>.</p><p style="margin:0 0 16px">The session will take place on <strong>${escapeHtml(opts.eventDate)}</strong>. We'll send you a reminder 3-4 days before the event.</p>${emailButton("View Greenwave Society", eventUrl)}<p style="margin:0;color:#607068;font-size:13px">Questions? Contact us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.</p>`,
      }),
    });
    logger.info("Event registration email sent", { name: opts.name, to: opts.to });
    return true;
  } catch (error) {
    logger.error("Failed to send event registration email", error as Error, { to: opts.to });
    return false;
  }
}

export async function sendEventReminderEmail(opts: EventRegistrationEmailOptions): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set — event reminder simulated", { name: opts.name, to: opts.to });
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Reminder: ${opts.eventTitle} is coming up!`,
      html: brandedEmail({
        eyebrow: "Greenwave Events",
        title: "Event Reminder",
        preheader: `${opts.eventTitle} is happening soon.`,
        body: `<p style="margin:0 0 16px">Dear ${escapeHtml(opts.name)},</p><p style="margin:0 0 16px">This is a quick reminder that <strong>${escapeHtml(opts.eventTitle)}</strong> is coming up on <strong>${escapeHtml(opts.eventDate)}</strong>.</p><p style="margin:0 0 16px">We look forward to seeing you there!</p><p style="margin:0;color:#607068;font-size:13px">Questions? Contact us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.</p>`,
      }),
    });
    logger.info("Event reminder email sent", { name: opts.name, to: opts.to });
    return true;
  } catch (error) {
    logger.error("Failed to send event reminder email", error as Error, { to: opts.to });
    return false;
  }
}

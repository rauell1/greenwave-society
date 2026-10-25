import { Resend } from "resend";
import { logger } from "../logger";
import { brandedEmail, CONTACT_EMAIL, emailButton, escapeHtml, FROM_EMAIL, SITE_URL } from "../email-template";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[email] RESEND_API_KEY is not set - emails will not be sent");
    return null;
  }
  return new Resend(key);
}

export interface EventRegistrationEmailOptions {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  location?: string;
  isMentalHealthEvent?: boolean;
}

export interface GraduationGuestEmailOptions {
  to: string;
  name: string;
  role: string;
  guestCount: number;
  ticketNumber: string;
  checkInUrl: string;
  eventDate: string;
  location: string;
}

export async function sendEventRegistrationConfirmation(opts: EventRegistrationEmailOptions): Promise<boolean> {
  const resend = getResend();
  const eventUrl = `${SITE_URL}`;

  if (!resend) {
    logger.info("RESEND_API_KEY not set - event registration confirmation simulated", { name: opts.name, to: opts.to });
    return true;
  }

  // Custom messaging for mental health circles
  const customMessage = opts.isMentalHealthEvent
    ? `<p style="margin:0 0 16px; font-size: 15px; color: #173126;">We are so grateful that you're joining us. This circle is designed to be a safe, non-judgmental space where we can connect, listen, and support one another.</p>`
    : "";

  const locationText = opts.location 
    ? `<p style="margin:0 0 16px"><strong>Location:</strong> ${escapeHtml(opts.location)}</p>` 
    : "";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Registration Confirmed: ${opts.eventTitle}`,
      html: brandedEmail({
        eyebrow: "Greenwave Events",
        title: "Registration Confirmed",
        preheader: `You are registered for ${opts.eventTitle}.`,
        body: `<p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">Thank you for registering for <strong>${escapeHtml(opts.eventTitle)}</strong>.</p>
               ${customMessage}
               <div style="margin:24px 0;padding:16px;background:#EFF9E9;border-radius:8px;border-left:4px solid #5FAF2D;">
                 <p style="margin:0 0 8px"><strong>Date & Time:</strong> ${escapeHtml(opts.eventDate)}</p>
                 ${locationText}
                 <p style="margin:0">We will send you a reminder with any final details 3-4 days before the event.</p>
               </div>
               ${emailButton("Visit Greenwave Society", eventUrl)}
               <p style="margin:24px 0 0;color:#607068;font-size:13px">If you have any questions or accessibility needs you forgot to mention, just reply to this email or contact us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.</p>`,
      }),
    });
    logger.info("Event registration email sent", { name: opts.name, to: opts.to });
    return true;
  } catch (error) {
    logger.error("Failed to send event registration email", error as Error, { to: opts.to });
    return false;
  }
}

export async function sendGraduationGuestConfirmation(opts: GraduationGuestEmailOptions): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set - graduation guest confirmation simulated", { name: opts.name, to: opts.to });
    return true;
  }

  const roleLabels: Record<string, string> = {
    graduand: "Graduating Member (Cohort I)",
    family_friend: "Family & Supporter",
    partner_collaborator: "Partner & Collaborator",
    community_guest: "Community Guest",
  };

  const roleText = roleLabels[opts.role] || opts.role;
  const guestText = opts.guestCount > 1 
    ? `${opts.guestCount} attendees (You + ${opts.guestCount - 1} guest${opts.guestCount > 2 ? "s" : ""})` 
    : "1 attendee";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Your Entry Ticket: Empower 360 Cohort I Graduation`,
      html: brandedEmail({
        eyebrow: "Empower 360 Graduation Pass",
        title: "Your Event Pass is Ready!",
        preheader: `Pass confirmed for ${opts.name} - Empower 360 Cohort I Graduation at Ubunifu Hub.`,
        body: `<p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">Your RSVP for the <strong>Empower 360 Ad Hoc Cohort I Graduation & Community Market</strong> has been confirmed.</p>
               
               <div style="margin:24px 0;padding:20px;background:#EFF9E9;border-radius:12px;border:1px solid #DDF0D6;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#173126;">
                   <tr><td style="padding:6px 0;font-weight:bold;width:120px;">Ticket No:</td><td><code>${escapeHtml(opts.ticketNumber)}</code></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Attendee Role:</td><td>${escapeHtml(roleText)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Headcount:</td><td>${escapeHtml(guestText)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Date & Time:</td><td>${escapeHtml(opts.eventDate)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Venue:</td><td>${escapeHtml(opts.location)}</td></tr>
                 </table>
                 <div style="margin-top:16px;padding-top:14px;border-top:1px dashed #A3D896;font-size:13px;color:#355B46;">
                   <strong>Check-in at the door:</strong> Present your digital pass on your phone upon arrival. Our team will scan your QR code for rapid badge verification.
                 </div>
               </div>

               ${emailButton("View Your Digital Ticket & QR Code", opts.checkInUrl)}

               <p style="margin:20px 0 0;color:#607068;font-size:13px;text-align:center;">
                 Need assistance? Reach out to us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a> or WhatsApp +254 794 287 400.
               </p>`,
      }),
    });
    logger.info("Graduation guest confirmation email sent", { name: opts.name, to: opts.to });
    return true;
  } catch (error) {
    logger.error("Failed to send graduation guest confirmation email", error as Error, { to: opts.to });
    return false;
  }
}

export async function sendEventReminderEmail(opts: EventRegistrationEmailOptions): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set - event reminder simulated", { name: opts.name, to: opts.to });
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

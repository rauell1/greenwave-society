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
  passUrl?: string;
  eventDate: string;
  location: string;
}

export interface GraduationVendorEmailOptions {
  to: string;
  name: string;
  vendorName: string;
  category: string;
  ticketNumber: string;
  checkInUrl: string;
  passUrl?: string;
  eventDate: string;
  location: string;
}

export interface OneDayReminderOptions {
  to: string;
  name: string;
  role: string;
  ticketNumber: string;
  checkInUrl: string;
  passUrl?: string;
  isVendor?: boolean;
  vendorName?: string;
  category?: string;
  vendorCategory?: string;
  guestCount?: number;
  eventDate?: string;
  location?: string;
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
    graduand: "Empower 360 Graduand (Cohort I)",
    family_friend: "Family & Supporter",
    partner_collaborator: "Partner & Collaborator",
    community_guest: "Community Guest",
  };

  const roleText = roleLabels[opts.role] || opts.role;
  const guestText = opts.guestCount > 1 
    ? `${opts.guestCount} attendees (You + ${opts.guestCount - 1} guest${opts.guestCount > 2 ? "s" : ""})` 
    : "1 attendee";

  const passUrl = opts.passUrl || `${SITE_URL}/events/pass?id=${encodeURIComponent(opts.ticketNumber)}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(opts.checkInUrl)}&color=064e3b&bgcolor=ffffff&margin=1`;

  const graduandInstructions = opts.role === "graduand"
    ? `<div style="margin-top:12px;padding:12px;background:#FEF9C3;border-radius:8px;border:1px solid #FDE047;color:#854D0E;font-size:13px;">
         <strong>Graduand Protocol:</strong> Please arrive promptly by 10:00 AM for cohort induction pack collection. Front-row seating is reserved for you.
       </div>`
    : "";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Your Digital Pass: Empower 360 Cohort I Graduation (${opts.ticketNumber})`,
      html: brandedEmail({
        eyebrow: "Empower 360 Graduation Entry Pass",
        title: "Your Event Pass is Ready!",
        preheader: `Digital pass confirmed for ${opts.name} - Empower 360 Cohort I Graduation at Ubunifu Hub.`,
        body: `<p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">Your RSVP for the <strong>Empower 360 Ad Hoc Cohort I Graduation & Community Market</strong> has been confirmed.</p>
               
               <div style="text-align:center;margin:24px 0 16px;">
                 <div style="display:inline-block;padding:12px;background:#ffffff;border:2px solid #5FAF2D;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                   <img src="${qrImageSrc}" alt="Entry QR Code" width="200" height="200" style="display:block;border-radius:8px;" />
                 </div>
                 <div style="margin-top:8px;font-family:monospace;font-size:13px;font-weight:bold;color:#1A5C38;">
                   Ticket: ${escapeHtml(opts.ticketNumber)}
                 </div>
               </div>

               <div style="margin:20px 0;padding:20px;background:#EFF9E9;border-radius:12px;border:1px solid #DDF0D6;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#173126;">
                   <tr><td style="padding:6px 0;font-weight:bold;width:120px;">Attendee Role:</td><td>${escapeHtml(roleText)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Headcount:</td><td>${escapeHtml(guestText)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Date:</td><td>${escapeHtml(opts.eventDate)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Venue:</td><td>${escapeHtml(opts.location)}</td></tr>
                 </table>
                 ${graduandInstructions}
                 <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #A3D896;font-size:13px;color:#355B46;">
                   <strong>At the door:</strong> Show this QR code on your phone to the Greenwave Society Executive Team at Ubunifu Hub entrance for fast check-in.
                 </div>
               </div>

               ${emailButton("Open Your Mobile Ticket Pass", passUrl)}

               <p style="margin:20px 0 0;color:#607068;font-size:13px;text-align:center;">
                 Need assistance? Reply directly to this email or reach us on WhatsApp at +254 794 287 400.
               </p>`,
      }),
    });
    logger.info("Graduation guest confirmation email sent with QR code", { name: opts.name, to: opts.to, ticketNumber: opts.ticketNumber });
    return true;
  } catch (error) {
    logger.error("Failed to send graduation guest confirmation email", error as Error, { to: opts.to });
    return false;
  }
}

export async function sendGraduationVendorConfirmation(opts: GraduationVendorEmailOptions): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set - graduation vendor confirmation simulated", { name: opts.name, to: opts.to });
    return true;
  }

  const passUrl = opts.passUrl || `${SITE_URL}/events/pass?id=${encodeURIComponent(opts.ticketNumber)}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(opts.checkInUrl)}&color=4c1d95&bgcolor=ffffff&margin=1`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Vendor Stall Pass: Empower 360 Community Market (${opts.ticketNumber})`,
      html: brandedEmail({
        eyebrow: "Community Market Vendor Stall Pass",
        title: "Vendor Stall Pass Confirmed!",
        preheader: `Vendor pass for ${opts.vendorName} - Empower 360 Community Market at Ubunifu Hub.`,
        body: `<p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">Your vendor registration for <strong>${escapeHtml(opts.vendorName)}</strong> at the <strong>Empower 360 Community Market</strong> on Friday, 30th October 2026 has been received.</p>
               
               <div style="text-align:center;margin:24px 0 16px;">
                 <div style="display:inline-block;padding:12px;background:#ffffff;border:2px solid #7C3AED;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                   <img src="${qrImageSrc}" alt="Vendor Stall QR Code" width="200" height="200" style="display:block;border-radius:8px;" />
                 </div>
                 <div style="margin-top:8px;font-family:monospace;font-size:13px;font-weight:bold;color:#5B21B6;">
                   Stall Ticket: ${escapeHtml(opts.ticketNumber)}
                 </div>
               </div>

               <div style="margin:20px 0;padding:20px;background:#F5F3FF;border-radius:12px;border:1px solid #DDD6FE;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#2E1065;">
                   <tr><td style="padding:6px 0;font-weight:bold;width:130px;">Brand Name:</td><td><strong>${escapeHtml(opts.vendorName)}</strong></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Category:</td><td>${escapeHtml(opts.category)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Setup Window:</td><td>9:30 AM to 10:15 AM EAT</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Market Hours:</td><td>10:30 AM to 3:00 PM EAT</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Venue:</td><td>${escapeHtml(opts.location)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Stall Logistics:</td><td>Tables and chairs provided on-site</td></tr>
                 </table>
                 <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #C4B5FD;font-size:13px;color:#5B21B6;">
                   <strong>Sustainability Policy:</strong> Strictly zero single-use plastic carrier bags or cups. Reusable or paper packaging is encouraged.
                 </div>
               </div>

               ${emailButton("Open Your Mobile Stall Pass", passUrl)}

               <p style="margin:20px 0 0;color:#607068;font-size:13px;text-align:center;">
                 Need assistance? Reply directly to this email or reach us on WhatsApp at +254 794 287 400.
               </p>`,
      }),
    });
    logger.info("Graduation vendor confirmation email sent with QR code", { vendorName: opts.vendorName, to: opts.to, ticketNumber: opts.ticketNumber });
    return true;
  } catch (error) {
    logger.error("Failed to send graduation vendor confirmation email", error as Error, { to: opts.to });
    return false;
  }
}

export async function sendOneDayEventReminder(opts: OneDayReminderOptions): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set - 1-day reminder simulated", { name: opts.name, to: opts.to });
    return true;
  }

  const passUrl = opts.passUrl || `${SITE_URL}/events/pass?id=${encodeURIComponent(opts.ticketNumber)}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(opts.checkInUrl)}&color=064e3b&bgcolor=ffffff&margin=1`;
  const locationText = opts.location || "Ubunifu Hub, Nairobi, Kenya";

  let subject = "Tomorrow: Empower 360 Cohort I Graduation & Your Pass";
  let greetingRole = "attendee";
  let highlightInstructions = "";

  if (opts.isVendor) {
    subject = `Tomorrow: Empower 360 Community Market - Setup & Stall Pass (${opts.ticketNumber})`;
    greetingRole = "vendor";
    highlightInstructions = `
      <div style="margin:16px 0;padding:16px;background:#F5F3FF;border-radius:10px;border-left:4px solid #7C3AED;color:#2E1065;font-size:13px;">
        <strong>Vendor Setup Schedule:</strong><br/>
        &bull; <strong>9:30 AM to 10:15 AM:</strong> Arrive at Ubunifu Hub to set up your stall before the market opens.<br/>
        &bull; <strong>10:30 AM:</strong> Market opens to guests and attendees.<br/>
        &bull; <strong>Tables & Chairs:</strong> Provided on-site by Ubunifu Hub.<br/>
        &bull; <strong>Green Policy:</strong> Strictly zero single-use plastics.
      </div>
    `;
  } else if (opts.role === "graduand") {
    subject = `Tomorrow: Your Empower 360 Graduation Day & Induction Pass (${opts.ticketNumber})`;
    greetingRole = "graduand";
    highlightInstructions = `
      <div style="margin:16px 0;padding:16px;background:#FEF9C3;border-radius:10px;border-left:4px solid #CA8A04;color:#854D0E;font-size:13px;">
        <strong>Graduand Schedule:</strong><br/>
        &bull; <strong>10:00 AM:</strong> Arrive at Ubunifu Hub for gown, badge, and certificate folder allocation.<br/>
        &bull; <strong>10:30 AM:</strong> Ceremony commences. Reserved front seating is allocated for you.<br/>
        &bull; <strong>12:00 PM:</strong> Capstone presentation moments.
      </div>
    `;
  } else {
    subject = `Tomorrow: Celebrating Empower 360 Cohort I at Ubunifu Hub (${opts.ticketNumber})`;
    greetingRole = "guest";
    highlightInstructions = `
      <div style="margin:16px 0;padding:16px;background:#EFF9E9;border-radius:10px;border-left:4px solid #5FAF2D;color:#173126;font-size:13px;">
        <strong>Guest & Supporter Schedule:</strong><br/>
        &bull; <strong>10:15 AM to 10:30 AM:</strong> Doors open for guests and supporters.<br/>
        &bull; <strong>10:30 AM:</strong> Ceremony commences, followed by capstone pitches and refreshments.<br/>
        &bull; <strong>Market Corridor:</strong> Curated local sustainable vendors will be on-site with snacks, books, and crafts.
      </div>
    `;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject,
      html: brandedEmail({
        eyebrow: "24-Hour Final Event Reminder",
        title: "See You Tomorrow at Ubunifu Hub!",
        preheader: `Final event reminder and digital pass for ${opts.name} - Empower 360 Cohort I Graduation.`,
        body: `<p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">This is your 24-hour reminder that the <strong>Empower 360 Ad Hoc Cohort I Graduation & Community Market</strong> takes place <strong>tomorrow, Friday, 30th October 2026</strong> at Ubunifu Hub, Nairobi.</p>
               
               ${highlightInstructions}

               <div style="text-align:center;margin:24px 0 16px;">
                 <div style="display:inline-block;padding:12px;background:#ffffff;border:2px solid #5FAF2D;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                   <img src="${qrImageSrc}" alt="Your Event Entry Pass" width="200" height="200" style="display:block;border-radius:8px;" />
                 </div>
                 <div style="margin-top:8px;font-family:monospace;font-size:13px;font-weight:bold;color:#1A5C38;">
                   Ticket: ${escapeHtml(opts.ticketNumber)}
                 </div>
               </div>

               <div style="margin:20px 0;padding:16px;background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;font-size:13px;color:#334155;">
                 <p style="margin:0 0 6px;"><strong>Venue:</strong> ${escapeHtml(locationText)}</p>
                 <p style="margin:0;"><strong>Check-in:</strong> Please have this email open on your phone or save your mobile ticket below so our Executive Team can scan your pass at the entrance.</p>
               </div>

               ${emailButton("Open Your Mobile Pass on Phone", passUrl)}

               <p style="margin:24px 0 0;color:#607068;font-size:13px;text-align:center;">
                 Need immediate directions or assistance on event day? WhatsApp us at +254 794 287 400.
               </p>`,
      }),
    });
    logger.info("1-Day event reminder sent with QR code", { name: opts.name, to: opts.to, role: greetingRole, ticketNumber: opts.ticketNumber });
    return true;
  } catch (error) {
    logger.error("Failed to send 1-day event reminder email", error as Error, { to: opts.to });
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

import { Resend } from "resend";
import QRCode from "qrcode";
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
  /** Public event page; the email button links here instead of the homepage. */
  eventUrl?: string;
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
  const eventUrl = opts.eventUrl || SITE_URL;

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
                 <p style="margin:0">We will email you a reminder 24 hours before the event.</p>
               </div>
               ${emailButton(opts.eventUrl ? "View event details" : "Visit Greenwave Society", eventUrl)}
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
    graduand: "YPG Graduand (Cohort I)",
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

  let attachments: Array<{ filename: string; content: Buffer }> = [];
  try {
    const qrBuffer = await QRCode.toBuffer(opts.checkInUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: "#064e3b",
        light: "#ffffff",
      },
    });
    attachments = [
      {
        filename: `greenwave-digital-pass-${opts.ticketNumber}.png`,
        content: qrBuffer,
      },
    ];
  } catch (qrErr) {
    logger.warn("Could not generate QR buffer for guest pass", { error: qrErr });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Pass Record (Event Concluded): YPG Cohort I Graduation (${opts.ticketNumber})`,
      attachments: attachments.length > 0 ? attachments : undefined,
      html: brandedEmail({
        eyebrow: "Event Concluded • Pass Expired",
        title: "YPG Cohort I Ceremony Concluded",
        preheader: `This ceremony concluded on Friday, 30th October 2026. Passes are expired and invalid for admission.`,
        body: `<div style="margin:0 0 20px;padding:16px;background:#FFF1F2;border-radius:12px;border:1px solid #FECDD3;color:#9F1239;font-size:13px;line-height:1.6;">
                 <strong>Notice: Event Concluded &bull; Passes Permanently Expired</strong><br/>
                 The YPG: Young Person's Guide to Systems Change Cohort I Graduation &amp; Community Market concluded on <strong>Friday, 30th October 2026</strong> at Ubunifu Hub, Nairobi. This digital pass record is preserved for your personal records and certificate verification only. Door scanners at Ubunifu Hub are deactivated.
               </div>

               <p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">Here is your archived attendance record for the <strong>YPG: Young Person's Guide to Systems Change Cohort I Graduation & Community Market</strong>.</p>
               
               <div style="text-align:center;margin:24px 0 16px;">
                 <div style="display:inline-block;padding:12px;background:#f8fafc;border:2px dashed #94a3b8;border-radius:16px;opacity:0.7;">
                   <img src="${qrImageSrc}" alt="Archived Pass QR Code" width="180" height="180" style="display:block;border-radius:8px;filter:grayscale(100%);" />
                 </div>
                 <div style="margin-top:8px;">
                   <span style="font-family:monospace;font-size:12px;font-weight:bold;color:#E11D48;background:#FFE4E6;display:inline-block;padding:3px 8px;border-radius:6px;">
                     CONCLUDED &bull; PASS EXPIRED
                   </span>
                 </div>
                 <div style="margin-top:6px;font-family:monospace;font-size:13px;font-weight:bold;color:#475569;">
                   Pass Number: ${escapeHtml(opts.ticketNumber)}
                 </div>
                 <p style="margin:6px 0 0;font-size:11px;color:#64748b;">This pass is permanently expired and cannot be scanned for door admission.</p>
               </div>

               <div style="margin:20px 0;padding:20px;background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1E293B;">
                   <tr><td style="padding:6px 0;font-weight:bold;width:120px;">Attendee Role:</td><td>${escapeHtml(roleText)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Status:</td><td><strong style="color:#E11D48;">Expired &bull; Event Concluded</strong></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Headcount:</td><td>${escapeHtml(guestText)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Ceremony Date:</td><td>Friday, 30th October 2026 (Concluded)</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Venue:</td><td>${escapeHtml(opts.location)}</td></tr>
                 </table>
                 ${graduandInstructions}
                 <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #FECDD3;font-size:13px;color:#9F1239;">
                   <strong>Door Scanners Deactivated:</strong> Admission passes are invalid for check-in. Explore the official 296-photo album or read the celebration retrospective below.
                 </div>
               </div>

               ${emailButton("Explore 296 Celebration Photos", `${SITE_URL}/events/graduation-cohort-1/album`)}

               <div style="text-align:center;margin-top:14px;font-size:13px;">
                 <a href="${SITE_URL}/events/graduation-cohort-1" style="color:#1A5C38;font-weight:bold;text-decoration:underline;">Read Ceremony Retrospective</a>
                 &nbsp;&bull;&nbsp;
                 <a href="${passUrl}" style="color:#64748b;text-decoration:underline;">View Mobile Pass Record</a>
               </div>

               <p style="margin:24px 0 0;color:#607068;font-size:13px;text-align:center;">
                 Need assistance or have certificate queries? Reach us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a> or on WhatsApp at +254 794 287 400.
               </p>`,
      }),
    });
    logger.info("Graduation guest pass record email sent (event concluded)", { name: opts.name, to: opts.to, ticketNumber: opts.ticketNumber });
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

  let attachments: Array<{ filename: string; content: Buffer }> = [];
  try {
    const qrBuffer = await QRCode.toBuffer(opts.checkInUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: "#4c1d95",
        light: "#ffffff",
      },
    });
    attachments = [
      {
        filename: `greenwave-vendor-pass-${opts.ticketNumber}.png`,
        content: qrBuffer,
      },
    ];
  } catch (qrErr) {
    logger.warn("Could not generate QR buffer for vendor pass", { error: qrErr });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Stall Pass Record (Market Concluded): YPG Community Market (${opts.ticketNumber})`,
      attachments: attachments.length > 0 ? attachments : undefined,
      html: brandedEmail({
        eyebrow: "Market Concluded • Stall Pass Expired",
        title: "Community Market Concluded",
        preheader: `The community market concluded on Friday, 30th October 2026. Stall passes are expired.`,
        body: `<div style="margin:0 0 20px;padding:16px;background:#FFF1F2;border-radius:12px;border:1px solid #FECDD3;color:#9F1239;font-size:13px;line-height:1.6;">
                 <strong>Notice: Community Market Concluded &bull; Stall Passes Expired</strong><br/>
                 The YPG Community Market concluded on <strong>Friday, 30th October 2026</strong> at Ubunifu Hub, Nairobi. This stall pass record is preserved for your vendor accounting and archival reference only.
               </div>

               <p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">Here is your archived vendor stall record for <strong>${escapeHtml(opts.vendorName)}</strong> at the <strong>YPG Community Market</strong>.</p>
               
               <div style="text-align:center;margin:24px 0 16px;">
                 <div style="display:inline-block;padding:12px;background:#f8fafc;border:2px dashed #94a3b8;border-radius:16px;opacity:0.7;">
                   <img src="${qrImageSrc}" alt="Archived Vendor QR Code" width="180" height="180" style="display:block;border-radius:8px;filter:grayscale(100%);" />
                 </div>
                 <div style="margin-top:8px;">
                   <span style="font-family:monospace;font-size:12px;font-weight:bold;color:#E11D48;background:#FFE4E6;display:inline-block;padding:3px 8px;border-radius:6px;">
                     CONCLUDED &bull; PASS EXPIRED
                   </span>
                 </div>
                 <div style="margin-top:6px;font-family:monospace;font-size:13px;font-weight:bold;color:#475569;">
                   Stall Pass: ${escapeHtml(opts.ticketNumber)}
                 </div>
                 <p style="margin:6px 0 0;font-size:11px;color:#64748b;">This stall pass is permanently expired and cannot be scanned for entry.</p>
               </div>

               <div style="margin:20px 0;padding:20px;background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1E293B;">
                   <tr><td style="padding:6px 0;font-weight:bold;width:130px;">Brand Name:</td><td><strong>${escapeHtml(opts.vendorName)}</strong></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Status:</td><td><strong style="color:#E11D48;">Expired &bull; Market Concluded</strong></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Category:</td><td>${escapeHtml(opts.category)}</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Date:</td><td>Friday, 30th October 2026 (Concluded)</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Venue:</td><td>${escapeHtml(opts.location)}</td></tr>
                 </table>
                 <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #FECDD3;font-size:13px;color:#9F1239;">
                   <strong>Market Concluded:</strong> All stall spaces and allocations are now closed. Thank you for your partnership in zero single-use plastics!
                 </div>
               </div>

               ${emailButton("Explore 296 Celebration Photos", `${SITE_URL}/events/graduation-cohort-1/album`)}

               <div style="text-align:center;margin-top:14px;font-size:13px;">
                 <a href="${SITE_URL}/events/graduation-cohort-1" style="color:#1A5C38;font-weight:bold;text-decoration:underline;">Read Ceremony Retrospective</a>
                 &nbsp;&bull;&nbsp;
                 <a href="${passUrl}" style="color:#64748b;text-decoration:underline;">View Mobile Pass Record</a>
               </div>

               <p style="margin:24px 0 0;color:#607068;font-size:13px;text-align:center;">
                 Interested in vending at future Greenwave Society markets? Email us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.
               </p>`,
      }),
    });
    logger.info("Graduation vendor stall record email sent (market concluded)", { vendorName: opts.vendorName, to: opts.to, ticketNumber: opts.ticketNumber });
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

  let subject = "Tomorrow: YPG Cohort I Graduation & Your Pass";
  let greetingRole = "attendee";
  let highlightInstructions = "";

  if (opts.isVendor) {
    subject = `Tomorrow: Community Market - Setup & Stall Pass (${opts.ticketNumber})`;
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
    subject = `Tomorrow: Your YPG Graduation Day & Induction Pass (${opts.ticketNumber})`;
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
    subject = `Tomorrow: Celebrating YPG Cohort I at Ubunifu Hub (${opts.ticketNumber})`;
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

  let attachments: Array<{ filename: string; content: Buffer }> = [];
  try {
    const qrBuffer = await QRCode.toBuffer(opts.checkInUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: opts.isVendor ? "#4c1d95" : "#064e3b",
        light: "#ffffff",
      },
    });
    attachments = [
      {
        filename: `greenwave-digital-pass-${opts.ticketNumber}.png`,
        content: qrBuffer,
      },
    ];
  } catch (qrErr) {
    logger.warn("Could not generate QR buffer for reminder pass", { error: qrErr });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject,
      attachments: attachments.length > 0 ? attachments : undefined,
      html: brandedEmail({
        eyebrow: "24-Hour Final Event Reminder",
        title: "See You Tomorrow at Ubunifu Hub!",
        preheader: `Final event reminder and digital pass for ${opts.name} • YPG Cohort I Graduation.`,
        body: `<p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">This is your final reminder that the <strong>YPG: Young Person's Guide to Systems Change Cohort I Graduation & Community Market</strong> takes place on <strong>Friday, 30th October 2026</strong> at Ubunifu Hub, Garden Estate, Nairobi.</p>
               
               ${highlightInstructions}

               <div style="text-align:center;margin:24px 0 16px;">
                 <div style="display:inline-block;padding:12px;background:#ffffff;border:2px solid #5FAF2D;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                   <img src="${qrImageSrc}" alt="Your Event Entry Pass" width="200" height="200" style="display:block;border-radius:8px;" />
                 </div>
                 <div style="margin-top:8px;font-family:monospace;font-size:13px;font-weight:bold;color:#1A5C38;">
                   Ticket: ${escapeHtml(opts.ticketNumber)}
                 </div>
                 <p style="margin:6px 0 0;font-size:11px;color:#607068;">Digital pass image also attached to this email for offline saving.</p>
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

export interface GraduationCertificateEmailOptions {
  to: string;
  name: string;
  credentialId: string;
  ticketNumber: string;
  certificatePortalUrl: string;
  pod?: string;
  capstoneTitle?: string;
  certBuffer?: Buffer;
}

export async function sendGraduationCertificateEmail(opts: GraduationCertificateEmailOptions): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    logger.info("RESEND_API_KEY not set - graduation certificate email simulated", { name: opts.name, to: opts.to });
    return true;
  }

  const attachments: Array<{ filename: string; content: Buffer }> = [];
  if (opts.certBuffer) {
    attachments.push({
      filename: `greenwave-ypg-certificate-${opts.credentialId}.png`,
      content: opts.certBuffer,
    });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Official Certificate of Completion: YPG Cohort I Fellowship (${opts.name})`,
      attachments: attachments.length > 0 ? attachments : undefined,
      html: brandedEmail({
        eyebrow: "Official Conferment • YPG Cohort I",
        title: "Certificate of Completion",
        preheader: `Congratulations ${opts.name}! Your official completion certificate for YPG Cohort I is ready.`,
        body: `<div style="margin:0 0 20px;padding:16px;background:#EFF9E9;border-radius:12px;border:1px solid #DDF0D6;color:#173126;font-size:14px;line-height:1.6;">
                 <strong>Congratulations, ${escapeHtml(opts.name)}!</strong><br/>
                 In recognition of your dedication, leadership, and successful completion of the <strong>Young Person's Guide to Systems Change (YPG Cohort I) Fellowship</strong>, Greenwave Society and The 50 Percent are proud to confer your official Certificate of Completion.
               </div>

               <p style="margin:0 0 16px; font-size: 16px;">Dear ${escapeHtml(opts.name)},</p>
               <p style="margin:0 0 16px; font-size: 15px;">Your certified graduation pass and high-resolution digital certificate are now officially active. You can view, verify, and download both PNG and PDF formats at any time using your permanent credential link.</p>

               <div style="margin:20px 0;padding:20px;background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;">
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1E293B;">
                   <tr><td style="padding:6px 0;font-weight:bold;width:140px;">Certified Fellow:</td><td><strong>${escapeHtml(opts.name)}</strong></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Credential ID:</td><td><strong style="color:#059669;font-family:monospace;">${escapeHtml(opts.credentialId)}</strong></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Ceremony Pass:</td><td><span style="font-family:monospace;">${escapeHtml(opts.ticketNumber)}</span></td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Program:</td><td>Young Person's Guide to Systems Change</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Conferred Date:</td><td>Friday, 30th October 2026</td></tr>
                   <tr><td style="padding:6px 0;font-weight:bold;">Awarding Bodies:</td><td>Greenwave Society &bull; The 50 Percent</td></tr>
                   ${opts.pod ? `<tr><td style="padding:6px 0;font-weight:bold;">Pod Focus:</td><td>${escapeHtml(opts.pod)}</td></tr>` : ""}
                   ${opts.capstoneTitle ? `<tr><td style="padding:6px 0;font-weight:bold;">Capstone Pitch:</td><td>${escapeHtml(opts.capstoneTitle)}</td></tr>` : ""}
                 </table>
               </div>

               ${emailButton("Access Digital Pass & Download Certificate", opts.certificatePortalUrl)}

               <p style="margin:20px 0 0;font-size:13px;color:#64748b;text-align:center;">
                 Your high-resolution digital certificate is also attached directly to this email for offline saving.
               </p>

               <div style="text-align:center;margin-top:14px;font-size:13px;">
                 <a href="${SITE_URL}/events/graduation-cohort-1/album" style="color:#1A5C38;font-weight:bold;text-decoration:underline;">Explore Ceremony Photo Album</a>
                 &nbsp;&bull;&nbsp;
                 <a href="${SITE_URL}/events/graduation-cohort-1" style="color:#64748b;text-decoration:underline;">Convocation Retrospective</a>
               </div>

               <p style="margin:24px 0 0;color:#607068;font-size:13px;text-align:center;">
                 Welcome to the active Greenwave Society Alumni Network! If you need assistance, reply to this email or WhatsApp us at +254 794 287 400.
               </p>`,
      }),
    });
    logger.info("Graduation certificate email sent", { name: opts.name, to: opts.to, credentialId: opts.credentialId });
    return true;
  } catch (error) {
    logger.error("Failed to send graduation certificate email", error as Error, { to: opts.to });
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
        title: "See you tomorrow",
        preheader: `${opts.eventTitle} is happening soon.`,
        body: `<p style="margin:0 0 16px">Dear ${escapeHtml(opts.name)},</p><p style="margin:0 0 16px">This is a quick reminder that <strong>${escapeHtml(opts.eventTitle)}</strong> is coming up on <strong>${escapeHtml(opts.eventDate)}</strong>.</p>${opts.location ? `<p style="margin:0 0 16px"><strong>Location:</strong> ${escapeHtml(opts.location)}</p>` : ""}<p style="margin:0 0 16px">We look forward to seeing you there!</p>${opts.eventUrl ? emailButton("View event details", opts.eventUrl) : ""}<p style="margin:0;color:#607068;font-size:13px">Questions? Contact us at <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.</p>`,
      }),
    });
    logger.info("Event reminder email sent", { name: opts.name, to: opts.to });
    return true;
  } catch (error) {
    logger.error("Failed to send event reminder email", error as Error, { to: opts.to });
    return false;
  }
}

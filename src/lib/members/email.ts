import "server-only";

import { Resend } from "resend";
import { brandedEmail, CONTACT_EMAIL, emailButton, emailNotice, escapeHtml, FROM_EMAIL, SITE_URL } from "@/lib/email-template";

export async function sendMembershipDecisionEmail(input: { fullName: string; email: string; approved: boolean; memberToken?: string | null; reviewNote?: string | null }) {
  if (!process.env.RESEND_API_KEY) return { sent: false, error: "RESEND_API_KEY not configured" };
  const firstName = escapeHtml(input.fullName.split(" ")[0]);
  const subject = input.approved ? "Your Greenwave Society Membership Application has been Approved" : "Update on Your Greenwave Society Membership Application";
  const html = input.approved
    ? brandedEmail({ eyebrow: "Membership Application", title: "Welcome to Greenwave Society", body: `<p style="margin:0 0 16px">Dear ${firstName},</p><p style="margin:0 0 16px">We are pleased to confirm that your membership application has been <strong style="color:#1A5C38">approved</strong>.</p><p style="margin:0 0 16px">Your member profile is ready below.</p>${input.reviewNote ? emailNotice(escapeHtml(input.reviewNote)) : ""}${emailButton("Access My Member Profile", `${SITE_URL}/member/${input.memberToken}`)}<p style="margin:0 0 22px;color:#607068">Questions? Email <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.</p><p style="margin:0">Yours sincerely,<br><strong>Greenwave Society Team</strong></p>` })
    : brandedEmail({ eyebrow: "Membership Application", title: "An update on your application", body: `<p style="margin:0 0 16px">Dear ${firstName},</p><p style="margin:0 0 16px">Thank you for your interest in Greenwave Society. After careful review, we are unable to approve your application at this time.</p>${input.reviewNote ? emailNotice(escapeHtml(input.reviewNote), "amber") : ""}<p style="margin:0 0 22px">Stay connected with our work at <a href="${SITE_URL}" style="color:#1A5C38">greenwavesociety.org</a>.</p><p style="margin:0">Kind regards,<br><strong>Greenwave Society Team</strong></p>` });
  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM_EMAIL, to: input.email, subject, html });
    return error ? { sent: false, error: error.message } : { sent: true, error: null };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email delivery error" };
  }
}

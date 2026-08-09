import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { brandedEmail, CONTACT_EMAIL, emailButton, emailNotice, escapeHtml, FROM_EMAIL, SITE_URL } from "@/lib/email-template";


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid, email } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id }                     = await params;
  const { action, reviewNote }     = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const db = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { id } });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reg.status !== "pending") {
    return NextResponse.json({ error: "Application already reviewed" }, { status: 409 });
  }

  const memberToken = action === "approve" ? randomBytes(24).toString("hex") : undefined;

  const updated = await db.memberRegistration.update({
    where: { id },
    data: {
      status:      action === "approve" ? "approved" : "rejected",
      reviewNote:  reviewNote?.trim() || null,
      reviewedAt:  new Date(),
      reviewedBy:  email ?? "admin",
      updatedAt:   new Date(),
      ...(memberToken ? { memberToken } : {}),
    },
  });

  await db.auditLog.create({
    data: {
      id:     randomBytes(12).toString("hex"),
      action: action === "approve" ? "REGISTRATION_APPROVED" : "REGISTRATION_REJECTED",
      actor:  email ?? "admin",
      detail: `${action === "approve" ? "Approved" : "Rejected"} application from ${reg.fullName} (${reg.email})`,
    },
  });

  // Send outcome email
  if (process.env.RESEND_API_KEY) {
    const resend     = new Resend(process.env.RESEND_API_KEY);
    const firstName  = escapeHtml(reg.fullName.split(" ")[0]);
    const subject    = action === "approve"
      ? "Your Greenwave Society Membership Application has been Approved"
      : "Update on Your Greenwave Society Membership Application";

    const html = action === "approve"
      ? brandedEmail({ eyebrow: "Membership Application", title: "Welcome to Greenwave Society", body: `<p style="margin:0 0 16px">Dear ${firstName},</p><p style="margin:0 0 16px">We are pleased to confirm that your membership application has been <strong style="color:#1A5C38">approved</strong>.</p><p style="margin:0 0 16px">Welcome to the Greenwave Society community. Your member profile is ready below.</p>${reviewNote ? emailNotice(escapeHtml(reviewNote)) : ""}${emailButton("Access My Member Profile", `${SITE_URL}/member/${memberToken}`)}<p style="margin:0 0 22px;color:#607068">Questions? Email <a href="mailto:${CONTACT_EMAIL}" style="color:#1A5C38">${CONTACT_EMAIL}</a>.</p><p style="margin:0">Yours sincerely,<br><strong>Greenwave Society Team</strong></p>` })
      : brandedEmail({ eyebrow: "Membership Application", title: "An update on your application", body: `<p style="margin:0 0 16px">Dear ${firstName},</p><p style="margin:0 0 16px">Thank you for your interest in Greenwave Society. After careful review, we are unable to approve your application at this time.</p>${reviewNote ? emailNotice(escapeHtml(reviewNote), "amber") : ""}<p style="margin:0 0 22px">Stay connected with our work at <a href="${SITE_URL}" style="color:#1A5C38">greenwavesociety.org</a>, and please consider applying during a future intake.</p><p style="margin:0">Kind regards,<br><strong>Greenwave Society Team</strong></p>` });

    await resend.emails.send({ from: FROM_EMAIL, to: reg.email, subject, html }).catch(() => null);
  }

  return NextResponse.json({ success: true, registration: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid, email } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { id } });
  if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });

  const userEmail = reg.email;
  const userName = reg.fullName;

  // Cascade deletion of member registration & related newsletter/contact data
  await db.$transaction([
    db.memberRegistration.delete({ where: { id } }),
    db.newsletterSubscriber.deleteMany({ where: { email: userEmail } }),
    db.contactSubmission.deleteMany({ where: { email: userEmail } }),
  ]);

  await db.auditLog.create({
    data: {
      id: randomBytes(12).toString("hex"),
      action: "ADMIN_MEMBER_DATA_ERASED",
      actor: email ?? "admin",
      detail: `Permanently deleted member registration & scrubbed data for ${userName} (ID: ${id}) per privacy compliance request`,
    },
  });

  return NextResponse.json({ success: true, message: `Member ${userName} and associated data successfully erased.` });
}

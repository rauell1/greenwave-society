import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://greenwave.rauell.systems";
const FROM    = "Greenwave Society <info@rauell.systems>";

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

  const updated = await db.memberRegistration.update({
    where: { id },
    data: {
      status:     action === "approve" ? "approved" : "rejected",
      reviewNote: reviewNote?.trim() || null,
      reviewedAt: new Date(),
      reviewedBy: email ?? "admin",
      updatedAt:  new Date(),
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
    const firstName  = reg.fullName.split(" ")[0];
    const subject    = action === "approve"
      ? "Your Greenwave Society Membership Application has been Approved"
      : "Update on Your Greenwave Society Membership Application";

    const html = action === "approve"
      ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f0;padding:24px">
  <div style="background:#1A5C38;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:#fff;font-weight:bold;font-size:18px;margin:0">GREENWAVE SOCIETY</p>
    <p style="color:#a8d5b5;font-size:13px;margin:6px 0 0">Membership Application</p>
  </div>
  <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px">
    <p style="font-size:16px;color:#111">Dear ${firstName},</p>
    <p style="font-size:15px;color:#111;line-height:1.8">We are pleased to inform you that your application to join Greenwave Society has been reviewed and <strong style="color:#1A5C38">approved</strong>.</p>
    <p style="font-size:15px;color:#111;line-height:1.8">Welcome to the Greenwave Society family. You will shortly receive a separate email with instructions to set up your account and access your member dashboard.</p>
    ${reviewNote ? `<div style="margin:20px 0;padding:16px;background:#f0faf4;border-radius:8px;border-left:4px solid #1A5C38"><p style="margin:0;font-size:14px;color:#1A5C38;line-height:1.7">${reviewNote}</p></div>` : ""}
    <p style="font-size:14px;color:#555;line-height:1.8">If you have any questions, please contact us at <a href="mailto:info@greenwavesociety.org" style="color:#1A5C38">info@greenwavesociety.org</a>.</p>
    <p style="font-size:14px;color:#111;margin-top:24px">Yours sincerely,<br/><strong>Greenwave Society Team</strong></p>
  </div>
</div>`
      : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f0;padding:24px">
  <div style="background:#1A5C38;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:#fff;font-weight:bold;font-size:18px;margin:0">GREENWAVE SOCIETY</p>
    <p style="color:#a8d5b5;font-size:13px;margin:6px 0 0">Membership Application</p>
  </div>
  <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px">
    <p style="font-size:16px;color:#111">Dear ${firstName},</p>
    <p style="font-size:15px;color:#111;line-height:1.8">Thank you for your interest in joining Greenwave Society. After careful review, we are unable to approve your application at this time.</p>
    ${reviewNote ? `<div style="margin:20px 0;padding:16px;background:#fef9f0;border-radius:8px;border-left:4px solid #d97706"><p style="margin:0;font-size:14px;color:#555;line-height:1.7">${reviewNote}</p></div>` : ""}
    <p style="font-size:15px;color:#111;line-height:1.8">We encourage you to stay connected with our work at <a href="${APP_URL}" style="color:#1A5C38">greenwave.rauell.systems</a> and to consider reapplying in future intake cycles.</p>
    <p style="font-size:14px;color:#111;margin-top:24px">Kind regards,<br/><strong>Greenwave Society Team</strong></p>
  </div>
</div>`;

    await resend.emails.send({ from: FROM, to: reg.email, subject, html }).catch(() => null);
  }

  return NextResponse.json({ success: true, registration: updated });
}

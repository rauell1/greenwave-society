import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";

const FROM = "Greenwave Society <info@rauell.systems>";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = getDb();

  // Find any records matching the email
  const memberReg = await db.memberRegistration.findFirst({ where: { email: cleanEmail } });
  const subscriber = await db.newsletterSubscriber.findUnique({ where: { email: cleanEmail } });
  const contacts = await db.contactSubmission.findMany({ where: { email: cleanEmail } });

  const totalRecords = (memberReg ? 1 : 0) + (subscriber ? 1 : 0) + contacts.length;

  if (totalRecords === 0) {
    return NextResponse.json({
      success: true,
      message: "No personal data associated with this email address was found in active records.",
    });
  }

  // Delete newsletter and contact submissions for non-member requests directly,
  // or if member registration exists, delete all data if confirmed.
  const transactions = [];

  if (memberReg) {
    transactions.push(db.memberRegistration.delete({ where: { id: memberReg.id } }));
  }
  if (subscriber) {
    transactions.push(db.newsletterSubscriber.delete({ where: { id: subscriber.id } }));
  }
  if (contacts.length > 0) {
    transactions.push(db.contactSubmission.deleteMany({ where: { email: cleanEmail } }));
  }

  await db.$transaction(transactions);

  // Anonymized Audit log entry
  await db.auditLog.create({
    data: {
      id: randomBytes(12).toString("hex"),
      action: "PUBLIC_DATA_ERASURE_FULFILLED",
      actor: "privacy:public_erasure_form",
      detail: `Data erasure executed for request. Purged ${totalRecords} matching record(s).`,
    },
  });

  // Send confirmation email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: cleanEmail,
      subject: "Data Erasure Request Fulfilled - Greenwave Society",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f0;padding:24px">
  <div style="background:#1A5C38;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:#fff;font-weight:bold;font-size:18px;margin:0">GREENWAVE SOCIETY</p>
    <p style="color:#a8d5b5;font-size:13px;margin:6px 0 0">Privacy & Compliance Notification</p>
  </div>
  <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px">
    <p style="font-size:16px;color:#111">Hello,</p>
    <p style="font-size:15px;color:#111;line-height:1.8">In response to your data erasure request, all personal data associated with your email address (<strong>${cleanEmail}</strong>) has been permanently deleted from Greenwave Society's systems.</p>
    <p style="font-size:14px;color:#555;line-height:1.8">This includes newsletter subscriptions, contact form submissions, and member profile records if applicable.</p>
    <p style="font-size:14px;color:#111;margin-top:24px">Regards,<br/><strong>Greenwave Society Data Protection Team</strong></p>
  </div>
</div>`,
    }).catch(() => null);
  }

  return NextResponse.json({
    success: true,
    message: `All personal data associated with ${cleanEmail} has been successfully erased.`,
  });
}

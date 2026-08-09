import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { brandedEmail, escapeHtml, FROM_EMAIL } from "@/lib/email-template";


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
      from: FROM_EMAIL,
      to: cleanEmail,
      subject: "Data Erasure Request Fulfilled - Greenwave Society",
      html: brandedEmail({ eyebrow: "Privacy & Compliance", title: "Your data erasure request is complete", body: `<p style="margin:0 0 16px">Hello,</p><p style="margin:0 0 16px">All personal data associated with <strong>${escapeHtml(cleanEmail)}</strong> has been permanently deleted from Greenwave Society's active systems.</p><p style="margin:0 0 22px;color:#607068">This includes newsletter subscriptions, contact submissions, and member profile records where applicable.</p><p style="margin:0">Regards,<br><strong>Greenwave Society Data Protection Team</strong></p>` }),
    }).catch(() => null);
  }

  return NextResponse.json({
    success: true,
    message: `All personal data associated with ${cleanEmail} has been successfully erased.`,
  });
}

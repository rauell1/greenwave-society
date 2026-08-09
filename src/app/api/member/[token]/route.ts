import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { brandedEmail, escapeHtml, FROM_EMAIL } from "@/lib/email-template";


// GET  — called on page load (login ping)
// POST — called every 30s as heartbeat; body { leaving: true } on beforeunload
// DELETE — called when user requests account and data erasure (GDPR compliance)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db  = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { memberToken: token } });
  if (!reg || reg.status !== "approved") {
    return NextResponse.json({ error: "Invalid or inactive member link." }, { status: 404 });
  }

  await db.memberRegistration.update({
    where: { memberToken: token },
    data:  { lastSeenAt: new Date(), loginCount: { increment: 1 }, updatedAt: new Date() },
  });

  await db.memberActivity.create({
    data: { id: randomBytes(10).toString("hex"), registrationId: reg.id, event: "login" },
  });

  return NextResponse.json({
    fullName:   reg.fullName,
    email:      reg.email,
    county:     reg.county,
    occupation: reg.occupation,
    interests:  reg.interests,
    loginCount: reg.loginCount + 1,
    approvedAt: reg.reviewedAt,
    memberSince: reg.createdAt,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db  = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { memberToken: token } });
  if (!reg || reg.status !== "approved") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body    = await req.json().catch(() => ({}));
  const leaving = body?.leaving === true;
  const event   = leaving ? "logout" : "heartbeat";

  await db.memberRegistration.update({
    where: { memberToken: token },
    data:  { lastSeenAt: new Date(), updatedAt: new Date() },
  });

  if (leaving) {
    await db.memberActivity.create({
      data: { id: randomBytes(10).toString("hex"), registrationId: reg.id, event: "logout" },
    });
  }

  return NextResponse.json({ ok: true, event });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = getDb();
  const reg = await db.memberRegistration.findUnique({ where: { memberToken: token } });
  if (!reg) {
    return NextResponse.json({ error: "Member profile not found or already deleted." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  if (body?.confirm !== true) {
    return NextResponse.json(
      { error: "Explicit confirmation parameter 'confirm: true' is required to erase account data." },
      { status: 400 }
    );
  }

  const userEmail = reg.email;
  const userName = reg.fullName;

  // Perform cascade deletion of member registration & related data
  await db.$transaction([
    db.memberRegistration.delete({ where: { id: reg.id } }),
    db.newsletterSubscriber.deleteMany({ where: { email: userEmail } }),
    db.contactSubmission.deleteMany({ where: { email: userEmail } }),
  ]);

  // Log anonymized compliance audit trail
  await db.auditLog.create({
    data: {
      id: randomBytes(12).toString("hex"),
      action: "MEMBER_ACCOUNT_SELF_DELETED",
      actor: "member:self_service",
      detail: `Account and associated personal data erased for registration ID [anonymized:${reg.id.substring(0, 6)}...]`,
    },
  });

  // Send deletion confirmation email if configured
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const firstName = userName.split(" ")[0];
    await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "Confirmation of Data Erasure - Greenwave Society",
      html: brandedEmail({ eyebrow: "Data Privacy & Compliance", title: "Your account data has been erased", body: `<p style="margin:0 0 16px">Dear ${escapeHtml(firstName)},</p><p style="margin:0 0 16px">This confirms that your Greenwave Society account and associated personal data have been permanently erased from our active systems.</p><p style="margin:0 0 10px"><strong>Records removed:</strong></p>
    <ul style="font-size:14px;color:#444;line-height:1.8">
      <li>Member profile and registration records</li>
      <li>Portal activity and visit logs</li>
      <li>Newsletter subscription records</li>
      <li>Contact form submissions</li>
    </ul>
    <p style="margin:16px 0 22px;color:#607068">You are welcome to submit a new application if you decide to rejoin in the future.</p><p style="margin:0">Kind regards,<br><strong>Greenwave Society Data Privacy Team</strong></p>` }),
    }).catch(() => null);
  }

  return NextResponse.json({
    success: true,
    message: "Your account and all associated personal data have been permanently erased.",
  });
}

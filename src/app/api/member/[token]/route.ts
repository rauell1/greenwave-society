import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";

const FROM = "Greenwave Society <info@greenwavesociety.org>";

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
      from: FROM,
      to: userEmail,
      subject: "Confirmation of Data Erasure - Greenwave Society",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f0;padding:24px">
  <div style="background:#1A5C38;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:#fff;font-weight:bold;font-size:18px;margin:0">GREENWAVE SOCIETY</p>
    <p style="color:#a8d5b5;font-size:13px;margin:6px 0 0">Data Privacy & Compliance</p>
  </div>
  <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px">
    <p style="font-size:16px;color:#111">Dear ${firstName},</p>
    <p style="font-size:15px;color:#111;line-height:1.8">This email confirms that your Greenwave Society member account and all associated personal data have been permanently erased from our active databases per your request.</p>
    <p style="font-size:15px;color:#111;line-height:1.8">The following records were purged:</p>
    <ul style="font-size:14px;color:#444;line-height:1.8">
      <li>Member profile and registration records</li>
      <li>Portal activity and visit logs</li>
      <li>Newsletter subscription records</li>
      <li>Contact form submissions</li>
    </ul>
    <p style="font-size:14px;color:#555;line-height:1.8">If you decide to re-join Greenwave Society in the future, you are welcome to submit a new membership application at any time.</p>
    <p style="font-size:14px;color:#111;margin-top:24px">Kind regards,<br/><strong>Greenwave Society Data Privacy Team</strong></p>
  </div>
</div>`,
    }).catch(() => null);
  }

  return NextResponse.json({
    success: true,
    message: "Your account and all associated personal data have been permanently erased.",
  });
}

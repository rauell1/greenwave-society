import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Resend } from "resend";
import { brandedEmail, emailButton, emailNotice, escapeHtml, FROM_EMAIL, SITE_URL } from "@/lib/email-template";

const SUPER_ADMIN = "royokola3@gmail.com";

function notifySuperAdmin(opts: {
  leaderName: string; leaderRole: string; leaderEmail: string;
  action: string; rejectionReason?: string; ip: string; signedAt: Date;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const resend   = new Resend(process.env.RESEND_API_KEY);
  const isSigned = opts.action === "sign";
  const time     = opts.signedAt.toLocaleString("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "full", timeStyle: "short" });
  resend.emails.send({
    from: FROM_EMAIL, to: SUPER_ADMIN,
    subject: isSigned
      ? `Constitution Signed: ${opts.leaderName} — Greenwave Society`
      : `Constitution Declined: ${opts.leaderName} — Greenwave Society`,
    html: brandedEmail({ eyebrow: "Constitution", title: isSigned ? "Constitution signed" : "Constitution declined", body: `
        ${emailNotice(`<strong>${isSigned ? "Constitution signed" : "Constitution declined"}</strong><br><span style="font-size:12px">${escapeHtml(time)} EAT</span>`, isSigned ? "green" : "red")}
        <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:2.2">
          <tr><td style="color:#607068;width:130px"><strong>Leader</strong></td><td>${escapeHtml(opts.leaderName)}</td></tr>
          <tr><td style="color:#607068"><strong>Role</strong></td><td>${escapeHtml(opts.leaderRole)}</td></tr>
          <tr><td style="color:#607068"><strong>Email</strong></td><td>${escapeHtml(opts.leaderEmail)}</td></tr>
          <tr><td style="color:#555"><strong>Action</strong></td><td style="font-weight:bold;color:${isSigned ? "#166534" : "#991b1b"}">${isSigned ? "Signed" : "Declined"}</td></tr>
          <tr><td style="color:#555"><strong>IP</strong></td><td style="font-family:monospace">${escapeHtml(opts.ip)}</td></tr>
          ${opts.rejectionReason ? `<tr><td style="color:#555;vertical-align:top"><strong>Reason</strong></td><td style="color:#991b1b">${escapeHtml(opts.rejectionReason)}</td></tr>` : ""}
        </table>
        ${emailButton("View Dashboard", `${SITE_URL}/admin/dashboard`)}` }),
  }).catch(() => {});
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body            = await request.json().catch(() => null);
    const action: "sign" | "reject" = body?.action;
    const rejectionReason: string | undefined = body?.rejectionReason;

    if (!action || !["sign", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (action === "reject" && !rejectionReason?.trim()) {
      return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
    }

    const db  = getDb();
    const sig = await db.constitutionSignature.findUnique({ where: { token }, include: { leader: true } });
    if (!sig)                     return NextResponse.json({ error: "Invalid link" },      { status: 404 });
    if (sig.status !== "pending") return NextResponse.json({ error: "Already responded" }, { status: 409 });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? request.headers.get("x-real-ip")
            ?? "unknown";
    const signedAt = new Date();

    await db.constitutionSignature.update({
      where: { token },
      data:  { status: action === "sign" ? "signed" : "rejected", signedAt, ipAddress: ip, rejectionReason: action === "reject" ? rejectionReason : null },
    });

    notifySuperAdmin({ leaderName: sig.leader.name, leaderRole: sig.leader.role, leaderEmail: sig.leader.email, action, rejectionReason, ip, signedAt });

    logger.info("Constitution signature recorded", { token: token.slice(0, 8), action });
    return NextResponse.json({ success: true, status: action === "sign" ? "signed" : "rejected" });
  } catch (error) {
    logger.error("Sign action failed", error as Error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

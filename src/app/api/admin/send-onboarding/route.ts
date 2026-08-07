import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { Resend } from "resend";
import { logger } from "@/lib/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://greenwavesociety.org";
const FROM    = "Greenwave Society <info@rauell.systems>";

const LEADERS = [
  { name: "Martin Kyalo",     role: "Chief Executive Officer (CEO)",                email: "martinkyalo777@gmail.com" },
  { name: "Njeri Njoroge",    role: "Chief Operating Officer (COO)",                email: "njerinjoroge661@gmail.com" },
  { name: "Eugene Shadrack",  role: "Chief Innovation Officer (CIO)",               email: "eugeneshadrack60@gmail.com" },
  { name: "Mark Katana",      role: "Chief Strategy and Well-being Officer (CSWO)", email: "markkatanam@gmail.com" },
  { name: "Roy Okola Otieno", role: "Head of Design",                               email: "royokola3@gmail.com" },
  { name: "Roy John",         role: "Design Assistant",                             email: "johnroyochola@gmail.com" },
];

function buildHtml(leader: { name: string; role: string; email: string }, today: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
  <tr>
    <td style="background:#1A5C38;padding:32px;text-align:center">
      <img src="${APP_URL}/logo.png" alt="Greenwave Society" height="64" style="display:block;margin:0 auto 12px;border-radius:12px"/>
      <p style="color:#ffffff;font-size:20px;font-weight:bold;margin:0;letter-spacing:2px">GREENWAVE SOCIETY</p>
      <p style="color:#a8d5b5;font-size:13px;margin:6px 0 0">Executive Leadership Digital Infrastructure</p>
    </td>
  </tr>
  <tr>
    <td style="background:#f9faf9;padding:12px 40px;border-bottom:1px solid #e0e0e0">
      <p style="margin:0;font-size:12px;color:#555">
        <strong>Ref:</strong> GWS/EXEC/ONBOARD/2026 &nbsp;&nbsp;
        <strong>Date:</strong> ${today} &nbsp;&nbsp;
        <strong>To:</strong> ${leader.name}, ${leader.role}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:40px">
      <p style="margin:0 0 16px;font-size:15px;color:#111">Dear ${leader.name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#111;line-height:1.8">
        Pursuant to the adoption of the Greenwave Society Executive Leadership Constitution, you are hereby formally invited to activate your Executive Administrator account on the Greenwave Society digital platform. This step is a mandatory requirement for all members of the Executive Leadership Committee.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#111;line-height:1.8">
        Your account shall provide you with access to the Executive Dashboard, through which you will be required to review and provide your digital signature on the Executive Leadership Constitution as a binding expression of your commitment to the Organisation's mission, governance framework, and code of conduct.
      </p>
      <p style="margin:0 0 8px;font-size:15px;color:#111"><strong>Instructions for Account Setup:</strong></p>
      <ol style="margin:0 0 24px;padding-left:24px;font-size:15px;color:#111;line-height:2">
        <li>Visit the Executive Dashboard at the link below.</li>
        <li>Enter your registered email address: <strong>${leader.email}</strong></li>
        <li>You will be prompted to set a secure password for your account (minimum 8 characters).</li>
        <li>Upon successful login, you will be directed to the Executive Dashboard.</li>
        <li>Await the Constitution signing invitation, which shall be delivered separately.</li>
      </ol>
      <div style="text-align:center;margin:32px 0">
        <a href="${APP_URL}/admin" style="background:#1A5C38;color:#ffffff;padding:16px 36px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;letter-spacing:0.5px">
          Activate My Executive Account
        </a>
      </div>
      <div style="background:#fffbeb;border-left:4px solid #d97706;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7">
          <strong>Important:</strong> Access to this dashboard is restricted to authorised Executive Leaders only.
          Your registered email address (${leader.email}) serves as your unique identifier.
          Do not share your credentials with any third party. Failure to activate your account
          within seven (7) days may necessitate a reissue of this invitation.
        </p>
      </div>
      <p style="margin:0 0 16px;font-size:15px;color:#111;line-height:1.8">
        Should you encounter any difficulty in activating your account, kindly contact the Head of Design
        via <a href="mailto:royokola3@gmail.com" style="color:#1A5C38">royokola3@gmail.com</a>.
      </p>
      <p style="margin:0 0 4px;font-size:15px;color:#111">Yours faithfully,</p>
      <p style="margin:0 0 4px;font-size:15px;color:#111;font-weight:bold">Martin Kyalo</p>
      <p style="margin:0;font-size:13px;color:#555">Chief Executive Officer, Greenwave Society</p>
    </td>
  </tr>
  <tr>
    <td style="background:#1A5C38;padding:20px 40px;text-align:center">
      <p style="margin:0;font-size:12px;color:#a8d5b5;line-height:1.8">
        Greenwave Society &bull; Nairobi, Kenya<br/>
        greenwavesociety.org &bull; info@greenwavesociety.org
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function POST() {
  const { valid } = await getAdminSession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const today  = new Date().toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" });

  const results: { name: string; email: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const leader of LEADERS) {
    try {
      const { error } = await resend.emails.send({
        from:    FROM,
        to:      leader.email,
        subject: "OFFICIAL NOTICE: Activate Your Executive Dashboard Account — Greenwave Society",
        html:    buildHtml(leader, today),
      });
      if (error) {
        results.push({ name: leader.name, email: leader.email, status: "failed", error: error.message });
        logger.error("Onboarding email failed", new Error(error.message), { email: leader.email });
      } else {
        results.push({ name: leader.name, email: leader.email, status: "sent" });
        logger.info("Onboarding email sent", { name: leader.name, email: leader.email });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      results.push({ name: leader.name, email: leader.email, status: "failed", error: msg });
    }
  }

  const sent   = results.filter(r => r.status === "sent").length;
  const failed = results.filter(r => r.status === "failed").length;
  return NextResponse.json({ success: true, sent, failed, results });
}

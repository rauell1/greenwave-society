import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { brandedEmail, CONTACT_EMAIL, escapeHtml, FROM_EMAIL } from "@/lib/email-template";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const role = formData.get("role") as string;
    const cvFile = formData.get("cv") as File | null;

    if (!name || !email || !phone || !coverLetter || !cvFile || !role) {
      return NextResponse.json({ error: "All fields are required, including CV" }, { status: 400 });
    }

    const resend = getResend();
    
    const bodyHtml = `
      <p style="margin:0 0 16px"><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p style="margin:0 0 16px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 16px"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 16px"><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <div style="margin:20px 0;padding:16px;background:#f5f5f0;border-left:4px solid #1A5C38;color:#333;">
        <h4 style="margin:0 0 10px;color:#1A5C38;">Cover Letter:</h4>
        <div style="white-space:pre-wrap;">${escapeHtml(coverLetter)}</div>
      </div>
    `;

    if (resend) {
      const buffer = Buffer.from(await cvFile.arrayBuffer());

      await resend.emails.send({
        from: FROM_EMAIL,
        to: CONTACT_EMAIL,
        subject: `New Application for ${role}: ${name}`,
        replyTo: email,
        html: brandedEmail({
          eyebrow: "Job Application",
          title: `New Application: ${role}`,
          body: bodyHtml,
          preheader: `Application from ${name} for ${role}`,
        }),
        attachments: [
          {
            filename: cvFile.name,
            content: buffer,
          }
        ]
      });
      logger.info("Application email sent via Resend", { applicant: email, role });
    } else {
      logger.warn("RESEND_API_KEY not configured, application recorded in logs only.", {
        applicant: email,
        role,
        hasCv: !!cvFile
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Failed to process application", error as Error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again later." },
      { status: 500 }
    );
  }
}

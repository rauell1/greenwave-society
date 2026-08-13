import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { brandedEmail, CONTACT_EMAIL, escapeHtml, FROM_EMAIL } from "@/lib/email-template";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/**
 * Job Application API Route
 *
 * Handles incoming job applications submitted from the careers page.
 * This endpoint processes multipart/form-data, ensuring that all 5 required
 * fields are present: Name, Email, Phone, Cover Letter, and a mandatory CV upload.
 *
 * It utilizes the Resend API to dispatch a well-documented email to the organization,
 * securely attaching the applicant's CV.
 *
 * @param {NextRequest} request - The incoming HTTP request containing multipart/form-data
 * @returns {NextResponse} JSON response indicating success or error status (400, 500)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    // Extract fields
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const role = formData.get("role") as string;
    const cvFile = formData.get("cv") as File | null;

    // Strict validation for text fields
    if (!name || !email || !phone || !coverLetter || !role) {
      return NextResponse.json({ error: "All text fields (Name, Email, Phone, Cover Letter) are required." }, { status: 400 });
    }

    // Strict validation: CV is an absolute must
    if (!cvFile || cvFile.size === 0) {
      return NextResponse.json({ error: "A valid CV file is mandatory for this application." }, { status: 400 });
    }

    const resend = getResend();
    
    // Construct a well-documented, professional HTML email layout for the response
    const bodyHtml = `
      <h2 style="color:#1A5C38;margin:0 0 16px;">Applicant Details</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:15px;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eaeaea;width:120px;color:#666;"><strong>Role:</strong></td><td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-weight:600;">${escapeHtml(role)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eaeaea;color:#666;"><strong>Name:</strong></td><td style="padding:10px 0;border-bottom:1px solid #eaeaea;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eaeaea;color:#666;"><strong>Email:</strong></td><td style="padding:10px 0;border-bottom:1px solid #eaeaea;"><a href="mailto:${escapeHtml(email)}" style="color:#1A5C38;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eaeaea;color:#666;"><strong>Phone:</strong></td><td style="padding:10px 0;border-bottom:1px solid #eaeaea;">${escapeHtml(phone)}</td></tr>
      </table>
      
      <h3 style="color:#1A5C38;margin:0 0 12px;">Cover Letter / Message</h3>
      <div style="padding:18px;background:#f9f9f9;border-left:4px solid #1A5C38;color:#333;line-height:1.6;font-size:15px;">
        <div style="white-space:pre-wrap;">${escapeHtml(coverLetter)}</div>
      </div>
      
      <p style="margin:24px 0 0;font-size:13px;color:#888;">
        <em>Note: The applicant's mandatory CV (${escapeHtml(cvFile.name)}) is attached to this email.</em>
      </p>
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

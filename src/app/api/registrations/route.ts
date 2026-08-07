import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://greenwavesociety.org";
const FROM    = "Greenwave Society <info@greenwavesociety.org>";

const VALID_OCCUPATIONS = ["student", "employed_private", "employed_public", "self_employed", "unemployed", "other"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, county, occupation,
      organization, meetsEligibility, interests,
      motivation, hearAboutUs, source, acknowledged,
    } = body;

    // Hard validation
    if (!meetsEligibility) return NextResponse.json({ error: "Eligibility requirement not met." }, { status: 400 });
    if (!acknowledged)     return NextResponse.json({ error: "Acknowledgment is required." }, { status: 400 });
    if (!fullName?.trim()) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!phone?.trim())      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    if (!county?.trim())     return NextResponse.json({ error: "County/region is required." }, { status: 400 });
    if (!VALID_OCCUPATIONS.includes(occupation)) {
      return NextResponse.json({ error: "Please select a valid occupation." }, { status: 400 });
    }
    if (!motivation?.trim() || motivation.trim().length < 20) {
      return NextResponse.json({ error: "Motivation must be at least 20 characters." }, { status: 400 });
    }

    const db = getDb();

    // Check intake open (could add a settings flag; for now always open)
    // Duplicate check within 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db.memberRegistration.findFirst({
      where: { email: email.toLowerCase().trim(), createdAt: { gte: since } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An application with this email was already submitted recently. Please check your inbox." },
        { status: 429 },
      );
    }

    const id = randomBytes(12).toString("hex");
    const record = await db.memberRegistration.create({
      data: {
        id,
        fullName:         fullName.trim(),
        email:            email.toLowerCase().trim(),
        phone:            phone.trim(),
        county:           county.trim(),
        occupation,
        organization:     organization?.trim() || null,
        meetsEligibility: true,
        interests:        Array.isArray(interests) ? interests : [],
        motivation:       motivation.trim(),
        hearAboutUs:      hearAboutUs?.trim() || null,
        source:           source?.trim() || null,
        acknowledged:     true,
        status:           "pending",
      },
    });

    // Notify admins
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean);
    if (adminEmails.length && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM,
        to:      adminEmails,
        subject: `New Membership Application: ${fullName.trim()} (${county})`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f0;padding:24px">
  <div style="background:#1A5C38;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:#fff;font-weight:bold;font-size:18px;margin:0">New Membership Application</p>
    <p style="color:#a8d5b5;font-size:13px;margin:6px 0 0">Greenwave Society</p>
  </div>
  <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#666;width:140px">Name</td><td style="padding:8px 0;font-weight:bold">${fullName.trim()}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${email.toLowerCase().trim()}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${phone.trim()}</td></tr>
      <tr><td style="padding:8px 0;color:#666">County</td><td style="padding:8px 0">${county.trim()}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Occupation</td><td style="padding:8px 0">${occupation}</td></tr>
      ${organization ? `<tr><td style="padding:8px 0;color:#666">Organisation</td><td style="padding:8px 0">${organization.trim()}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#666">Interests</td><td style="padding:8px 0">${Array.isArray(interests) ? interests.join(", ") : "None"}</td></tr>
      ${source ? `<tr><td style="padding:8px 0;color:#666">Source</td><td style="padding:8px 0">${source}</td></tr>` : ""}
    </table>
    <div style="margin:20px 0;padding:16px;background:#f9f9f7;border-radius:8px;border-left:4px solid #1A5C38">
      <p style="margin:0 0 6px;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase">Motivation</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7">${motivation.trim()}</p>
    </div>
    <div style="text-align:center;margin-top:24px">
      <a href="${APP_URL}/admin/dashboard" style="background:#1A5C38;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold">Review in Dashboard</a>
    </div>
  </div>
</div>`,
      }).catch(() => null); // non-fatal
    }

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET — Export all personal data for a member in JSON format (GDPR Article 20 Compliance)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = getDb();

  const reg = await db.memberRegistration.findUnique({
    where: { memberToken: token },
    include: {
      activity: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!reg || reg.status !== "approved") {
    return NextResponse.json({ error: "Invalid or inactive member link." }, { status: 404 });
  }

  // Also query any related newsletter or contact records matching member's email
  const newsletterSubscriber = await db.newsletterSubscriber.findUnique({
    where: { email: reg.email },
  });

  const contactSubmissions = await db.contactSubmission.findMany({
    where: { email: reg.email },
    orderBy: { createdAt: "desc" },
  });

  const exportPayload = {
    exportDate: new Date().toISOString(),
    complianceNotice: "This document contains a complete export of all personal data held by Greenwave Society associated with your account.",
    personalInformation: {
      id: reg.id,
      fullName: reg.fullName,
      email: reg.email,
      phone: reg.phone,
      county: reg.county,
      occupation: reg.occupation,
      organization: reg.organization,
      interests: reg.interests,
      motivation: reg.motivation,
      hearAboutUs: reg.hearAboutUs,
      source: reg.source,
      status: reg.status,
      memberSince: reg.createdAt,
      approvedAt: reg.reviewedAt,
      lastSeenAt: reg.lastSeenAt,
      loginCount: reg.loginCount,
    },
    activityLogs: reg.activity.map((act) => ({
      event: act.event,
      metadata: act.metadata,
      timestamp: act.createdAt,
    })),
    newsletterSubscription: newsletterSubscriber
      ? { subscribed: true, subscribedAt: newsletterSubscriber.createdAt }
      : { subscribed: false },
    contactFormSubmissions: contactSubmissions.map((cs) => ({
      interest: cs.interest,
      message: cs.message,
      submittedAt: cs.createdAt,
    })),
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="greenwave-data-export-${reg.id}.json"`,
    },
  });
}

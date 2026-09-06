import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Polled by the join form's payment step while waiting for the M-Pesa
// callback to land (STK Push settles asynchronously, typically within ~30s).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const registration = await db.memberRegistration.findUnique({
    where: { id },
    select: { status: true, membershipFeeStatus: true },
  });
  if (!registration) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  let failureReason: string | null = null;
  if (registration.membershipFeeStatus === "failed") {
    const lastPayment = await db.membershipPayment.findFirst({
      where: { registrationId: id },
      orderBy: { createdAt: "desc" },
      select: { failureReason: true },
    });
    failureReason = lastPayment?.failureReason ?? null;
  }

  return NextResponse.json({
    status: registration.status,
    membershipFeeStatus: registration.membershipFeeStatus,
    failureReason,
  });
}

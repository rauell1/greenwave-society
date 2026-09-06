import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isMpesaMembershipEnabled } from "@/lib/payments/feature-flag";
import { getMpesaClient } from "@/lib/payments/client";
import { MEMBERSHIP_FEE_KES } from "@/lib/payments/config";

// Rate-limited (strict tier) by src/middleware.ts, which applies to all
// non-GET /api/registrations/* routes.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isMpesaMembershipEnabled())) {
    return NextResponse.json({ error: "Membership payment is not available." }, { status: 404 });
  }

  const { id } = await params;
  let body: { phoneNumber?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const phoneNumber = body.phoneNumber?.trim();
  if (!phoneNumber) {
    return NextResponse.json({ error: "phoneNumber is required." }, { status: 400 });
  }

  const db = getDb();
  const registration = await db.memberRegistration.findUnique({ where: { id } });
  if (!registration) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }
  if (registration.status !== "pending") {
    return NextResponse.json({ error: "This application is no longer awaiting payment." }, { status: 409 });
  }
  if (registration.membershipFeeStatus === "paid") {
    return NextResponse.json({ error: "Membership fee already paid." }, { status: 409 });
  }

  try {
    const result = await getMpesaClient().initiatePayment({
      phoneNumber,
      amount: MEMBERSHIP_FEE_KES,
      accountReference: registration.id,
      description: `Greenwave Society membership fee - ${registration.fullName}`,
      idempotencyKey: registration.id,
    });

    await db.memberRegistration.update({
      where: { id },
      data: { membershipFeeStatus: "pending" },
    });

    return NextResponse.json({
      paymentId: result.paymentId,
      checkoutRequestId: result.checkoutRequestId,
      message: "STK Push sent. Check your phone to enter your M-Pesa PIN.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment initiation failed." },
      { status: 502 },
    );
  }
}

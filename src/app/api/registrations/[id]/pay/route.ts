import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isMpesaMembershipEnabled } from "@/lib/payments/feature-flag";
import { getMpesaClient } from "@/lib/payments/client";
import { getMembershipFeeKes } from "@/lib/payments/config";
import { consumeRateLimit, getClientIdentifier, rateLimitUnavailable } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const KENYAN_PHONE_REGEX = /^(?:254|\+254|0)?([17]\d{8})$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isMpesaMembershipEnabled())) {
    return NextResponse.json({ error: "Membership payment is not available." }, { status: 404 });
  }

  const { id } = await params;
  const clientIp = getClientIdentifier(req);

  // Layered rate limiting: both per-IP and per-registration
  try {
    const [ipLimit, regLimit] = await Promise.all([
      consumeRateLimit(`mpesa-pay-ip:${clientIp}`, 10, 15 * 60 * 1000),
      consumeRateLimit(`mpesa-pay-reg:${id}`, 5, 15 * 60 * 1000),
    ]);

    if (!ipLimit.allowed || !regLimit.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }
  } catch (err) {
    logger.error("Rate limit check failed in mpesa pay", err as Error);
    return rateLimitUnavailable();
  }

  let body: { phoneNumber?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawPhone = body.phoneNumber?.trim() || "";
  const phoneMatch = rawPhone.replace(/\s+/g, "").match(KENYAN_PHONE_REGEX);
  if (!phoneMatch) {
    return NextResponse.json(
      { error: "Please provide a valid Kenyan phone number (e.g. 0712345678 or 254712345678)." },
      { status: 400 }
    );
  }

  const normalizedPhone = `254${phoneMatch[1]}`;

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
      phoneNumber: normalizedPhone,
      amount: await getMembershipFeeKes(),
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

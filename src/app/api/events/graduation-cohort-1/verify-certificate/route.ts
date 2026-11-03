import { NextResponse } from "next/server";
import {
  findGraduandByEmail,
  findGraduandByToken,
  findGraduandBySlugOrId,
} from "@/lib/events/graduand-registry";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { email, token, id } = body;

    let graduand = null;

    if (token) {
      graduand = findGraduandByToken(token);
    }

    if (!graduand && email) {
      graduand = findGraduandByEmail(email);
    }

    if (!graduand && id) {
      graduand = findGraduandBySlugOrId(id);
    }

    if (!graduand) {
      return NextResponse.json(
        {
          error:
            "Access Restricted: Only the 12 certified graduands of YPG Cohort I are authorized to access completion certificates. The provided credentials do not match our certified roll.",
          isVerified: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isVerified: true,
      graduand: {
        id: graduand.id,
        slug: graduand.slug,
        fullName: graduand.fullName,
        credentialId: graduand.credentialId,
        ticketNumber: graduand.ticketNumber,
        certificateUrl: graduand.certificateUrl,
        pdfUrl: graduand.pdfUrl,
        pod: graduand.pod,
        capstoneTitle: graduand.capstoneTitle,
        conferredAt: graduand.conferredAt,
        accessToken: graduand.accessToken,
      },
    });
  } catch (error) {
    console.error("[VERIFY_CERTIFICATE_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred verifying certification." },
      { status: 500 }
    );
  }
}

import { Metadata } from "next";
import { CertificateClient } from "./CertificateClient";
import {
  findGraduandByToken,
  findGraduandByEmail,
  findGraduandBySlugOrId,
} from "@/lib/events/graduand-registry";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Official Graduand Certificate of Completion Pass | Greenwave Society",
  description:
    "Official digital credential and certificate of completion portal for the certified youth changemakers of YPG: Young Person's Guide to Systems Change Cohort I in partnership with The 50 Percent.",
  alternates: {
    canonical: `${APP_CONFIG.url}/events/graduation-cohort-1/certificate`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string; id?: string }>;
}) {
  const { token, email, id } = await searchParams;

  let graduand = null;
  let error: string | null = null;

  if (token) {
    graduand = findGraduandByToken(token);
    if (!graduand) {
      error = "Invalid or expired certificate access token.";
    }
  } else if (email) {
    graduand = findGraduandByEmail(email);
    if (!graduand) {
      error = "This email is not on the certified YPG Cohort I graduand roll.";
    }
  } else if (id) {
    graduand = findGraduandBySlugOrId(id);
    if (!graduand) {
      error = "No graduand found matching this identifier.";
    }
  }

  return <CertificateClient initialGraduand={graduand} error={error} />;
}

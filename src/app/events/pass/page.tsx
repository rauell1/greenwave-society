import { getDb } from "@/lib/db";
import { generateQrDataUrl } from "@/lib/events/qr";
import { SITE_URL } from "@/lib/email-template";
import { PassClient, PassProps } from "./PassClient";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Official Event Admission Pass | Greenwave Society",
  description: "Digital admission ticket and door check-in pass for Greenwave Society events.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
  }>;
}

export default async function PassPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const id = searchParams.id;
  const token = searchParams.token;

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-black text-white">Missing Pass Information</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            No registration ID was provided. Please open your admission pass using the link sent to your registered email address.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white">
              <Link href="/events/graduation-cohort-1">Go to Graduation Event Page</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800">
              <Link href="/events/community-market">Go to Community Market Portal</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const db = getDb();
  const registration = await db.cmsEventRegistration.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startsAt: true,
          location: true,
        },
      },
    },
  });

  if (!registration) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-black text-white">Pass Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We could not locate this ticket pass in our database. It may have been cancelled or the link is expired.
          </p>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] text-slate-400">
            Need help? Reach out to our logistics desk at{" "}
            <a href="mailto:info@greenwavesociety.org" className="text-emerald-400 underline">
              info@greenwavesociety.org
            </a>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white">
              <Link href="/events/graduation-cohort-1">View Graduation Event</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const meta = (registration.metadata as Record<string, any>) || {};
  const expectedToken = meta.checkInToken || meta.ticketToken;

  // Security check: if a token is associated with the ticket, it must match
  if (expectedToken && token && expectedToken !== token) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-black text-white">Invalid Security Token</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The security token for this digital pass does not match our records. Please verify you opened the latest link from your confirmation email.
          </p>
          <Button asChild variant="outline" className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800">
            <Link href="mailto:info@greenwavesociety.org">Contact Support</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isVendor = Boolean(meta.vendorName || meta.type === "vendor");
  const isGraduand = meta.role === "graduand";

  let roleTitle = "Guest";
  if (isGraduand) {
    roleTitle = "Empower 360 Graduand (Cohort I)";
  } else if (isVendor) {
    roleTitle = `Market Vendor (${meta.category || "Sustainable Goods"})`;
  } else if (meta.role === "family_friend") {
    roleTitle = "Family Member & Supporter";
  } else if (meta.role === "partner_collaborator") {
    roleTitle = "Partner & Mentor";
  } else if (meta.role === "community_guest") {
    roleTitle = "Community Guest";
  }

  // The checkInUrl barcode value that door scanners read
  const tokenToUse = token || expectedToken || "";
  const checkInUrl = `${SITE_URL}/events/check-in?id=${registration.id}${tokenToUse ? `&token=${tokenToUse}` : ""}`;

  // High quality QR code Data URL
  const qrCodeDataUrl = await generateQrDataUrl(checkInUrl, {
    width: 360,
    margin: 1,
    darkColor: "#022c22", // Very dark emerald
    lightColor: "#ffffff",
  });

  const passProps: PassProps = {
    id: registration.id,
    ticketNumber: `GW-${registration.id.slice(-6).toUpperCase()}`,
    fullName: registration.fullName,
    email: registration.email,
    role: roleTitle,
    rawRole: meta.role || (isVendor ? "vendor" : "guest"),
    isGraduand,
    isVendor,
    vendorName: meta.vendorName || null,
    vendorCategory: meta.category || null,
    guestCount: meta.guestCount || 1,
    attendanceStatus: registration.attendanceStatus as "not_checked_in" | "checked_in" | "cancelled",
    checkedInAt: registration.checkedInAt ? registration.checkedInAt.toISOString() : null,
    qrCodeDataUrl,
    event: {
      title: registration.event?.title || "Empower 360 Cohort I Graduation & Community Market",
      startsAt: registration.event?.startsAt
        ? registration.event.startsAt.toISOString()
        : "2026-10-30T10:30:00+03:00",
      location: registration.event?.location || "Ubunifu Hub, Nairobi, Kenya",
      slug: registration.event?.slug || "graduation-cohort-1-2026",
      url: `${SITE_URL}/events/${registration.event?.slug || "graduation-cohort-1"}`,
    },
  };

  return <PassClient pass={passProps} />;
}

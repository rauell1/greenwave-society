import { getCurrentAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { CheckInClient } from "./CheckInClient";

export const metadata = {
  title: "Event Door Check-in Station | Greenwave Society Admin",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin?redirect=/events/check-in");
  }

  return <CheckInClient adminEmail={admin.email} adminRoles={admin.roles} />;
}

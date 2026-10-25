import { getCurrentAdmin } from "@/lib/auth/guards";
import { isExecutiveCommitteeMember } from "@/lib/careers-admin";
import { redirect } from "next/navigation";
import { CheckInClient } from "./CheckInClient";

export const metadata = {
  title: "Event Door Check-in Station | Greenwave Society Executive",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin?redirect=/events/check-in");
  }

  const isExecutive = await isExecutiveCommitteeMember(admin);
  if (!isExecutive) {
    redirect("/admin/no-access");
  }

  return <CheckInClient adminEmail={admin.email} adminRoles={admin.roles} isExecutive={true} />;
}

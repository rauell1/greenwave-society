import { getDb } from "@/lib/db";
import { SuicidePreventionRegistrationForm } from "./RegistrationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RSVP: Suicide Prevention Awareness Session | Greenwave Society",
  description: "Confirm Your Place at Our Exclusive Mental Health Circle.",
};

// Force dynamic so we get the fresh toggle state from the database
export const dynamic = "force-dynamic";

export default async function SuicidePreventionEventPage() {
  const db = getDb();
  
  // We check if the event is "published".
  // You can toggle this off in the admin CMS by changing the event status to "draft" or "closed".
  const event = await db.cmsEvent.findUnique({
    where: { slug: "suicide-prevention-awareness-2026" },
  });

  const isRegistrationOpen = event?.status === "published";

  return <SuicidePreventionRegistrationForm isRegistrationOpen={isRegistrationOpen} />;
}

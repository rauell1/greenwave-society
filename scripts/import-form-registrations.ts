/**
 * Imports registrations collected with the Google Form (google-form/create-registration-form.gs)
 * into the website database, so they appear on the event's admin page just like sign-ups made on
 * the website. Attendees, volunteers and vendors are all imported; vendors carry their business
 * name and volunteers are tagged "Volunteer" in their details.
 *
 * Usage (from the project folder, with DATABASE_URL set in .env.local or the environment):
 *   npx tsx scripts/import-form-registrations.ts --csv responses.csv            preview only
 *   npx tsx scripts/import-form-registrations.ts --csv responses.csv --apply    write to the database
 *
 * Options:
 *   --csv <file>     The responses sheet downloaded as CSV (File > Download > Comma separated values).
 *   --event <slug>   Event to add people to. Defaults to the Trivia & Games Night on 18 November 2026.
 *   --apply          Actually save. Without it nothing is written.
 *
 * Safe to run again as new responses arrive: people already registered for the event (same email)
 * are skipped. Imported people do not get the website's confirmation email; reminder emails are
 * sent to them like any other registration once the site is back up.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "node:fs";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { mapFormResponses, type FormRegistration } from "../src/lib/events/form-import";
import { registrationStatus } from "../src/lib/events/validation";
import { fromNairobiParts, formatEventWhen } from "../src/lib/events/nairobi-time";

const DEFAULT_EVENT_DATE = "2026-11-18";
const ACTOR = "google-form-import";

function argValue(name: string) {
  const args = process.argv.slice(2);
  const inline = args.find(a => a.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
}

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

async function findEvent(db: PrismaClient, slug: string | undefined) {
  if (slug) {
    const event = await db.cmsEvent.findUnique({ where: { slug } });
    return event ?? fail(`No event with the slug "${slug}" was found.`);
  }
  const candidates = await db.cmsEvent.findMany({
    where: {
      title: { contains: "trivia", mode: "insensitive" },
      startsAt: { gte: fromNairobiParts(DEFAULT_EVENT_DATE, "00:00")!, lte: fromNairobiParts(DEFAULT_EVENT_DATE, "23:59")! },
      status: { not: "cancelled" },
    },
  });
  if (candidates.length === 1) return candidates[0];
  const upcoming = await db.cmsEvent.findMany({ where: { endsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, select: { slug: true, title: true, status: true } });
  const list = upcoming.map(e => `  ${e.slug}  (${e.title}, ${e.status})`).join("\n") || "  (none)";
  fail(`${candidates.length ? "More than one" : "No"} Trivia & Games Night event found on ${DEFAULT_EVENT_DATE}. Pass --event <slug>. Upcoming events:\n${list}`);
}

async function save(db: PrismaClient, eventId: string, person: FormRegistration) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await db.$transaction(async tx => {
        const event = await tx.cmsEvent.findUniqueOrThrow({ where: { id: eventId } });
        const confirmed = await tx.cmsEventRegistration.count({ where: { eventId, status: "registered" } });
        const status = registrationStatus(event.capacity, confirmed);
        const member = await tx.memberRegistration.findFirst({ where: { email: person.email }, select: { id: true } });
        const registration = await tx.cmsEventRegistration.create({
          data: { eventId, fullName: person.fullName, email: person.email, phone: person.phone, organization: person.organization, memberRegistrationId: member?.id ?? null, metadata: person.metadata, status },
        });
        await tx.auditLog.create({
          data: {
            action: "EVENT_ATTENDEE_ADDED",
            actor: ACTOR,
            resourceType: "cms_event",
            resourceId: eventId,
            outcome: "SUCCESS",
            afterState: JSON.stringify({ registrationId: registration.id, status, source: "google_form", registeredAs: person.registeredAs }),
          },
        });
        return status;
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 3) continue;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "already registered";
      throw error;
    }
  }
  throw new Error("Could not save after 3 attempts");
}

async function main() {
  const csvPath = argValue("--csv") ?? fail("Pass the downloaded responses file with --csv <file>.");
  if (!fs.existsSync(csvPath)) fail(`File not found: ${csvPath}`);
  if (!process.env.DATABASE_URL && !process.env.DIRECT_DATABASE_URL) fail("Set DATABASE_URL (in .env.local or the environment) to the website's database connection string.");
  const apply = process.argv.includes("--apply");

  const { registrations, skipped } = mapFormResponses(fs.readFileSync(csvPath, "utf8"));
  const db = new PrismaClient({ adapter: new PrismaPg(process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!) });
  try {
    const event = await findEvent(db, argValue("--event"));
    console.log(`\nEvent: ${event.title} (${event.slug})\nWhen:  ${formatEventWhen(event.startsAt, event.endsAt)}\nStatus: ${event.status}${event.capacity ? `, capacity ${event.capacity}` : ""}`);
    if (event.status !== "published") console.log(`Note: this event is "${event.status}", so it is not shown on the public site until it is published.`);

    const existing = new Set((await db.cmsEventRegistration.findMany({ where: { eventId: event.id, email: { in: registrations.map(r => r.email) } }, select: { email: true } })).map(r => r.email.toLowerCase()));
    const fresh = registrations.filter(r => !existing.has(r.email));
    const counts = (list: FormRegistration[]) => ["attendee", "volunteer", "vendor"].map(role => `${list.filter(r => r.registeredAs === role).length} ${role}s`).join(", ");

    console.log(`\nResponses in file: ${registrations.length + skipped.length}`);
    console.log(`Already registered for this event: ${registrations.length - fresh.length}`);
    console.log(`New to import: ${fresh.length} (${counts(fresh)})`);
    for (const person of fresh) console.log(`  row ${person.row}: ${person.fullName} <${person.email}> as ${person.registeredAs}${person.organization ? `, ${person.organization}` : ""}`);
    if (skipped.length) {
      console.log(`Skipped rows: ${skipped.length}`);
      for (const s of skipped) console.log(`  row ${s.row}: ${s.name || "(no name)"}: ${s.reason}`);
    }

    if (!apply) {
      console.log("\nPreview only, nothing was saved. Run again with --apply to import these registrations.\n");
      return;
    }
    const results: Record<string, number> = {};
    for (const person of fresh) {
      const status = await save(db, event.id, person);
      results[status] = (results[status] ?? 0) + 1;
    }
    console.log(`\nImported: ${Object.entries(results).map(([status, n]) => `${n} ${status}`).join(", ") || "nothing new"}.\n`);
  } finally {
    await db.$disconnect();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

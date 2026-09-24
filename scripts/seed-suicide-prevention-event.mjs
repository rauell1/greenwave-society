import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding Suicide Prevention Event...");
  
  // Find a user to act as creator
  let admin = await db.adminUser.findFirst({
    where: { isActive: true }
  });

  if (!admin) {
    admin = await db.adminUser.create({
      data: {
        email: "system@greenwavesociety.org",
        isActive: true,
      }
    });
  }

  // Upsert the event
  const event = await db.cmsEvent.upsert({
    where: { slug: "suicide-prevention-awareness-2026" },
    update: {},
    create: {
      slug: "suicide-prevention-awareness-2026",
      title: "Suicide Prevention Awareness Session",
      description: "A small awareness session to our members in awareness of the suicide prevention month.",
      location: "Virtual / Greenwave HQ",
      timezone: "Africa/Nairobi",
      startsAt: new Date("2026-10-03T10:00:00+03:00"),
      endsAt: new Date("2026-10-03T13:00:00+03:00"),
      status: "published",
      createdById: admin.id,
      updatedById: admin.id,
    }
  });

  console.log("Event created/updated:", event.title, "(ID:", event.id, ")");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { sendEventReminderEmail } from "../src/lib/events/email"; 

const db = new PrismaClient();

async function main() {
  console.log("Starting event reminder job...");
  
  // Find all published events
  const upcomingEvents = await db.cmsEvent.findMany({
    where: {
      status: "published",
      startsAt: {
        gte: new Date(), // must be in the future
      }
    }
  });

  for (const event of upcomingEvents) {
    // Check if event is exactly 3 or 4 days away
    const daysUntilEvent = Math.ceil((event.startsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent === 3 || daysUntilEvent === 4 || daysUntilEvent === 2) {
      console.log(`Event "${event.title}" is ${daysUntilEvent} days away. Sending reminders...`);
      
      const registrations = await db.cmsEventRegistration.findMany({
        where: {
          eventId: event.id,
          status: "registered"
        }
      });

      console.log(`Found ${registrations.length} registrations to remind.`);

      let sentCount = 0;
      for (const reg of registrations) {
        try {
          await sendEventReminderEmail({
            to: reg.email,
            name: reg.fullName,
            eventTitle: event.title,
            eventDate: format(event.startsAt, "EEEE, do MMMM yyyy, h:mm a"),
          });
          sentCount++;
        } catch (e) {
          console.error(`Failed to send reminder to ${reg.email}`, e);
        }
      }
      
      console.log(`Successfully sent ${sentCount} reminders for "${event.title}".`);
    } else {
      console.log(`Event "${event.title}" is ${daysUntilEvent} days away. Skipping reminders.`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";
import { eventHref, getPublicEvents } from "@/lib/events/public-events";
import { formatNairobi } from "@/lib/events/nairobi-time";

export const metadata: Metadata = {
  title: "Events | Greenwave Society Kenya",
  description: "Upcoming and past Greenwave Society events: youth leadership sessions, community barazas, conservation activities and hangouts across Kenya.",
  alternates: { canonical: `${APP_CONFIG.url}/events` },
};

// Rendered per request so events published from the admin appear straight away.
export const dynamic = "force-dynamic";

type ListedEvent = Awaited<ReturnType<typeof getPublicEvents>>["upcoming"][number];

function EventCard({ event, past }: { event: ListedEvent; past?: boolean }) {
  return (
    <Link href={eventHref(event.slug)} className="group flex flex-col rounded-2xl border border-primary/10 bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <CalendarDays className="h-4 w-4" />
          {formatNairobi(event.startsAt, { dateStyle: "medium", timeStyle: "short" })}
        </span>
        {event.status === "cancelled" && <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">Cancelled</span>}
        {past && event.status !== "cancelled" && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Concluded</span>}
      </div>
      <h3 className="mt-3 font-serif text-xl font-bold text-foreground group-hover:text-primary">{event.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" />{event.location || (event.virtualUrl ? "Online" : "Venue to be confirmed")}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-primary">{past ? "Details" : "Register"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}

export default async function EventsPage() {
  const { upcoming, past } = await getPublicEvents();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <header className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Events</p>
            <h1 className="mt-2 font-serif text-4xl font-black sm:text-5xl">Join us in person</h1>
            <p className="mt-4 text-muted-foreground">Sessions, barazas, hangouts and community action days. Register for an upcoming event or look back at what we have done together.</p>
          </header>

          <section className="mt-12" aria-labelledby="upcoming-heading">
            <h2 id="upcoming-heading" className="font-serif text-2xl font-bold">Upcoming</h2>
            {upcoming.length ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{upcoming.map(event => <EventCard key={event.id} event={event} />)}</div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-primary/20 p-8 text-center text-sm text-muted-foreground">No upcoming events right now. Check back soon, or <Link href="/contact" className="font-semibold text-primary underline">get in touch</Link> to hear about the next one.</p>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-16" aria-labelledby="past-heading">
              <h2 id="past-heading" className="font-serif text-2xl font-bold">Past events</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{past.map(event => <EventCard key={event.id} event={event} past />)}</div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

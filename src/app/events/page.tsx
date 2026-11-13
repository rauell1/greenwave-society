import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";
import { eventHref, getPublicEvents } from "@/lib/events/public-events";
import { formatNairobi, isTimeToBeConfirmed } from "@/lib/events/nairobi-time";
import { VOLUNTEER_POSTER, CAMPAIGN_CONTACT } from "@/lib/events/campaign-2026";
import { getEventPosters, type EventPoster } from "@/lib/events/posters";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Events | Greenwave Society Kenya",
  description: "Upcoming and past Greenwave Society events: youth leadership sessions, community barazas, conservation activities and hangouts across Kenya.",
  alternates: { canonical: `${APP_CONFIG.url}/events` },
};

// Rendered per request so events published from the admin appear straight away.
export const dynamic = "force-dynamic";

type ListedEvent = Awaited<ReturnType<typeof getPublicEvents>>["upcoming"][number];

function EventCard({ event, past, poster }: { event: ListedEvent; past?: boolean; poster?: EventPoster }) {
  return (
    <Link href={eventHref(event.slug)} className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-background transition-all hover:border-primary/30 hover:shadow-lg">
      {poster && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image src={poster.src} alt={poster.alt} fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <CalendarDays className="h-4 w-4" />
          {isTimeToBeConfirmed(event.startsAt, event.endsAt) ? formatNairobi(event.startsAt, { dateStyle: "medium" }) : formatNairobi(event.startsAt, { dateStyle: "medium", timeStyle: "short" })}
        </span>
        {event.status === "cancelled" && <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">Cancelled</span>}
        {past && event.status !== "cancelled" && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Concluded</span>}
      </div>
      <h3 className="mt-3 font-serif text-xl font-bold text-foreground group-hover:text-primary">{event.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
        {event.location || event.virtualUrl ? <span className="inline-flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" />{event.location || "Online"}</span> : <span />}
        <span className="inline-flex items-center gap-1 font-semibold text-primary">{past ? "Details" : "Register"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
      </div>
    </Link>
  );
}

export default async function EventsPage() {
  const { upcoming, past } = await getPublicEvents();
  const posters = await getEventPosters([...upcoming, ...past]);
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
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{upcoming.map(event => <EventCard key={event.id} event={event} poster={posters.get(event.id)} />)}</div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-primary/20 p-8 text-center text-sm text-muted-foreground">No upcoming events right now. Check back soon, or <Link href="/contact" className="font-semibold text-primary underline">get in touch</Link> to hear about the next one.</p>
            )}
          </section>

          <section className="mt-16 grid items-center gap-8 rounded-3xl border border-primary/10 bg-muted/30 p-6 sm:p-10 md:grid-cols-[1fr_280px]" aria-labelledby="volunteer-heading">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Call for volunteers</p>
              <h2 id="volunteer-heading" className="mt-2 font-serif text-3xl font-black">Give a day. Grow a community.</h2>
              <p className="mt-3 text-muted-foreground">We need hands for registration, logistics, route marshals, team coordination and media. Pick one event or join them all.</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
                <Link href="/contact?interest=volunteer" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Volunteer with us</Link>
                <a href={`tel:${CAMPAIGN_CONTACT.replace(/\s/g, "")}`} className="rounded-lg border px-4 py-2">Call {CAMPAIGN_CONTACT}</a>
              </div>
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
              <Image src={VOLUNTEER_POSTER.src} alt={VOLUNTEER_POSTER.alt} fill sizes="280px" className="object-cover" />
            </div>
          </section>

          {past.length > 0 && (
            <section className="mt-16" aria-labelledby="past-heading">
              <h2 id="past-heading" className="font-serif text-2xl font-bold">Past events</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{past.map(event => <EventCard key={event.id} event={event} past poster={posters.get(event.id)} />)}</div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

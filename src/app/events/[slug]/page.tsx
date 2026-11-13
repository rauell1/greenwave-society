import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Clock, MapPin, Users, Video } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";
import { serializeJsonLd } from "@/lib/seo";
import { eventHref, getPublicEvent, hasCustomEventPage } from "@/lib/events/public-events";
import { formatNairobi, isTimeToBeConfirmed } from "@/lib/events/nairobi-time";
import { getEventPoster } from "@/lib/events/posters";
import Image from "next/image";
import { EventRegistrationForm } from "./EventRegistrationForm";
import { ShareEventLink } from "@/components/events/ShareEventLink";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPublicEvent(slug).catch(() => null);
  if (!found) return { title: "Event not found | Greenwave Society" };
  const poster = await getEventPoster(found.event).catch(() => null);
  return {
    title: `${found.event.title} | Greenwave Society Events`,
    description: found.event.description.slice(0, 160),
    ...(poster ? { openGraph: { images: [{ url: poster.src, width: poster.width, height: poster.height, alt: poster.alt }] } } : {}),
    alternates: { canonical: `${APP_CONFIG.url}/events/${slug}` },
  };
}

const CLOSED_MESSAGES: Record<string, string> = {
  EVENT_NOT_OPEN: "Registration is closed for this event.",
  REGISTRATION_NOT_OPEN: "Registration has not opened yet.",
  REGISTRATION_CLOSED: "Registration for this event has closed.",
};

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  if (hasCustomEventPage(slug)) redirect(eventHref(slug));
  const found = await getPublicEvent(slug);
  if (!found) notFound();
  const { event, window, placesLeft } = found;
  const timeTbc = isTimeToBeConfirmed(event.startsAt, event.endsAt);
  const poster = await getEventPoster(event);
  const sameDay = formatNairobi(event.startsAt, { dateStyle: "short" }) === formatNairobi(event.endsAt, { dateStyle: "short" });
  const closedMessage =
    event.status === "cancelled" ? "This event has been cancelled." :
    event.status === "completed" ? "This event has concluded. Thank you to everyone who joined us." :
    window === "REGISTRATION_NOT_OPEN" && event.registrationOpensAt ? `Registration opens ${formatNairobi(event.registrationOpensAt, { dateStyle: "medium", timeStyle: "short" })}.` :
    CLOSED_MESSAGES[window];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt.toISOString(),
    endDate: event.endsAt.toISOString(),
    eventStatus: event.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    eventAttendanceMode: event.location ? "https://schema.org/OfflineEventAttendanceMode" : "https://schema.org/OnlineEventAttendanceMode",
    ...(event.location ? { location: { "@type": "Place", name: event.location, address: event.location } } : {}),
    organizer: { "@type": "Organization", name: "Greenwave Society", url: APP_CONFIG.url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 pt-28 pb-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_400px]">
            <article>
              <Link href="/events" className="text-sm font-semibold text-primary hover:underline">← All events</Link>
              <h1 className="mt-4 font-serif text-4xl font-black leading-tight sm:text-5xl">{event.title}</h1>
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-primary" /><div><dt className="sr-only">Date</dt><dd>{formatNairobi(event.startsAt, { dateStyle: "full" })}</dd></div></div>
                <div className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-primary" /><div><dt className="sr-only">Time</dt><dd>{timeTbc ? "Time to be confirmed" : <>{formatNairobi(event.startsAt, { timeStyle: "short" })} – {sameDay ? formatNairobi(event.endsAt, { timeStyle: "short" }) : formatNairobi(event.endsAt, { dateStyle: "medium", timeStyle: "short" })} (Nairobi time)</>}</dd></div></div>
                {event.location && <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><div><dt className="sr-only">Location</dt><dd>{event.location}</dd></div></div>}
                {event.virtualUrl && <div className="flex items-start gap-2"><Video className="mt-0.5 h-4 w-4 text-primary" /><div><dt className="sr-only">Online</dt><dd>Online link shared after registration</dd></div></div>}
                {placesLeft !== null && event.status === "published" && <div className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 text-primary" /><div><dt className="sr-only">Places</dt><dd>{placesLeft > 0 ? `${placesLeft} place${placesLeft === 1 ? "" : "s"} left` : "Fully booked: join the waiting list"}</dd></div></div>}
              </dl>
              <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/85">{event.description}</div>
              {poster && (
                <div className="relative mt-8 w-full max-w-md overflow-hidden rounded-2xl border border-primary/10" style={{ aspectRatio: `${poster.width} / ${poster.height}` }}>
                  <Image src={poster.src} alt={poster.alt} fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover" />
                </div>
              )}
            </article>
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <EventRegistrationForm slug={event.slug} closedMessage={closedMessage} fullyBooked={placesLeft === 0} />
              {event.status === "published" && (
                <div className="mt-4">
                  <ShareEventLink url={`${APP_CONFIG.url}/events/${event.slug}`} title={event.title} />
                </div>
              )}
            </aside>
          </div>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

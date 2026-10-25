/**
 * Calendar Link and ICS Generator for Greenwave Society Events
 */

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startsAt: string; // ISO 8601 string
  endsAt: string;   // ISO 8601 string
  url?: string;
}

export function formatUtcToCalendarString(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const startStr = formatUtcToCalendarString(event.startsAt);
  const endStr = formatUtcToCalendarString(event.endsAt);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: `${event.description}${event.url ? `\n\nMore details: ${event.url}` : ""}`,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarUrl(event: CalendarEventData): string {
  const start = new Date(event.startsAt).toISOString();
  const end = new Date(event.endsAt).toISOString();
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: start,
    enddt: end,
    subject: event.title,
    body: `${event.description}${event.url ? `\n\n${event.url}` : ""}`,
    location: event.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function getYahooCalendarUrl(event: CalendarEventData): string {
  const startStr = formatUtcToCalendarString(event.startsAt);
  const endStr = formatUtcToCalendarString(event.endsAt);
  const params = new URLSearchParams({
    v: "60",
    title: event.title,
    st: startStr,
    et: endStr,
    desc: `${event.description}${event.url ? `\n\n${event.url}` : ""}`,
    in_loc: event.location,
  });
  return `https://calendar.yahoo.com/?${params.toString()}`;
}

export function generateIcsContent(event: CalendarEventData): string {
  const startStr = formatUtcToCalendarString(event.startsAt);
  const endStr = formatUtcToCalendarString(event.endsAt);
  const nowStr = formatUtcToCalendarString(new Date().toISOString());

  // Escape special characters in iCal text
  const cleanSummary = event.title.replace(/[,;\\]/g, "\\$&");
  const cleanDescription = event.description.replace(/\n/g, "\\n").replace(/[,;\\]/g, "\\$&");
  const cleanLocation = event.location.replace(/[,;\\]/g, "\\$&");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Greenwave Society//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:greenwave-${Date.now()}@greenwavesociety.org`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    event.url ? `URL:${event.url}` : "",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

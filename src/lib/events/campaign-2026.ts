// November–December 2026 fundraising and community engagement campaign, from the event posters and
// the COO's strategy deck. Trivia & Games Night (18 Nov) is created by hand in the admin, so it is
// not listed here, but importing publishes its draft. Venues and most start times were not decided
// when the posters were made: those events have no location (nothing venue-related is shown) and
// use the "time to be confirmed" convention (00:00–23:59 Nairobi, see isTimeToBeConfirmed); admins
// fill them in with "Edit details" once confirmed.
export const CAMPAIGN_CONTACT = "+254 700 519 130";

export interface CampaignEvent {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD in Africa/Nairobi
  startTime?: string; // HH:mm; omitted when the time is still to be confirmed
  endTime?: string;
  description: string;
}

export const CAMPAIGN_2026_EVENTS: CampaignEvent[] = [
  {
    slug: "charity-walk",
    title: "Greenwave Charity Walk",
    date: "2026-11-22",
    description: `Walk with us for conservation, healthy living and accessible green spaces, then stay for a short environmental awareness session on conservation, air pollution and the importance of accessible green spaces.

Open to fitness enthusiasts, environmental advocates, students, families, community groups and corporate teams.

Tickets: KSh 500 · with T-shirt KSh 1,000 · corporate team package KSh 10,000.
Questions: ${CAMPAIGN_CONTACT}`,
  },
  {
    slug: "young-entrepreneurs-networking-brunch",
    title: "Young Entrepreneurs Networking Brunch",
    date: "2026-11-29",
    startTime: "09:00",
    endTime: "12:00",
    description: `Meet founders, mentors and potential investors over brunch. Guest speaker, structured networking and a business pitching session.

Programme
9:00 Registration and breakfast
9:30 Opening and introduction to Greenwave
9:45 Guest speaker: entrepreneurship and opportunity
10:15 Entrepreneur experience-sharing
10:45 Structured networking
11:15 Business pitching session
11:45 Partnership opportunities and closing

Tickets: KSh 1,000 · VIP KSh 1,500 · exhibitor booth KSh 2,000.
Questions: ${CAMPAIGN_CONTACT}`,
  },
  {
    slug: "skills-for-change-workshop",
    title: "Skills for Change Workshop",
    date: "2026-12-05",
    description: `A practical youth skills workshop on entrepreneurship and business development, digital skills and employability, and leadership, communication and community development. Participants receive a certificate of participation.

For university and college students, job seekers, young entrepreneurs, young professionals and community groups.

Tickets: KSh 500 per participant.
Questions: ${CAMPAIGN_CONTACT}`,
  },
  {
    slug: "sports-tournament",
    title: "Greenwave Sports Tournament",
    date: "2026-12-12",
    description: `Football, teamwork and community. Enter your team or come and cheer from the sidelines.

Open to university sports clubs, community football teams, youth groups and corporate teams.

Tickets: KSh 3,000 per team · spectators KSh 100.
Questions: ${CAMPAIGN_CONTACT}`,
  },
  {
    slug: "community-picnic",
    title: "Greenwave Community Picnic",
    date: "2026-12-19",
    description: `Our end of year gathering. Music, outdoor games, poetry and open mic, food and small business stalls. Close the year with the Greenwave community and hear about our achievements and plans for 2027.

Tickets: KSh 500 · couples KSh 800 · vendor booth KSh 2,000.
Questions: ${CAMPAIGN_CONTACT}`,
  },
];

// Posters live in public/posters/campaign-2026 and are shown on the event pages.
export const EVENT_POSTERS: Record<string, { src: string; alt: string }> = {
  "charity-walk": { src: "/posters/campaign-2026/charity-walk.jpg", alt: "Greenwave Charity Walk poster, Sunday 22 November 2026" },
  "young-entrepreneurs-networking-brunch": { src: "/posters/campaign-2026/young-entrepreneurs-networking-brunch.jpg", alt: "Young Entrepreneurs Networking Brunch poster, Sunday 29 November 2026, 9:00 AM to 12:00 PM" },
  "skills-for-change-workshop": { src: "/posters/campaign-2026/skills-for-change-workshop.jpg", alt: "Skills for Change Workshop poster, Saturday 5 December 2026" },
  "sports-tournament": { src: "/posters/campaign-2026/sports-tournament.jpg", alt: "Greenwave Sports Tournament poster, Saturday 12 December 2026" },
  "community-picnic": { src: "/posters/campaign-2026/community-picnic.jpg", alt: "Greenwave Community Picnic poster, Saturday 19 December 2026" },
};

const TRIVIA_POSTER = { src: "/posters/campaign-2026/trivia-and-games-night.jpg", alt: "Trivia & Games Night poster, Wednesday 18 November 2026" };
export const TRIVIA_DATE = "2026-11-18";

// Posters are cropped above the poster's WHEN / WHERE / TICKETS strip (venue and time were
// placeholders), so they are 1080x1125.
export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1125;

/** The campaign poster for an event: by slug, or the hand-made Trivia night by title and date. */
export function posterFor(event: { slug: string; title: string; startsAt: Date }) {
  if (EVENT_POSTERS[event.slug]) return EVENT_POSTERS[event.slug];
  const nairobiDate = new Date(event.startsAt.getTime() + 3 * 3_600_000).toISOString().slice(0, 10);
  return /trivia/i.test(event.title) && nairobiDate === TRIVIA_DATE ? TRIVIA_POSTER : undefined;
}

export const VOLUNTEER_POSTER = { src: "/posters/campaign-2026/volunteer-call.jpg", alt: "Call for volunteers: six Greenwave community events, November to December 2026" };

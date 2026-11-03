import crypto from "crypto";

export interface VerifiedGraduand {
  id: string;
  slug: string;
  fullName: string;
  email: string | null;
  phone?: string;
  credentialId: string;
  ticketNumber: string;
  certificateUrl: string;
  pdfUrl: string;
  accessToken: string;
  pod: string;
  capstoneTitle: string;
  conferredAt: string;
}

// Secret salt for deterministic, unguessable access tokens
const TOKEN_SECRET = process.env.CERTIFICATE_TOKEN_SECRET || "gws-ypg-cohort1-cert-salt-2026";

function generateGraduandToken(slug: string, credentialId: string): string {
  return crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${slug}:${credentialId}:ypg-cohort-1`)
    .digest("hex")
    .slice(0, 32);
}

export const VERIFIED_GRADUANDS_DATA = [
  {
    id: "grad-01",
    slug: "victor-frankline",
    fullName: "Victor Frankline",
    email: "victorfrankline40@gmail.com",
    phone: "+254748592515",
    credentialId: "GWS-YPG-2026-001",
    ticketNumber: "GW-YPG-VF01",
    pod: "Regenerative Economics Pod",
    capstoneTitle: "Decentralized Waste Diversion & Community Circular Economy Hubs",
  },
  {
    id: "grad-02",
    slug: "meek-amani",
    fullName: "Meek Amani",
    email: "meekpeace1o1@gmail.com",
    phone: "0702234976",
    credentialId: "GWS-YPG-2026-002",
    ticketNumber: "GW-YPG-MA02",
    pod: "Systems Dynamics & Climate Pod",
    capstoneTitle: "Grassroots Climate Literacy & Participatory Environmental Mapping",
  },
  {
    id: "grad-03",
    slug: "faith-mwaka",
    fullName: "Faith Mwaka",
    email: "lelefaey@gmail.com",
    phone: "0757811721",
    credentialId: "GWS-YPG-2026-003",
    ticketNumber: "GW-YPG-FM03",
    pod: "Community Wellbeing Pod",
    capstoneTitle: "Youth Mental Health Barazas & Safe Space Circles",
  },
  {
    id: "grad-04",
    slug: "nicole-akoya",
    fullName: "Nicole Akoya",
    email: "nikkitawendy004@gmail.com",
    phone: "+254111763237",
    credentialId: "GWS-YPG-2026-004",
    ticketNumber: "GW-YPG-NA04",
    pod: "Systems Dynamics & Climate Pod",
    capstoneTitle: "Grassroots Climate Literacy & Participatory Environmental Mapping",
  },
  {
    id: "grad-05",
    slug: "stanley-museti",
    fullName: "Stanley Museti",
    email: "info.stanleymuseti@gmail.com",
    phone: "0715238785",
    credentialId: "GWS-YPG-2026-005",
    ticketNumber: "GW-YPG-SM05",
    pod: "Regenerative Economics Pod",
    capstoneTitle: "Decentralized Waste Diversion & Community Circular Economy Hubs",
  },
  {
    id: "grad-06",
    slug: "gladys-kiiru",
    fullName: "Gladys Kiiru",
    email: "kiirug22@gmail.com",
    phone: "0796276104",
    credentialId: "GWS-YPG-2026-006",
    ticketNumber: "GW-YPG-GK06",
    pod: "Community Wellbeing Pod",
    capstoneTitle: "Youth Mental Health Barazas & Safe Space Circles",
  },
  {
    id: "grad-07",
    slug: "ron-mulamba",
    fullName: "Ron Mulamba",
    email: "ronshallom@gmail.com",
    phone: "+254703436741",
    credentialId: "GWS-YPG-2026-007",
    ticketNumber: "GW-YPG-RM07",
    pod: "Regenerative Economics Pod",
    capstoneTitle: "Decentralized Waste Diversion & Community Circular Economy Hubs",
  },
  {
    id: "grad-08",
    slug: "james-mwangi",
    fullName: "James Mwangi",
    email: "mwangijames8300@gmail.com",
    phone: "+254 0740 633967",
    credentialId: "GWS-YPG-2026-008",
    ticketNumber: "GW-YPG-JM08",
    pod: "Systems Dynamics & Climate Pod",
    capstoneTitle: "Grassroots Climate Literacy & Participatory Environmental Mapping",
  },
  {
    id: "grad-09",
    slug: "simon-wachira",
    fullName: "Simon Wachira",
    email: "mbuguasimon261@gmail.com",
    phone: "+254791486820",
    credentialId: "GWS-YPG-2026-009",
    ticketNumber: "GW-YPG-SW09",
    pod: "Systems Dynamics & Climate Pod",
    capstoneTitle: "Grassroots Climate Literacy & Participatory Environmental Mapping",
  },
  {
    id: "grad-10",
    slug: "jeremiah-muuo",
    fullName: "Jeremiah Muuo",
    email: null, // Pending input from user
    phone: undefined,
    credentialId: "GWS-YPG-2026-010",
    ticketNumber: "GW-YPG-JM10",
    pod: "Regenerative Economics Pod",
    capstoneTitle: "Decentralized Waste Diversion & Community Circular Economy Hubs",
  },
  {
    id: "grad-11",
    slug: "elifet-ouma",
    fullName: "Elifet Ouma",
    email: null, // Pending input from user
    phone: undefined,
    credentialId: "GWS-YPG-2026-011",
    ticketNumber: "GW-YPG-EO11",
    pod: "Systems Dynamics & Climate Pod",
    capstoneTitle: "Grassroots Climate Literacy & Participatory Environmental Mapping",
  },
  {
    id: "grad-12",
    slug: "grace-immaculate",
    fullName: "Grace Immaculate",
    email: null, // Pending input from user
    phone: undefined,
    credentialId: "GWS-YPG-2026-012",
    ticketNumber: "GW-YPG-GI12",
    pod: "Community Wellbeing Pod",
    capstoneTitle: "Youth Mental Health Barazas & Safe Space Circles",
  },
];

export const VERIFIED_GRADUANDS: VerifiedGraduand[] = VERIFIED_GRADUANDS_DATA.map((item) => {
  const token = generateGraduandToken(item.slug, item.credentialId);
  return {
    ...item,
    certificateUrl: `/certificates/cohort-1/canonical/${item.slug}.png`,
    pdfUrl: `/certificates/cohort-1/canonical/${item.slug}.pdf`,
    accessToken: token,
    conferredAt: "Friday, 30th October 2026",
  };
});

/**
 * Finds a verified graduand by email address (case-insensitive)
 */
export function findGraduandByEmail(email: string): VerifiedGraduand | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return VERIFIED_GRADUANDS.find((g) => g.email && g.email.toLowerCase() === normalized) || null;
}

/**
 * Finds a verified graduand by secure access token
 */
export function findGraduandByToken(token: string): VerifiedGraduand | null {
  if (!token) return null;
  const clean = token.trim();
  return VERIFIED_GRADUANDS.find((g) => g.accessToken === clean) || null;
}

/**
 * Finds a verified graduand by slug or credentialId
 */
export function findGraduandBySlugOrId(idOrSlug: string): VerifiedGraduand | null {
  if (!idOrSlug) return null;
  const clean = idOrSlug.trim().toLowerCase();
  return (
    VERIFIED_GRADUANDS.find(
      (g) =>
        g.slug.toLowerCase() === clean ||
        g.credentialId.toLowerCase() === clean ||
        g.ticketNumber.toLowerCase() === clean
    ) || null
  );
}

/**
 * Validates whether an email belongs to a certified graduand
 */
export function isCertifiedGraduandEmail(email: string): boolean {
  return findGraduandByEmail(email) !== null;
}

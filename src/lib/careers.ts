import { getDb } from "@/lib/db";

export const CAREER_ROLES = {
  "external-communications-lead": {
    title: "External Communications Lead",
    focus: "Communications oversight and external voice",
    summary: "Oversee organization-wide communications and lead how our story reaches external audiences.",
    purpose: "Provide overall direction for communications across Greenwave Society, own our external voice, and keep messages to members, partners, and the public accurate and consistent.",
    responsibilities: ["Set organization-wide communications direction and standards.", "Own communication across all social-media platforms.", "Coordinate content, newsletters, media relations, event publicity, and crisis communication.", "Work with the Internal Communications Assistant to align internal and external messages.", "Provide meeting coverage and make communications decisions within the role mandate."],
    question: "Tell us about a time you shaped an external message, campaign, or public narrative. What did you consider and what changed because of your work?",
  },
  "internal-communications-assistant": {
    title: "Internal Communications Assistant",
    focus: "Member communication and team support",
    summary: "Keep members informed, messages well structured, and communication moving when the team needs coverage.",
    purpose: "Support the External Communications Lead by translating decisions into clear member updates, coordinating internal communication, and providing dependable meeting coverage.",
    responsibilities: ["Prepare clear internal updates in the correct format and channel.", "Translate leadership decisions and timelines into useful member messages.", "Route members’ questions and ideas to communications and leadership.", "Coordinate meeting notices, summaries, and follow-ups.", "Maintain communication templates, schedules, and coverage."],
    question: "Imagine members leave a meeting with different understandings of a decision. How would you turn the discussion into one clear and useful internal update?",
  },
  "partnerships-lead": {
    title: "Partnerships Lead",
    focus: "Partnerships and resource mobilization",
    summary: "Build trusted relationships that unlock programs, resources, funding, and practical impact.",
    purpose: "Represent Greenwave Society to potential partners, funders, donors, and collaborators, moving aligned relationships from first conversation through delivery.",
    responsibilities: ["Identify and manage relationships with aligned external partners.", "Coordinate partners, executive leadership, and internal project teams.", "Seek funding, donations, in-kind support, and other resources.", "Prepare proposals and organize commitments and follow-ups.", "Negotiate and sign agreements with executive oversight."],
    question: "Tell us how you would approach a potential partner whose mission aligns with Greenwave Society but who has never worked with us before.",
  },
} as const;

export type CareerSlug = keyof typeof CAREER_ROLES;
export const CAREER_SLUGS = Object.keys(CAREER_ROLES) as CareerSlug[];
export function isCareerSlug(value: string): value is CareerSlug { return value in CAREER_ROLES; }

export async function ensureCareerRoles() {
  const db = getDb();
  await Promise.all(CAREER_SLUGS.map((slug) => db.careerRole.upsert({ where: { slug }, update: { title: CAREER_ROLES[slug].title }, create: { slug, title: CAREER_ROLES[slug].title } })));
}

export async function getCareerRoleStatuses() {
  await ensureCareerRoles();
  return getDb().careerRole.findMany({ orderBy: { title: "asc" } });
}

export async function isCareerRoleOpen(slug: CareerSlug) {
  await ensureCareerRoles();
  return (await getDb().careerRole.findUnique({ where: { slug }, select: { isOpen: true } }))?.isOpen === true;
}

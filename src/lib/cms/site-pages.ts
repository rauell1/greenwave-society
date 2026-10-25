import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";
import { IMPACT_STATS } from "@/config/app.config";
import type { CONTENT_TYPES } from "./content";

export interface SitePageDefinition {
  type: (typeof CONTENT_TYPES)[number];
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export const DEFAULT_SITE_PAGES: SitePageDefinition[] = [
  {
    type: "page",
    slug: "homepage-hero",
    title: "Turning systems thinking into community change",
    excerpt: "Greenwave Society is a youth-led social enterprise and think tank in Kenya.",
    body: "Greenwave Society is a youth-led social enterprise and think tank in Kenya. We translate complex systems into simple, practical action: enterprise training, community barazas, conservation, and knowledge-driven partnerships that put young people at the centre.",
    metadata: {
      badge: "Social Enterprise • Think Tank • Kenya",
      primaryCtaText: "Join Our Mission",
      primaryCtaHref: "/contact?interest=volunteer",
      secondaryCtaText: "Learn More",
      secondaryCtaHref: "/about",
    },
  },
  {
    type: "page",
    slug: "about-us",
    title: "Mission, Vision & Global Alignment",
    excerpt: "We exist to translate systems thinking into everyday action: equipping young Kenyans to diagnose challenges and build enterprises.",
    body: "We exist to translate systems thinking into everyday action: equipping young Kenyans to diagnose the challenges in their communities, build enterprises that outlast donor cycles, and lead change from the ground up.\n\nWe are transitioning from a non-governmental model to a self-sustaining social enterprise, reducing dependency on donor funding and building an organisation that generates its own impact and value. Our vision is a generation of equipped, confident young Kenyans: leading enterprises, applying systems thinking in their communities, and driving lasting change from the ground up.",
    metadata: {
      quote: "We exist to translate systems thinking into everyday action: equipping young Kenyans to diagnose the challenges in their communities, build enterprises that outlast donor cycles, and lead change from the ground up.",
    },
  },
  {
    type: "page",
    slug: "our-programs",
    title: "Our Programs & Initiatives",
    excerpt: "Six interconnected programmes, from social enterprise training to environmental action, all working together to equip Kenya's youth.",
    body: "Six interconnected programmes, from social enterprise training to environmental action, all working together to equip Kenya's youth with the skills, leadership, and community connection to create lasting change.",
  },
  {
    type: "page",
    slug: "volunteer-cta",
    title: "Become a Volunteer Today",
    excerpt: "Join a growing network of young Kenyans creating real impact.",
    body: "Join a growing network of young Kenyans who are doing real things: leading systems thinking sessions, organising community barazas, planting trees, running clean-ups, and building an organisation that sustains itself. There is a role here for you.",
    metadata: {
      ctaText: "Sign Up to Volunteer",
      ctaHref: "/contact?interest=volunteer",
    },
  },
  {
    type: "page",
    slug: "our-team",
    title: "Meet the People Behind the Mission",
    excerpt: "Our dedicated founder, executive team, and creatives work tirelessly across Kenya.",
    body: "Our dedicated founder and executive team work tirelessly to design, implement, and govern impactful programs that empower youth and secure environmental resilience across Kenya.",
  },
  {
    type: "page",
    slug: "contact-us",
    title: "Contact Us",
    excerpt: "Have a question, want to volunteer, or interested in partnering with us? We promise to get back to you within 24 hours.",
    body: "Have a question, want to volunteer, or interested in partnering with us? We would love to hear from you. We promise to get back to you within 24 hours.",
  },
  {
    type: "page",
    slug: "media-kit",
    title: "Greenwave Media Kit & Brand Assets",
    excerpt: "Official press kit, brand guidelines, verified statistics, and organizational boilerplates.",
    body: "Greenwave Society is a youth-led social enterprise and think tank in Nairobi, Kenya. We equip young Kenyans aged 18-35 to lead, build, and connect by closing the gaps in skills, opportunity, and wellbeing through enterprise training, environmental action, and community-led programmes.",
  },
  {
    type: "impact",
    slug: "impact-stats",
    title: "Our Verified Impact Metrics",
    excerpt: "Measurable outcomes across youth leadership, conservation, and community development across Kenya.",
    body: "Through community barazas, systems thinking fellowship training, and grassroots action, Greenwave Society has directly transformed communities across Kenya.",
    metadata: {
      ...IMPACT_STATS,
    },
  },
  {
    type: "story",
    slug: "empower360-cohort-1-graduation",
    title: "Empower 360 Ad Hoc Cohort I Graduation Ceremony & Community Market",
    excerpt: "Join us on Friday, 30th October 2026 at Ubunifu Hub, Nairobi to celebrate our inaugural cohort of youth changemakers.",
    body: "Greenwave Society is proud to announce the graduation of Empower 360 Ad Hoc Cohort I changemakers on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.\n\nThe celebration features formal completion certificates recognizing systems thinking and youth leadership execution, capstone project pitches addressing climate literacy, youth employment, and mental health barazas, and an artisanal concurrent community market.\n\nAdmission is free and family, friends, and community partners are warmly welcome to attend and support our graduands.",
    metadata: {
      eventDate: "2026-10-30",
      venue: "Ubunifu Hub, Nairobi",
      rsvpLink: "/events/graduation-cohort-1",
    },
  },
  {
    type: "story",
    slug: "community-market",
    title: "Community Market & Eco-Conscious Vendor Showcase",
    excerpt: "Showcase your sustainable products, healthy snacks, books, and lifestyle creations on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.",
    body: "Calling all eco-conscious vendors, sustainable artisans, healthy snack creators, authors, and ethical brands! Join the community marketplace running alongside the Empower 360 Cohort I Graduation on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.\n\nTables and chairs are provided and stall reservations are completely free. Space is allocated on a first-come, first-served basis.",
    metadata: {
      eventDate: "2026-10-30",
      venue: "Ubunifu Hub, Nairobi",
      vendorPortal: "/events/community-market",
    },
  },
  {
    type: "program",
    slug: "program-50-percent",
    title: "The 50 Percent: Social Enterprise",
    excerpt: "Our flagship social enterprise and systems thinking fellowship.",
    body: "Our flagship social enterprise and systems thinking fellowship. We train youth aged 18-35 to map systemic challenges, starting with the employment and skills-mismatch crisis, translate complex concepts into plain language, and build solutions their communities actually understand and own.",
    metadata: {
      tags: ["Flagship", "Social Enterprise", "Skills Training"],
      icon: "TrendingUp",
      order: 1,
    },
  },
  {
    type: "program",
    slug: "program-youth-pulse",
    title: "Youth Pulse Program",
    excerpt: "A youth-volunteer initiative centred on intergenerational connection, mental health, and community accountability.",
    body: "A youth-volunteer initiative centred on intergenerational connection, mental health, and community accountability. The Youth Pulse Program organises community barazas, peer support sessions, and cross-pod collaboration that bring young Kenyans together to build shared responsibility and drive grassroots change.",
    metadata: {
      tags: ["Volunteers", "Mental Health", "Intergenerational"],
      icon: "HeartHandshake",
      order: 2,
    },
  },
  {
    type: "program",
    slug: "program-climate-action",
    title: "Climate Action & Advocacy Training",
    excerpt: "Hands-on workshops that apply systems thinking to climate and ecology.",
    body: "Hands-on workshops that apply systems thinking to climate and ecology, helping youth understand the structures driving environmental crises and advocate for policy and community-level change using language that resonates with real people, not just experts.",
    metadata: {
      tags: ["Workshops", "School Programs", "Climate Literacy"],
      icon: "GraduationCap",
      order: 3,
    },
  },
  {
    type: "program",
    slug: "program-conservation",
    title: "Conservation & Restoration",
    excerpt: "From tree-planting with Tatu City to community clean-ups and habitat restoration.",
    body: "From tree-planting with Tatu City to community clean-ups at JCK and habitat restoration, our conservation work directly protects local ecosystems while giving young people real-world project leadership experience, skills, and accountability that no classroom can replicate.",
    metadata: {
      tags: ["Tree Planting", "Clean-ups", "Habitat Restoration"],
      icon: "TreePine",
      order: 4,
    },
  },
  {
    type: "program",
    slug: "program-empower-360",
    title: "Empower 360: Youth Leadership & Mentorship",
    excerpt: "Through our Empower 360 programme, we build leadership capacity through mentorship and systems thinking.",
    body: "Through our Empower 360 programme, we build leadership capacity through mentorship, systems thinking training, and rotating meeting leadership so every member develops facilitation and critical thinking skills. Our inaugural Ad Hoc Cohort I changemakers lead community projects, manage budgets, and drive real-world transformation.",
    metadata: {
      tags: ["Empower 360", "Leadership", "Mentorship", "Cohort I"],
      icon: "HandHeart",
      ctaText: "Cohort I Graduation & Market (Oct 30)",
      ctaHref: "/events/graduation-cohort-1",
      order: 5,
    },
  },
  {
    type: "program",
    slug: "program-sustainability",
    title: "Sustainability & Urban Resilience",
    excerpt: "As a social enterprise, we design sustainable models that reduce donor dependency.",
    body: "As a social enterprise, we design sustainable models that reduce donor dependency: from lean programme delivery and shared community infrastructure to tiered revenue strategies that keep our work going long after grants run out.",
    metadata: {
      tags: ["Urban Planning", "Ecosystem Design", "Community Resilience"],
      icon: "Sprout",
      order: 6,
    },
  },
];

/**
 * Ensures all default pages, programs, and editorial sections exist in CmsContent.
 * Missing entries are automatically seeded with status: "published" so that:
 * 1. The admin immediately sees all live site copy under /admin/content.
 * 2. Any new content added in code in the future is automatically registered and editable in the CMS.
 * 3. Existing edits made by admins are NEVER overwritten.
 */
export async function ensureDefaultSiteContentSeeded(): Promise<void> {
  const db = getDb();
  try {
    const admin = await db.adminUser.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!admin) return;

    // Check which default entries already exist
    const existing = await db.cmsContent.findMany({
      where: {
        OR: DEFAULT_SITE_PAGES.map((p) => ({
          type: p.type,
          slug: p.slug,
        })),
      },
      select: { type: true, slug: true },
    });

    const existingSet = new Set(existing.map((e) => `${e.type}:${e.slug}`));
    const toInsert = DEFAULT_SITE_PAGES.filter(
      (p) => !existingSet.has(`${p.type}:${p.slug}`)
    );

    if (toInsert.length === 0) return;

    for (const item of toInsert) {
      const metadata = item.metadata ? JSON.stringify(item.metadata) : null;
      await db.cmsContent.create({
        data: {
          type: item.type,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          body: item.body,
          metadata,
          status: "published",
          version: 1,
          publishedAt: new Date(),
          createdById: admin.id,
          updatedById: admin.id,
          revisions: {
            create: {
              version: 1,
              title: item.title,
              excerpt: item.excerpt,
              body: item.body,
              metadata,
              status: "published",
              createdById: admin.id,
            },
          },
        },
      });
    }

    logger.info(`Auto-seeded ${toInsert.length} site content entries into CMS.`);
  } catch (error) {
    logger.warn("Could not ensure default site content seeded", { error: String(error) });
  }
}

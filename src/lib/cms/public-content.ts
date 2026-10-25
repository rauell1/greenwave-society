import "server-only";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { IMPACT_STATS } from "@/config/app.config";
import { DEFAULT_ACTIVITIES, type Activity } from "./activity-defaults";
import { activityMetadataSchema, impactStatsSchema, type ImpactStats } from "./content";
import { DEFAULT_SITE_PAGES } from "./site-pages";
import { logger } from "@/lib/logger";

function parseMetadata(value: string | null): Record<string, unknown> | null {
  try {
    return value ? (JSON.parse(value) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export interface CmsPageContent {
  title: string;
  excerpt?: string | null;
  body: string;
  metadata?: Record<string, unknown> | null;
}

export interface PublicHomepageContent {
  impact: ImpactStats;
  activities: Activity[];
  hero: {
    title: string;
    body: string;
    badge?: string;
    primaryCtaText?: string;
    primaryCtaHref?: string;
    secondaryCtaText?: string;
    secondaryCtaHref?: string;
  };
  about: {
    title: string;
    quote: string;
    body: string;
  };
  programsSection: {
    title: string;
    body: string;
  };
  volunteerCta: {
    title: string;
    body: string;
    ctaText?: string;
    ctaHref?: string;
  };
  team: {
    title: string;
    body: string;
  };
  contact: {
    title: string;
    body: string;
  };
  programs: Record<
    string,
    {
      title: string;
      desc: string;
      tags: string[];
      cta?: { text: string; href: string };
    }
  >;
}

const defaultHeroPage = DEFAULT_SITE_PAGES.find((p) => p.slug === "homepage-hero")!;
const defaultAboutPage = DEFAULT_SITE_PAGES.find((p) => p.slug === "about-us")!;
const defaultProgramsPage = DEFAULT_SITE_PAGES.find((p) => p.slug === "our-programs")!;
const defaultVolunteerPage = DEFAULT_SITE_PAGES.find((p) => p.slug === "volunteer-cta")!;
const defaultTeamPage = DEFAULT_SITE_PAGES.find((p) => p.slug === "our-team")!;
const defaultContactPage = DEFAULT_SITE_PAGES.find((p) => p.slug === "contact-us")!;

const defaultProgramItems: Record<
  string,
  { title: string; desc: string; tags: string[]; cta?: { text: string; href: string } }
> = {
  programEmpower: {
    title: "Empower 360: Youth Leadership & Mentorship",
    desc: "Our flagship youth leadership and mentorship initiative. Through Empower 360, we build leadership capacity through mentorship, systems thinking training, and rotating meeting leadership so every member develops facilitation and critical thinking skills. Our inaugural Ad Hoc Cohort I changemakers lead community projects, manage budgets, and drive real-world transformation.",
    tags: ["Flagship", "Empower 360", "Leadership", "Cohort I"],
    cta: {
      text: "Cohort I Graduation & Market (Oct 30)",
      href: "/events/graduation-cohort-1",
    },
  },
  programIntergenerational: {
    title: "Intergenerational Summit",
    desc: "A signature policy dialogue and mentorship convening connecting Kenya's youth changemakers with seasoned civic, environmental, and industry leaders to co-create sustainable community solutions.",
    tags: ["Signature Program", "Policy Dialogue", "Mentorship"],
  },
  programSystemsThinking: {
    title: "Young Person's Guide to Systems Thinking",
    desc: "Ad hoc training in partnership with The 50 Percent. We equip youth aged 18-35 to map complex root causes, understand interconnected systemic challenges, and design actionable community-owned solutions.",
    tags: ["In Partnership with The 50 Percent", "Systems Thinking", "Ad Hoc Training"],
  },
  programConservation: {
    title: "Conservation & Restoration",
    desc: "From tree-planting with Tatu City to community clean-ups with Jessie K and the Nairobi County Environment and habitat restoration, our conservation work directly protects local ecosystems while giving young people real-world project leadership experience, skills, and accountability that no classroom can replicate.",
    tags: ["Tree Planting", "Clean-ups", "Habitat Restoration"],
  },
  programYouthPulse: {
    title: "Youth Pulse Program",
    desc: "A youth-volunteer initiative centred on intergenerational connection, mental health, and community accountability. The Youth Pulse Program organises community barazas, peer support sessions, and cross-pod collaboration that bring young Kenyans together to build shared responsibility and drive grassroots change.",
    tags: ["Volunteers", "Mental Health", "Intergenerational"],
  },
  programResilience: {
    title: "Sustainability & Urban Resilience",
    desc: "As a social enterprise, we design sustainable models that reduce donor dependency: from lean programme delivery and shared community infrastructure to tiered revenue strategies that keep our work going long after grants run out.",
    tags: ["Urban Planning", "Ecosystem Design", "Community Resilience"],
  },
  // Legacy aliases
  programEnterprise: {
    title: "Young Person's Guide to Systems Thinking",
    desc: "Ad hoc training in partnership with The 50 Percent. We equip youth aged 18-35 to map complex root causes, understand interconnected systemic challenges, and design actionable community-owned solutions.",
    tags: ["In Partnership with The 50 Percent", "Systems Thinking", "Ad Hoc Training"],
  },
  programClimate: {
    title: "Intergenerational Summit",
    desc: "A signature policy dialogue and mentorship convening connecting Kenya's youth changemakers with seasoned civic, environmental, and industry leaders to co-create sustainable community solutions.",
    tags: ["Signature Program", "Policy Dialogue", "Mentorship"],
  },
};

const slugToProgramKey: Record<string, string> = {
  "program-empower-360": "programEmpower",
  "program-intergenerational-summit": "programIntergenerational",
  "program-systems-thinking": "programSystemsThinking",
  "program-conservation": "programConservation",
  "program-youth-pulse": "programYouthPulse",
  "program-sustainability": "programResilience",
  // Legacy aliases
  "program-50-percent": "programSystemsThinking",
  "program-climate-action": "programIntergenerational",
};

export const getPublicHomepageContent = cache(async (): Promise<PublicHomepageContent> => {
  const fallback: PublicHomepageContent = {
    impact: { ...IMPACT_STATS },
    activities: DEFAULT_ACTIVITIES,
    hero: {
      title: defaultHeroPage.title,
      body: defaultHeroPage.body,
      badge: String(defaultHeroPage.metadata?.badge ?? "Social Enterprise • Think Tank • Kenya"),
      primaryCtaText: String(defaultHeroPage.metadata?.primaryCtaText ?? "Join Our Mission"),
      primaryCtaHref: String(defaultHeroPage.metadata?.primaryCtaHref ?? "/contact?interest=volunteer"),
      secondaryCtaText: String(defaultHeroPage.metadata?.secondaryCtaText ?? "Learn More"),
      secondaryCtaHref: String(defaultHeroPage.metadata?.secondaryCtaHref ?? "/about"),
    },
    about: {
      title: defaultAboutPage.title,
      quote: String(
        defaultAboutPage.metadata?.quote ??
          "We exist to translate systems thinking into everyday action: equipping young Kenyans to diagnose the challenges in their communities, build enterprises that outlast donor cycles, and lead change from the ground up."
      ),
      body: defaultAboutPage.body,
    },
    programsSection: {
      title: defaultProgramsPage.title,
      body: defaultProgramsPage.body,
    },
    volunteerCta: {
      title: defaultVolunteerPage.title,
      body: defaultVolunteerPage.body,
      ctaText: String(defaultVolunteerPage.metadata?.ctaText ?? "Sign Up to Volunteer"),
      ctaHref: String(defaultVolunteerPage.metadata?.ctaHref ?? "/contact?interest=volunteer"),
    },
    team: {
      title: defaultTeamPage?.title || "Meet the People Behind the Mission",
      body:
        defaultTeamPage?.body ||
        "Our dedicated founder and executive team work tirelessly to design, implement, and govern impactful programs that empower youth and secure environmental resilience across Kenya.",
    },
    contact: {
      title: defaultContactPage?.title || "Contact Us",
      body:
        defaultContactPage?.body ||
        "Have a question, want to volunteer, or interested in partnering with us? We would love to hear from you. We promise to get back to you within 24 hours.",
    },
    programs: { ...defaultProgramItems },
  };

  try {
    const entries = await getDb().cmsContent.findMany({
      where: {
        type: { in: ["activity", "impact", "page", "program"] },
        status: "published",
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: { type: true, slug: true, title: true, excerpt: true, body: true, metadata: true },
    });

    const result = { ...fallback, programs: { ...fallback.programs } };

    // 1. Impact Stats
    const impactEntry = entries.find((e) => e.type === "impact" && e.slug === "impact-stats");
    if (impactEntry) {
      const parsed = impactStatsSchema.safeParse(parseMetadata(impactEntry.metadata));
      if (parsed.success) result.impact = parsed.data;
    }

    // 2. Activities
    const activities = entries
      .flatMap((entry) => {
        if (entry.type !== "activity") return [];
        const metadata = activityMetadataSchema.safeParse(parseMetadata(entry.metadata));
        if (!metadata.success) return [];
        return [
          {
            title: entry.title,
            desc: entry.excerpt || entry.body,
            date: metadata.data.date,
            type: metadata.data.category,
            mediaUrl: metadata.data.mediaUrl,
          },
        ];
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12);
    if (activities.length > 0) result.activities = activities;

    // 3. Hero Section
    const heroEntry = entries.find((e) => e.type === "page" && e.slug === "homepage-hero");
    if (heroEntry) {
      const meta = parseMetadata(heroEntry.metadata);
      result.hero = {
        title: heroEntry.title || fallback.hero.title,
        body: heroEntry.body || fallback.hero.body,
        badge: typeof meta?.badge === "string" ? meta.badge : fallback.hero.badge,
        primaryCtaText: typeof meta?.primaryCtaText === "string" ? meta.primaryCtaText : fallback.hero.primaryCtaText,
        primaryCtaHref: typeof meta?.primaryCtaHref === "string" ? meta.primaryCtaHref : fallback.hero.primaryCtaHref,
        secondaryCtaText: typeof meta?.secondaryCtaText === "string" ? meta.secondaryCtaText : fallback.hero.secondaryCtaText,
        secondaryCtaHref: typeof meta?.secondaryCtaHref === "string" ? meta.secondaryCtaHref : fallback.hero.secondaryCtaHref,
      };
    }

    // 4. About Section
    const aboutEntry = entries.find((e) => e.type === "page" && e.slug === "about-us");
    if (aboutEntry) {
      const meta = parseMetadata(aboutEntry.metadata);
      result.about = {
        title: aboutEntry.title || fallback.about.title,
        quote: typeof meta?.quote === "string" ? meta.quote : (aboutEntry.excerpt || fallback.about.quote),
        body: aboutEntry.body || fallback.about.body,
      };
    }

    // 5. Programs Section Header
    const programsEntry = entries.find((e) => e.type === "page" && e.slug === "our-programs");
    if (programsEntry) {
      result.programsSection = {
        title: programsEntry.title || fallback.programsSection.title,
        body: programsEntry.body || fallback.programsSection.body,
      };
    }

    // 6. Individual Programs
    for (const entry of entries) {
      if (entry.type === "program" && slugToProgramKey[entry.slug]) {
        const key = slugToProgramKey[entry.slug];
        const meta = parseMetadata(entry.metadata);
        const tags = Array.isArray(meta?.tags) ? (meta.tags as string[]) : fallback.programs[key].tags;
        result.programs[key] = {
          title: entry.title || fallback.programs[key].title,
          desc: entry.body || fallback.programs[key].desc,
          tags,
          cta: fallback.programs[key].cta,
        };
      }
    }

    // 7. Volunteer CTA
    const volunteerEntry = entries.find((e) => e.type === "page" && e.slug === "volunteer-cta");
    if (volunteerEntry) {
      const meta = parseMetadata(volunteerEntry.metadata);
      result.volunteerCta = {
        title: volunteerEntry.title || fallback.volunteerCta.title,
        body: volunteerEntry.body || fallback.volunteerCta.body,
        ctaText: typeof meta?.ctaText === "string" ? meta.ctaText : fallback.volunteerCta.ctaText,
        ctaHref: typeof meta?.ctaHref === "string" ? meta.ctaHref : fallback.volunteerCta.ctaHref,
      };
    }

    // 8. Team Section
    const teamEntry = entries.find((e) => e.type === "page" && e.slug === "our-team");
    if (teamEntry) {
      result.team = {
        title: teamEntry.title || fallback.team.title,
        body: teamEntry.body || fallback.team.body,
      };
    }

    // 9. Contact Section
    const contactEntry = entries.find((e) => e.type === "page" && e.slug === "contact-us");
    if (contactEntry) {
      result.contact = {
        title: contactEntry.title || fallback.contact.title,
        body: contactEntry.body || fallback.contact.body,
      };
    }

    return result;
  } catch (error) {
    logger.error("Unable to load published homepage content", error as Error);
    return fallback;
  }
});

/**
 * Loads published content for any page or section by slug, with fallback.
 */
export const getPublicPageContent = cache(
  async (slug: string, fallback: CmsPageContent): Promise<CmsPageContent> => {
    try {
      const entry = await getDb().cmsContent.findFirst({
        where: {
          slug,
          status: "published",
          publishedAt: { not: null },
        },
        select: { title: true, excerpt: true, body: true, metadata: true },
      });
      if (!entry) return fallback;
      return {
        title: entry.title || fallback.title,
        excerpt: entry.excerpt ?? fallback.excerpt,
        body: entry.body || fallback.body,
        metadata: parseMetadata(entry.metadata) ?? fallback.metadata,
      };
    } catch (error) {
      logger.warn(`Could not load CMS page content for slug '${slug}', using fallback`, {
        error: String(error),
      });
      return fallback;
    }
  }
);

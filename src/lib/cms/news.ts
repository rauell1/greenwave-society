import "server-only";
import { getDb } from "@/lib/db";
import { NEWS_CONTENT_TYPES } from "./content";
import { logger } from "@/lib/logger";

export interface PublicArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  metadata: string | null;
  status: string;
  type: string;
  publishedAt: Date | null;
  updatedAt: Date;
  imageUrl?: string;
  category?: string;
  readTime?: string;
  author?: string;
}

export const DEFAULT_NEWS_ARTICLES: PublicArticle[] = [
  {
    id: "news-ypg-grad-2026",
    slug: "ypg-cohort-1-graduation-historic-milestone",
    title: "YPG Cohort I Concludes with Historic 26-Changemaker Graduation & Zero-Plastic Market",
    excerpt: "On Friday, 30th October 2026, Greenwave Society conferred honors upon 26 youth leaders at Ubunifu Hub, Nairobi, alongside launching our self-hosted 296-photo interactive archive.",
    category: "Convocation",
    readTime: "4 min read",
    author: "Greenwave Society Communications",
    imageUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp",
    publishedAt: new Date("2026-11-01T09:00:00Z"),
    updatedAt: new Date("2026-11-01T09:00:00Z"),
    type: "article",
    status: "published",
    metadata: JSON.stringify({
      featured: true,
      category: "Convocation",
      readTime: "4 min read",
      author: "Greenwave Society Communications",
      imageUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_290.webp",
    }),
    body: `### A Defining Milestone for Youth-Led Systems Thinking in Kenya

On Friday, 30th October 2026, the auditoriums and grounds of Ubunifu Hub in Nairobi came alive as Greenwave Society celebrated the official graduation of **YPG Cohort I: Young Person's Guide to Systems Change**.

Twenty-six young changemakers aged 18 to 35 formally received their completion certificates following six months of intensive, hands-on training delivered in collaboration with **The 50 Percent**. Moving far beyond traditional classroom theory, the curriculum challenged each fellow to diagnose complex, interconnected root causes of ecological and socio-economic vulnerability in Nairobi and secondary towns.

#### Capstone Pitches Translating Theory into Community Action

The hallmark of the morning convocation was the capstone showcase, where fellow-led project teams presented high-impact community solutions:

* **Grassroots Climate Literacy:** Mobile workshops delivering participatory environmental mapping to peri-urban community schools.
* **Decentralized Waste Diversion:** Neighborhood circular collection models connecting local organic and dry recyclers to reduce informal dumping.
* **Youth Mental Health Barazas:** Peer-led safe-space dialogues addressing youth anxiety, burnout, and emotional resilience.

#### Concurrent Zero Single-Use Plastic Community Market

Complementing the ceremony in the courtyard, Greenwave Society hosted its curated **Community Market**, connecting eco-conscious crafters, local authors, and sustainable culinary artisans with hundreds of attendees. Under our strict zero single-use plastic standard, vendors demonstrated that ethical commerce and community gatherings can operate with minimal ecological footprints.

#### Complete 296-Photograph Self-Hosted Archive

To celebrate and preserve these authentic memories, Greenwave Society has deployed a dedicated, high-speed interactive photo album powered by our high-performance CDN:

* **[Explore the Official 296-Photo Album](/events/graduation-cohort-1/album)**
* **[Read the Full Convocation Retrospective](/events/graduation-cohort-1)**

All 26 graduates now enter Greenwave's active changemaker alumni directory, unlocking ongoing mentorship, seed incubation, and civic partnership opportunities across Kenya.`,
  },
  {
    id: "news-ypg-cohort-2-apps",
    slug: "systems-change-mentorship-cohort-2-applications",
    title: "Applications Open for 2027 Young Person's Guide to Systems Change Mentorship",
    excerpt: "Building on the momentum of Cohort I, Greenwave Society and The 50 Percent announce the 2027 cohort intake for emerging changemakers aged 18-35 across Kenya.",
    category: "Announcements",
    readTime: "3 min read",
    author: "Leadership Development Secretariat",
    imageUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_002.webp",
    publishedAt: new Date("2026-11-02T10:00:00Z"),
    updatedAt: new Date("2026-11-02T10:00:00Z"),
    type: "announcement",
    status: "published",
    metadata: JSON.stringify({
      featured: true,
      category: "Announcements",
      readTime: "3 min read",
      author: "Leadership Development Secretariat",
      imageUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_002.webp",
    }),
    body: `### Equipping the Next Generation of Systemic Changemakers

Following the certification of our inaugural cohort, Greenwave Society, in strategic partnership with **The 50 Percent**, is proud to announce open applications for the **2027 Young Person's Guide to Systems Change Fellowship (Cohort II)**.

In a rapidly evolving world facing compounding climate emergencies and youth underemployment, piecemeal solutions are no longer sufficient. This six-month leadership fellowship equips emerging young Kenyans with the mental models, tools, and social enterprise frameworks required to tackle systemic bottlenecks.

#### What Fellows Learn and Practice

1. **Systemic Root-Cause Mapping:** Learn to identify leverage points within complex civic, environmental, and economic ecosystems.
2. **Rotating Democratic Governance:** Unlike traditional lecture programs, fellows rotate chairing pod meetings, facilitating peer debates, and managing actual operational budgets.
3. **Actionable Community Capstones:** Work in interdisciplinary pods to co-create solutions with grassroots community partners, from urban greening to vocational mentorship.
4. **Social Enterprise Resilience:** Design models that diminish reliance on erratic donor grant cycles by delivering tangible community value.

#### Who Should Apply?

* Young Kenyans aged **18 to 35** residing in Nairobi, Kiambu, Machakos, Kajiado, or surrounding counties.
* Community organizers, youth group leaders, social entrepreneurs, climate advocates, and civic innovators.
* Individuals committed to attending bi-weekly sessions, active pod leadership, and executing a capstone project.

#### Key Dates and Application Link

* **Applications Close:** 15th December 2026
* **Cohort Selection & Interviews:** January 2027
* **Fellowship Onboarding:** February 2027

To apply, visit our **[Membership & Program Application Portal](/join)** or review our **[Programs Overview](/programs)**.`,
  },
  {
    id: "news-suicide-prevention-recap",
    slug: "world-suicide-prevention-month-baraza-recap",
    title: "Youth Mental Health Baraza Unites Community for Suicide Prevention Month",
    excerpt: "Reflections from Greenwave Society's safe-space mental health circle breaking stigma, providing peer crisis support, and anchoring communal healing in Nairobi.",
    category: "Community Wellbeing",
    readTime: "5 min read",
    author: "Youth Pulse Wellbeing Pod",
    imageUrl: "/images/g-3.jpg",
    publishedAt: new Date("2026-10-05T08:30:00Z"),
    updatedAt: new Date("2026-10-05T08:30:00Z"),
    type: "story",
    status: "published",
    metadata: JSON.stringify({
      category: "Community Wellbeing",
      readTime: "5 min read",
      author: "Youth Pulse Wellbeing Pod",
      imageUrl: "/images/g-3.jpg",
    }),
    body: `### Breaking the Silence: Communal Care Over Isolation

In observance of World Suicide Prevention Month, Greenwave Society hosted a dedicated, safe-space community baraza in Nairobi uniting over 40 youth, mental health peer advocates, and community leaders.

In Kenya, conversations surrounding emotional distress, clinical depression, and suicidal ideation are too often stifled by cultural silence, misunderstanding, or fear of judgment. The circle offered an open, non-judgmental environment for young people to share lived experiences, express vulnerabilities, and learn actionable peer-support techniques.

#### Core Insights from the Circle

* **Destigmatizing Vulnerability:** Emotional struggle is not personal failure. Recognizing distress signals early in friends, colleagues, and family members is vital.
* **The Power of Active Listening:** Listening without rushing to provide unsolicited advice creates safe spaces where healing begins.
* **Establishing Community Care Networks:** Beyond institutional clinical resources, strong peer-support networks within residential pods serve as critical first lines of defense.

#### Emergency Hotlines & Ongoing Resources

If you or someone you know is undergoing emotional crisis, immediate help is available:

* **Befrienders Kenya 24/7 Helpline:** +254 722 178 177
* **Niskize Helpline:** 0900 620 800
* **Chiromo Hospital Group Crisis Line:** +254 729 333 444
* **Kenya Red Cross Toll-Free:** 1199

Greenwave Society continues this work year-round through our **[Youth Pulse Program](/programs)**, hosting monthly community barazas and peer wellness sessions.`,
  },
  {
    id: "news-tatu-city-trees",
    slug: "tatu-city-conservation-drive-10000-trees",
    title: "Tatu City & Nairobi County Conservation Drive Surpasses 10,000 Indigenous Trees",
    excerpt: "Youth volunteers across Kiambu and Nairobi unite in habitat restoration, soil stabilization, and biodiversity corridors.",
    category: "Conservation",
    readTime: "4 min read",
    author: "Environmental Action Pod",
    imageUrl: "/images/20250404_134843.jpg",
    publishedAt: new Date("2026-08-20T11:00:00Z"),
    updatedAt: new Date("2026-08-20T11:00:00Z"),
    type: "story",
    status: "published",
    metadata: JSON.stringify({
      category: "Conservation",
      readTime: "4 min read",
      author: "Environmental Action Pod",
      imageUrl: "/images/20250404_134843.jpg",
    }),
    body: `### Restoring Urban Ecosystems Through Youth Ownership

In partnership with Tatu City and the Nairobi County Environment Directorate, Greenwave Society has officially surpassed **10,000 indigenous trees planted and monitored** across degraded riparian zones and school compound greenbelts.

Tree-planting drives often suffer from low seedling survival rates when planting days end without structured post-care. Greenwave Society approaches ecological restoration with a systems lens: every planting exercise is tied to a local youth pod that assumes direct responsibility for mulching, watering, and monitoring sapling health.

#### Key Milestones Achieved

* **10,000+ Indigenous Seedlings Planted:** Focusing on drought-resilient, native species such as *Acacia xanthophloea*, *Croton megalocarpus*, and *Warburgia ugandensis*.
* **Over 85% Monitored Survival Rate:** Sustained through pod-based monthly maintenance checks and school green club partnerships.
* **Hands-On Leadership Experience:** More than 200 young volunteers gained practical field skills in land restoration, soil enrichment, and environmental stewardship.

To join our upcoming weekend conservation activities, explore our **[Activities Timeline](/programs#activities)** or register as a **[Greenwave Volunteer](/contact?interest=volunteer)**.`,
  },
  {
    id: "news-intergen-summit",
    slug: "intergenerational-summit-policy-dialogue",
    title: "Intergenerational Summit 2026: Youth Voices Shaping Kenya's Ecological Policy",
    excerpt: "Connecting emerging youth changemakers with seasoned policy, environmental, and civic leaders to co-create sustainable grassroots solutions.",
    category: "Policy Dialogue",
    readTime: "5 min read",
    author: "Policy & Think Tank Team",
    imageUrl: "/images/20241214_142822.jpg",
    publishedAt: new Date("2026-07-15T09:00:00Z"),
    updatedAt: new Date("2026-07-15T09:00:00Z"),
    type: "article",
    status: "published",
    metadata: JSON.stringify({
      category: "Policy Dialogue",
      readTime: "5 min read",
      author: "Policy & Think Tank Team",
      imageUrl: "/images/20241214_142822.jpg",
    }),
    body: `### Bridging Generations for Lasting Ecological Governance

The annual Greenwave Society **Intergenerational Summit** brought together over 120 participants in Nairobi, creating an intentional bridge between grassroots youth practitioners and veteran policymakers, researchers, and civic leaders.

The dialogue focused on addressing structural barriers that prevent youth-led climate adaptations from reaching policy adoption and institutional funding:

#### Central Themes of the Summit

1. **Democratic Participation:** Moving youth from token attendees to co-architects of local municipal environmental management plans.
2. **Equitable Climate Finance:** Unlocking direct micro-grants for community-level waste diversion and river rehabilitation projects.
3. **Cross-Generational Mentorship:** Pairing emerging enterprise founders with experienced leaders in green manufacturing, clean energy, and public administration.

Read more about our signature policy dialogues in the **[Programs Section](/programs)**.`,
  },
  {
    id: "news-cohort-1-legacy",
    slug: "empower360-cohort-1-graduation",
    title: "YPG: Young Person's Guide to Systems Change Graduation Ceremony & Community Market",
    excerpt: "Celebrated on Friday, 30th October 2026 at Ubunifu Hub, Nairobi: honoring 26 certified youth changemakers in systems thinking.",
    category: "Milestones",
    readTime: "3 min read",
    author: "Greenwave Editorial",
    imageUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_001.webp",
    publishedAt: new Date("2026-10-30T10:30:00Z"),
    updatedAt: new Date("2026-10-30T10:30:00Z"),
    type: "story",
    status: "published",
    metadata: JSON.stringify({
      category: "Milestones",
      readTime: "3 min read",
      author: "Greenwave Editorial",
      imageUrl: "https://cdn.greenwavesociety.org/images/events/graduation-cohort-1/web/graduation_cohort_1_001.webp",
    }),
    body: `Greenwave Society celebrated the graduation of the inaugural **Young Person's Guide to Systems Change (YPG)** cohort on Friday, 30th October 2026 at Ubunifu Hub, Nairobi.

The ceremony featured formal completion certificates recognizing systems thinking and civic leadership execution in partnership with **The 50 Percent**, capstone project pitches addressing climate literacy, youth employment, and mental health barazas, alongside an artisanal zero single-use plastic community market.

Explore the complete retrospective and 296-photo album at **[/events/graduation-cohort-1](/events/graduation-cohort-1)** and **[/events/graduation-cohort-1/album](/events/graduation-cohort-1/album)**.`,
  },
];

function normalizeArticle(item: any): PublicArticle {
  let metaObj: Record<string, any> = {};
  if (item.metadata) {
    try {
      metaObj = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata;
    } catch {
      metaObj = {};
    }
  }

  return {
    id: item.id || `article-${item.slug}`,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt || null,
    body: item.body || "",
    metadata: typeof item.metadata === "string" ? item.metadata : JSON.stringify(item.metadata || {}),
    status: item.status || "published",
    type: item.type || "article",
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    imageUrl: metaObj.imageUrl || metaObj.image || item.imageUrl || "/images/IMG_9415.jpg",
    category: metaObj.category || item.category || "General",
    readTime: metaObj.readTime || item.readTime || "4 min read",
    author: metaObj.author || item.author || "Greenwave Society",
  };
}

export async function getPublishedNews(): Promise<PublicArticle[]> {
  try {
    const dbArticles = await getDb().cmsContent.findMany({
      where: {
        type: { in: [...NEWS_CONTENT_TYPES] },
        status: "published",
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      take: 30,
    });

    const normalizedDb = dbArticles.map(normalizeArticle);
    const existingSlugs = new Set(normalizedDb.map((a) => a.slug));
    const supplemental = DEFAULT_NEWS_ARTICLES.filter((d) => !existingSlugs.has(d.slug));
    const combined = [...normalizedDb, ...supplemental];

    return combined.sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    logger.warn("Database unavailable when fetching news, using curated defaults", { error });
    return DEFAULT_NEWS_ARTICLES;
  }
}

export async function getPublishedArticle(slug: string): Promise<PublicArticle | null> {
  try {
    const dbArticle = await getDb().cmsContent.findFirst({
      where: {
        slug,
        type: { in: [...NEWS_CONTENT_TYPES] },
        status: "published",
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
    });

    if (dbArticle) {
      return normalizeArticle(dbArticle);
    }
  } catch (error) {
    logger.warn("Database unavailable when fetching article by slug, using curated defaults", { slug, error });
  }

  const defaultMatch = DEFAULT_NEWS_ARTICLES.find((a) => a.slug === slug);
  return defaultMatch || null;
}

export function getAllArticleSlugs(): string[] {
  return DEFAULT_NEWS_ARTICLES.map((a) => a.slug);
}

export async function getRelatedArticles(currentSlug: string, limit: number = 3): Promise<PublicArticle[]> {
  const all = await getPublishedNews();
  return all.filter((a) => a.slug !== currentSlug).slice(0, limit);
}

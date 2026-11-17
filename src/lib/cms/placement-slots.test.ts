import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("./repo-images", () => ({ listAllPhotos: vi.fn(async () => []) }));
vi.mock("./public-content", () => ({
  getPublicHomepageContent: vi.fn(async () => ({
    hero: { title: "Turning systems thinking into community change" },
    about: { title: "Mission, Vision & Global Alignment" },
    volunteerCta: { title: "Join the Movement" },
    programs: { programSystemsThinking: { title: "The 50 Percent: Social Enterprise" }, programYouthPulse: { title: "Youth Pulse Program" } },
    activities: [
      { title: "Tree Planting at Karura", date: "2026-05-01", imageUrl: "/images/a.jpg" },
      { title: "Talk without a photo", date: "2026-04-01" },
    ],
  })),
}));
import { getPlacementSlots } from "./placements";
import { activityPlacementKey } from "./placement-keys";

describe("getPlacementSlots", () => {
  it("names slots with the wording the live pages show", async () => {
    const slots = await getPlacementSlots();
    expect(slots.programSystemsThinking.name).toBe('Program card: "The 50 Percent: Social Enterprise"');
    expect(slots.programYouthPulse.name).toBe('Program card: "Youth Pulse Program"');
    expect(slots.about.name).toBe('About section: "Mission, Vision & Global Alignment"');
    expect(slots.volunteer.name).toBe('Volunteer section: "Join the Movement"');
    expect(slots.graduationFeature.route).toBe("/events/graduation-cohort-1");
  });

  it("leaves out slots no page reads and adds one per Activities photo", async () => {
    const slots = await getPlacementSlots();
    for (const unused of ["programs", "graduation", "mediaKit", "programEnterprise", "programClimate"]) expect(slots[unused]).toBeUndefined();
    const key = activityPlacementKey({ title: "Tree Planting at Karura" });
    expect(key).toBe("activity:tree-planting-at-karura");
    expect(slots[key]).toMatchObject({ name: 'Activities timeline: "Tree Planting at Karura"', src: "/images/a.jpg", section: "Recent Activities" });
    expect(slots[activityPlacementKey({ title: "Talk without a photo" })]).toBeUndefined();
  });
});

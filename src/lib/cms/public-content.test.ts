import { beforeEach, describe, expect, it, vi } from "vitest";
import { IMPACT_STATS } from "@/config/app.config";
const mocks = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getDb: () => ({ cmsContent: { findMany: mocks.find } }) }));
import { getPublicHomepageContent } from "./public-content";
beforeEach(() => { vi.clearAllMocks(); });

describe("published homepage content", () => {
  it("uses valid CMS figures and orders activities by event date", async () => {
    mocks.find.mockResolvedValue([
      { type: "impact", slug: "impact-stats", metadata: JSON.stringify({ ...IMPACT_STATS, youthReached: 850 }) },
      ...["2026-01-01", "2026-10-01"].map(date => ({ type: "activity", title: date, excerpt: "Summary", body: "Body", metadata: JSON.stringify({ date, category: "Community", mediaUrl: "/gallery" }) })),
    ]);
    const content = await getPublicHomepageContent();
    expect(content.impact.youthReached).toBe(850);
    expect(content.activities.map(activity => activity.date)).toEqual(["2026-10-01", "2026-01-01"]);
    expect(mocks.find.mock.calls[0][0].where).toMatchObject({ status: "published", publishedAt: { not: null } });
  });
  it("keeps the existing website usable for malformed data and database outages", async () => {
    mocks.find.mockResolvedValue([{ type: "impact", slug: "impact-stats", metadata: "{invalid" }]);
    expect((await getPublicHomepageContent()).impact).toEqual(IMPACT_STATS);
    mocks.find.mockRejectedValue(new Error("offline"));
    expect((await getPublicHomepageContent()).activities.length).toBeGreaterThan(0);
  });
});

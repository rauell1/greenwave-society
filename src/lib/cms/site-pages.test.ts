import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_PAGES, ensureDefaultSiteContentSeeded } from "./site-pages";
import { getPublicPageContent } from "./public-content";

const mocks = vi.hoisted(() => ({
  adminFind: vi.fn(),
  contentFindMany: vi.fn(),
  contentFindFirst: vi.fn(),
  contentCreate: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    adminUser: { findFirst: mocks.adminFind },
    cmsContent: {
      findMany: mocks.contentFindMany,
      findFirst: mocks.contentFindFirst,
      create: mocks.contentCreate,
    },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("site-pages CMS registry and auto-seeder", () => {
  it("defines default site pages covering core sections", () => {
    expect(DEFAULT_SITE_PAGES.length).toBeGreaterThanOrEqual(10);
    const slugs = DEFAULT_SITE_PAGES.map((p) => p.slug);
    expect(slugs).toContain("homepage-hero");
    expect(slugs).toContain("about-us");
    expect(slugs).toContain("our-programs");
    expect(slugs).toContain("volunteer-cta");
    expect(slugs).toContain("impact-stats");
    expect(slugs).toContain("empower360-cohort-1-graduation");
  });

  it("seeds missing site entries when an active admin exists", async () => {
    mocks.adminFind.mockResolvedValue({ id: "admin-123" });
    // Simulate empty database
    mocks.contentFindMany.mockResolvedValue([]);
    mocks.contentCreate.mockResolvedValue({ id: "new-entry" });

    await ensureDefaultSiteContentSeeded();

    expect(mocks.adminFind).toHaveBeenCalled();
    expect(mocks.contentCreate).toHaveBeenCalledTimes(DEFAULT_SITE_PAGES.length);
    expect(mocks.contentCreate.mock.calls[0][0].data).toMatchObject({
      status: "published",
      createdById: "admin-123",
      updatedById: "admin-123",
    });
  });

  it("does not overwrite entries that already exist in database", async () => {
    mocks.adminFind.mockResolvedValue({ id: "admin-123" });
    // Simulate that all entries already exist
    mocks.contentFindMany.mockResolvedValue(
      DEFAULT_SITE_PAGES.map((p) => ({ type: p.type, slug: p.slug }))
    );

    await ensureDefaultSiteContentSeeded();

    expect(mocks.contentCreate).not.toHaveBeenCalled();
  });

  it("retrieves published page content with fallback", async () => {
    mocks.contentFindFirst.mockResolvedValue({
      title: "Custom Mission Title",
      excerpt: "Custom excerpt",
      body: "Custom body copy",
      metadata: JSON.stringify({ custom: "data" }),
    });

    const fallback = {
      title: "Default Title",
      excerpt: "Default excerpt",
      body: "Default body",
    };

    const result = await getPublicPageContent("about-us", fallback);
    expect(result.title).toBe("Custom Mission Title");
    expect(result.body).toBe("Custom body copy");
    expect(result.metadata).toEqual({ custom: "data" });
  });

  it("falls back gracefully when database is unavailable or entry not found", async () => {
    mocks.contentFindFirst.mockResolvedValue(null);

    const fallback = {
      title: "Default Title",
      excerpt: "Default excerpt",
      body: "Default body",
    };

    const result = await getPublicPageContent("non-existent", fallback);
    expect(result.title).toBe("Default Title");
    expect(result.body).toBe("Default body");
  });
});

import { describe, expect, it, vi } from "vitest";
import {
  CAREER_ROLES,
  CAREER_SLUGS,
  CAREER_ALIASES,
  isCareerSlug,
  normalizeCareerSlug,
  requiresProfileLink,
  ensureCareerRoles,
} from "./careers";

vi.mock("@/lib/db", () => {
  const upsertMock = vi.fn().mockResolvedValue({ id: "mock" });
  return {
    getDb: () => ({
      careerRole: {
        upsert: upsertMock,
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({ isOpen: true }),
      },
    }),
  };
});

describe("Careers system - CFO role and validation", () => {
  it("includes Chief Financial Officer (CFO) in CAREER_ROLES with complete details", () => {
    expect(CAREER_ROLES).toHaveProperty("chief-financial-officer");
    const cfo = CAREER_ROLES["chief-financial-officer"];

    expect(cfo.title).toBe("Chief Financial Officer (CFO)");
    expect(cfo.focus).toBeTruthy();
    expect(cfo.summary).toBeTruthy();
    expect(cfo.purpose).toBeTruthy();
    expect(cfo.responsibilities.length).toBeGreaterThanOrEqual(5);
    expect(cfo.question).toBeTruthy();
    expect(cfo.datePosted).toBe("2026-11-03");
    expect(cfo.engagement).toContain("Executive");
    expect(cfo.meeting).toBeTruthy();
    expect(cfo.reporting).toBeTruthy();
    expect(cfo.rhythm).toBeTruthy();
    expect(requiresProfileLink("chief-financial-officer")).toBe(true);
  });

  it("recognizes chief-financial-officer as a valid career slug", () => {
    expect(isCareerSlug("chief-financial-officer")).toBe(true);
    expect(CAREER_SLUGS).toContain("chief-financial-officer");
  });

  it("normalizes cfo alias to chief-financial-officer", () => {
    expect(CAREER_ALIASES.cfo).toBe("chief-financial-officer");
    expect(normalizeCareerSlug("cfo")).toBe("chief-financial-officer");
    expect(normalizeCareerSlug("chief-financial-officer")).toBe("chief-financial-officer");
    expect(normalizeCareerSlug("invalid-slug")).toBeNull();
  });

  it("ensures every career role title length is <= 31 characters for Excel sheet compatibility", () => {
    for (const slug of CAREER_SLUGS) {
      const title = CAREER_ROLES[slug].title.replace(" Communications", " Comms");
      expect(title.length).toBeLessThanOrEqual(31);
    }
  });

  it("ensures career roles can be upserted to the database", async () => {
    await expect(ensureCareerRoles()).resolves.not.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { contentInputSchema, serializeMetadata, NEWS_CONTENT_TYPES } from "./content";
import { IMPACT_STATS } from "@/config/app.config";

describe("CMS content validation", () => {
  it.each(NEWS_CONTENT_TYPES)("accepts the public news type %s", type => {
    expect(contentInputSchema.safeParse({ type, slug: "community-update", title: "Community update", body: "Our latest work" }).success).toBe(true);
  });
  it("requires valid activity details and complete nonnegative impact figures", () => {
    const activity = { type: "activity", slug: "clean-up", title: "Clean up", body: "Community clean up", metadata: { date: "2026-10-06", category: "Conservation", mediaUrl: "/gallery" } };
    expect(contentInputSchema.safeParse(activity).success).toBe(true);
    expect(contentInputSchema.safeParse({ ...activity, metadata: { ...activity.metadata, mediaUrl: "javascript:alert(1)" } }).success).toBe(false);
    const impact = { type: "impact", slug: "impact-stats", title: "Impact", body: "Our figures", metadata: IMPACT_STATS };
    expect(contentInputSchema.safeParse(impact).success).toBe(true);
    expect(contentInputSchema.safeParse({ ...impact, metadata: { ...IMPACT_STATS, youthReached: -1 } }).success).toBe(false);
  });
  it("accepts a valid draft and serializes metadata", () => {
    const result = contentInputSchema.safeParse({ type: "page", slug: "about-us", title: "About us", body: "Body", metadata: { seoTitle: "About" } });
    expect(result.success).toBe(true);
    expect(serializeMetadata({ seoTitle: "About" })).toBe('{"seoTitle":"About"}');
  });

  it("rejects unsafe slugs and empty bodies", () => {
    expect(contentInputSchema.safeParse({ type: "page", slug: "../about", title: "About", body: "" }).success).toBe(false);
  });
});

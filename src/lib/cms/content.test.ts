import { describe, expect, it } from "vitest";
import { contentInputSchema, serializeMetadata } from "./content";

describe("CMS content validation", () => {
  it("accepts a valid draft and serializes metadata", () => {
    const result = contentInputSchema.safeParse({ type: "page", slug: "about-us", title: "About us", body: "Body", metadata: { seoTitle: "About" } });
    expect(result.success).toBe(true);
    expect(serializeMetadata({ seoTitle: "About" })).toBe('{"seoTitle":"About"}');
  });

  it("rejects unsafe slugs and empty bodies", () => {
    expect(contentInputSchema.safeParse({ type: "page", slug: "../about", title: "About", body: "" }).success).toBe(false);
  });
});

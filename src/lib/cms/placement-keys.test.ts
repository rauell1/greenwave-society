import { describe, expect, it } from "vitest";
import { activityPlacement, activityPlacementKey } from "./placement-keys";

describe("activity placement keys", () => {
  it("keys CMS activities by slug, so renaming one keeps its photo", () => {
    const before = { slug: "ngong-hike-2025", title: "Ngong Hills Conservation Trek" };
    const renamed = { ...before, title: "Ngong Hills Trek & Youth Hike" };
    expect(activityPlacementKey(before)).toBe("activity:ngong-hike-2025");
    const placements = { "activity:ngong-hike-2025": { src: "/media-files/media/hike.webp", alt: "Hike" } };
    expect(activityPlacement(placements, renamed)?.src).toBe("/media-files/media/hike.webp");
  });

  it("keys built-in activities by title", () => {
    expect(activityPlacementKey({ title: "Valentine's Day Youth Wellness Picnic" })).toBe("activity:valentine-s-day-youth-wellness-picnic");
  });

  it("still finds a photo saved under the title before slugs were used", () => {
    const activity = { slug: "picnic-2025", title: "Valentine's Day Youth Wellness Picnic" };
    const placements = { "activity:valentine-s-day-youth-wellness-picnic": { src: "/images/g-12.jpg", alt: "" } };
    expect(activityPlacement(placements, activity)?.src).toBe("/images/g-12.jpg");
  });

  it("prefers the slug-keyed photo and ignores empty values", () => {
    const activity = { slug: "picnic-2025", title: "Picnic" };
    expect(activityPlacement({ "activity:picnic-2025": { src: "/a.jpg" }, "activity:picnic": { src: "/b.jpg" } }, activity)?.src).toBe("/a.jpg");
    expect(activityPlacement({ "activity:picnic-2025": { src: "" } }, activity)).toBeUndefined();
    expect(activityPlacement(undefined, activity)).toBeUndefined();
  });
});

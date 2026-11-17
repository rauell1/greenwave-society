function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Placement slot for an Activities timeline photo. Activities saved in the
 * CMS have a permanent slug, so the photo stays with the activity when its
 * title is edited. Built-in default activities have no slug and use their title.
 */
export function activityPlacementKey(activity: { title: string; slug?: string }): string {
  if (activity.slug) return `activity:${activity.slug}`;
  return `activity:${slugify(activity.title) || "untitled"}`;
}

/** The title-based key used before activities were keyed by slug; still read so earlier saves keep working. */
export function legacyActivityPlacementKey(activity: { title: string }): string {
  return `activity:${slugify(activity.title) || "untitled"}`;
}

/** The photo picked in admin for an activity, if any. */
export function activityPlacement<T extends { src: string }>(
  placements: Record<string, T> | undefined,
  activity: { title: string; slug?: string },
): T | undefined {
  const picked = placements?.[activityPlacementKey(activity)];
  if (picked?.src) return picked;
  const legacy = placements?.[legacyActivityPlacementKey(activity)];
  return legacy?.src ? legacy : undefined;
}

/** Slots no page reads any more; kept for saved data but not offered in admin. */
export const UNUSED_PLACEMENT_SLOTS = new Set(["programs", "graduation", "mediaKit", "programEnterprise", "programClimate"]);

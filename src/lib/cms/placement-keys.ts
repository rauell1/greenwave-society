/**
 * Placement slot for an Activities timeline photo. Activities have no stable
 * id, so the slot follows the activity's title; if the title is edited the
 * activity shows its own image again until a photo is picked for the new title.
 */
export function activityPlacementKey(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `activity:${slug || "untitled"}`;
}

/** Slots no page reads any more; kept for saved data but not offered in admin. */
export const UNUSED_PLACEMENT_SLOTS = new Set(["programs", "graduation", "mediaKit", "programEnterprise", "programClimate"]);

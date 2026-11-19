import "server-only";

import { cache } from "react";
import { getDb } from "@/lib/db";

export const CMS_FEATURES = ["content", "pages", "programs", "events", "members", "media", "communications", "users", "audit"] as const;
export type CmsFeature = (typeof CMS_FEATURES)[number];

function envKey(prefix: string, feature: CmsFeature): string {
  return `${prefix}_${feature.toUpperCase()}`;
}

export const getEnabledCmsFeatures = cache(async (): Promise<CmsFeature[]> => {
  const rows = await getDb().cmsFeatureFlag.findMany({ where: { key: { in: CMS_FEATURES.map((feature) => `cms.${feature}`) } } });
  const stored = new Map(rows.map((row) => [row.key, row.enabled]));
  return CMS_FEATURES.filter((feature) => {
    if (process.env[envKey("DISABLE_CMS", feature)] === "true") return false;
    if (process.env[envKey("FEATURE_CMS", feature)] === "true") return true;
    return stored.get(`cms.${feature}`) ?? feature === "audit";
  });
});

export async function isCmsFeatureEnabled(feature: CmsFeature): Promise<boolean> {
  return (await getEnabledCmsFeatures()).includes(feature);
}

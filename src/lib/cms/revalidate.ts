import "server-only";
import { revalidatePath } from "next/cache";

export function revalidatePublicContent(slug: string) {
  for (const path of [
    "/",
    "/about",
    "/programs",
    "/impact",
    "/news",
    `/news/${slug}`,
    "/events/graduation-cohort-1",
    "/events/community-market",
    "/sitemap.xml",
  ]) {
    revalidatePath(path);
  }
}

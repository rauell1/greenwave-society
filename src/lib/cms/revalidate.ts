import "server-only";
import { revalidatePath } from "next/cache";

export function revalidatePublicContent(slug: string) {
  for (const path of ["/", "/impact", "/news", `/news/${slug}`, "/sitemap.xml"]) revalidatePath(path);
}

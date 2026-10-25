"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function GraduationVendorRedirectHelper() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      const isVendorIntent =
        hash === "#vendor" ||
        hash === "#vendors" ||
        hash === "#stalls" ||
        hash === "#market" ||
        hash === "#vendor-application" ||
        search.get("tab") === "vendor";

      if (isVendorIntent) {
        router.replace("/events/community-market");
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [router]);

  return null;
}

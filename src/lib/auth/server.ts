import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL || "https://ep-gentle-truth-at57i1rh.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "greenwave-society-neon-auth-secret-key-32-chars-minimum!",
  },
});

/**
 * Application Configuration
 *
 * Centralized configuration for the application.
 * All magic numbers, URLs, and constants should be defined here.
 */

export const APP_CONFIG = {
  // Application metadata
  name: "Greenwave Society",
  shortName: "Greenwave",
  description: "Empowering youth holistically to be changemakers and conserve the environment",
  tagline: "Empowering Youth to Be Changemakers",

  // URLs and endpoints
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",

  // Contact information
  contact: {
    email: "info@greenwavesociety.org",
    phone: "+254 700 519 130",
    whatsapp: "254700519130",
    location: "Kenya",
  },

  // Social media links
  social: {
    instagram: "https://instagram.com/green_wavesociety",
    twitter: "https://x.com/greenwaveke",
    facebook: "https://www.facebook.com/share/19byoMf2Re/",
    tiktok: "https://tiktok.com/@greenwave.society",
    linktree: "https://linktr.ee/greenwavesociety",
    linkedin: "https://www.linkedin.com/in/elyjoy-maina-044370244",
  },

  // Feature flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    enableNewsletter: true,
    enableContactForm: true,
    enableDonations: false, // Not yet implemented
  },

  // Rate limiting
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  },

  // Database
  database: {
    poolMin: parseInt(process.env.DB_POOL_MIN || "2", 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || "10", 10),
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
    connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || "2000", 10),
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    sessionSecret: process.env.SESSION_SECRET || "change-this-in-production",
  },
} as const;

/**
 * Impact statistics displayed on the website
 */
export const IMPACT_STATS = {
  youthReached: 500,
  communitiesServed: 25,
  treesPlanted: 10000,
  eventsOrganized: 50,
  workshopsDelivered: 30,
  wasteRecycled: 5, // in tons
} as const;

/**
 * Animation configuration
 */
export const ANIMATION_CONFIG = {
  fadeIn: {
    duration: 0.6,
    ease: "easeOut" as const,
  },
  countUp: {
    step: 25, // milliseconds between increments
    totalDuration: 1500, // total animation duration in ms
  },
  scrollIndicator: {
    duration: 2,
    yOffset: [0, 8, 0],
  },
} as const;

/**
 * UI constants
 */
export const UI_CONFIG = {
  navbar: {
    scrollThreshold: 50, // pixels
    height: 80, // pixels
  },
  scrollToTop: {
    showThreshold: 500, // pixels
  },
  fadeInMargin: "-60px", // intersection observer margin
  formTimeout: {
    success: 4000, // ms to show success message
    error: 4000, // ms to show error message
  },
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
  },
  contactForm: {
    nameMinLength: 2,
    nameMaxLength: 100,
    messageMinLength: 10,
    messageMaxLength: 2000,
  },
  validInterests: ["general", "volunteer", "partner", "donate", "media"] as const,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9ae27e8423695c69a3b2d29d5e2649a2@o4511913956343808.ingest.de.sentry.io/4512039188496464",

  environment: process.env.NODE_ENV,

  // Define how likely traces are sampled. Full sampling in dev; 10% in production:
  // tracing adds CPU time to each request, which counts against the Workers limit.
  // Errors are still reported in full.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // The runtime module hooks are not available on Cloudflare Workers; trying to
  // install them logs "Failed to register diagnostics-channel injection hooks"
  // on every cold start.
  enableRuntimeChannelInjection: false,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

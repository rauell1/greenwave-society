(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__0fl25zo._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/lib/logger.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Structured Logger
 *
 * Provides consistent, structured logging across the application.
 * Includes request context, timestamps, and severity levels.
 */ __turbopack_context__.s([
    "Logger",
    ()=>Logger,
    "logger",
    ()=>logger
]);
class Logger {
    serviceName;
    constructor(serviceName = "greenwave-society"){
        this.serviceName = serviceName;
    }
    formatLog(level, message, context, error) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...context && {
                context: {
                    ...context,
                    service: this.serviceName
                }
            }
        };
        if (error) {
            entry.error = {
                message: error.message,
                name: error.name,
                stack: error.stack
            };
        }
        return entry;
    }
    log(level, message, context, error) {
        const entry = this.formatLog(level, message, context, error);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            // In development, output human-readable logs
            const levelEmoji = {
                debug: "🔍",
                info: "ℹ️",
                warn: "⚠️",
                error: "❌"
            };
            console.log(`${levelEmoji[level]} [${level.toUpperCase()}] ${message}`);
            if (context) console.log("  Context:", context);
            if (error) {
                console.error("  Error:", error.message);
                if (error.stack) console.error(error.stack);
            }
        }
    }
    debug(message, context) {
        if ("TURBOPACK compile-time truthy", 1) {
            this.log("debug", message, context);
        }
    }
    info(message, context) {
        this.log("info", message, context);
    }
    warn(message, context) {
        this.log("warn", message, context);
    }
    error(message, error, context) {
        this.log("error", message, context, error);
    }
    /**
   * Create a child logger with additional context
   */ child(context) {
        const childLogger = new Logger(this.serviceName);
        const originalLog = childLogger.log.bind(childLogger);
        childLogger.log = (level, message, ctx, error)=>{
            originalLog(level, message, {
                ...context,
                ...ctx
            }, error);
        };
        return childLogger;
    }
}
const logger = new Logger();
;
}),
"[project]/src/config/app.config.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Application Configuration
 *
 * Centralized configuration for the application.
 * All magic numbers, URLs, and constants should be defined here.
 */ __turbopack_context__.s([
    "ANIMATION_CONFIG",
    ()=>ANIMATION_CONFIG,
    "APP_CONFIG",
    ()=>APP_CONFIG,
    "IMPACT_STATS",
    ()=>IMPACT_STATS,
    "PAGINATION",
    ()=>PAGINATION,
    "UI_CONFIG",
    ()=>UI_CONFIG,
    "VALIDATION",
    ()=>VALIDATION
]);
const APP_CONFIG = {
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
        location: "Kenya"
    },
    // Social media links
    social: {
        instagram: "https://instagram.com/green_wavesociety",
        twitter: "https://x.com/greenwaveke",
        facebook: "https://www.facebook.com/share/19byoMf2Re/",
        tiktok: "https://tiktok.com/@greenwave.society",
        linktree: "https://linktr.ee/greenwavesociety",
        linkedin: "https://www.linkedin.com/in/elyjoy-maina-044370244"
    },
    // Feature flags
    features: {
        enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
        enableNewsletter: true,
        enableContactForm: true,
        enableDonations: false
    },
    // Rate limiting
    rateLimit: {
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10)
    },
    // Database
    database: {
        poolMin: parseInt(process.env.DB_POOL_MIN || "2", 10),
        poolMax: parseInt(process.env.DB_POOL_MAX || "10", 10),
        idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
        connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || "2000", 10)
    },
    // Security
    security: {
        corsOrigin: process.env.CORS_ORIGIN?.split(",") || [
            "http://localhost:3000"
        ],
        sessionSecret: process.env.SESSION_SECRET || "change-this-in-production"
    }
};
const IMPACT_STATS = {
    youthReached: 500,
    communitiesServed: 25,
    treesPlanted: 10000,
    eventsOrganized: 50,
    workshopsDelivered: 30,
    wasteRecycled: 5
};
const ANIMATION_CONFIG = {
    fadeIn: {
        duration: 0.6,
        ease: "easeOut"
    },
    countUp: {
        step: 25,
        totalDuration: 1500
    },
    scrollIndicator: {
        duration: 2,
        yOffset: [
            0,
            8,
            0
        ]
    }
};
const UI_CONFIG = {
    navbar: {
        scrollThreshold: 50,
        height: 80
    },
    scrollToTop: {
        showThreshold: 500
    },
    fadeInMargin: "-60px",
    formTimeout: {
        success: 4000,
        error: 4000
    }
};
const VALIDATION = {
    email: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        maxLength: 254
    },
    contactForm: {
        nameMinLength: 2,
        nameMaxLength: 100,
        messageMinLength: 10,
        messageMaxLength: 2000
    },
    validInterests: [
        "general",
        "volunteer",
        "partner",
        "donate",
        "media"
    ]
};
const PAGINATION = {
    defaultPageSize: 20,
    maxPageSize: 100
};
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
/**
 * Next.js Middleware
 *
 * Handles security headers, CORS, and request logging.
 * Runs on all requests before reaching route handlers.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logger.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$app$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/app.config.ts [middleware-edge] (ecmascript)");
;
;
;
/**
 * Security headers to add to all responses
 */ function getSecurityHeaders() {
    return {
        // Prevent clickjacking
        "X-Frame-Options": "DENY",
        // Prevent MIME type sniffing
        "X-Content-Type-Options": "nosniff",
        // Enable XSS protection
        "X-XSS-Protection": "1; mode=block",
        // Referrer policy
        "Referrer-Policy": "strict-origin-when-cross-origin",
        // Content Security Policy
        "Content-Security-Policy": [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'"
        ].join("; "),
        // Permissions policy
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    };
}
/**
 * CORS headers for API routes
 */ function getCorsHeaders(origin) {
    const allowedOrigins = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$app$2e$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["APP_CONFIG"].security.corsOrigin;
    const isAllowed = origin && allowedOrigins.includes(origin);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return {
        "Access-Control-Allow-Origin": origin || allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
    };
}
function middleware(request) {
    const startTime = Date.now();
    const { pathname } = request.nextUrl;
    // Handle OPTIONS requests (CORS preflight)
    if (request.method === "OPTIONS") {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            status: 204,
            headers: getCorsHeaders(request.headers.get("origin"))
        });
    }
    // Get response
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value])=>{
        response.headers.set(key, value);
    });
    // Add CORS headers for API routes
    if (pathname.startsWith("/api")) {
        const corsHeaders = getCorsHeaders(request.headers.get("origin"));
        Object.entries(corsHeaders).forEach(([key, value])=>{
            response.headers.set(key, value);
        });
    }
    // Log request (only in production or when debugging)
    if (("TURBOPACK compile-time value", "development") === "production" || process.env.DEBUG_REQUESTS === "true") {
        const duration = Date.now() - startTime;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["logger"].info("Request", {
            method: request.method,
            path: pathname,
            duration: `${duration}ms`,
            userAgent: request.headers.get("user-agent")
        });
    }
    return response;
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */ "/((?!_next/static|_next/image|favicon.ico|images|logo.svg|robots.txt).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0fl25zo._.js.map
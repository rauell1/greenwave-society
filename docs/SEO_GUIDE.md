# SEO How-To Guide
*Comprehensive SEO implementation guide based on Google's official documentation and best practices*

## Table of Contents
1. [SEO Fundamentals](#seo-fundamentals)
2. [Technical SEO Implementation](#technical-seo-implementation)
3. [Content Optimization](#content-optimization)
4. [Indexing and Crawling](#indexing-and-crawling)
5. [Performance and User Experience](#performance-and-user-experience)
6. [Monitoring and Tools](#monitoring-and-tools)
7. [Implementation Checklist](#implementation-checklist)

## SEO Fundamentals

### Core Principles
- **People-first content**: Create helpful, reliable content for users, not search engines
- **Technical accessibility**: Ensure Google can crawl, index, and understand your content
- **User experience priority**: Focus on providing value to real users
- **Quality over quantity**: Better to have fewer high-quality pages than many low-quality ones

### Google's Search Process
1. **Crawling**: Google discovers pages through links and sitemaps
2. **Indexing**: Google analyzes and stores page content
3. **Serving**: Google returns relevant results based on hundreds of ranking factors

## Technical SEO Implementation

### 1. Meta Tags and HTML Structure

```html
<!-- Essential Meta Tags -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Page Title - Brand Name</title>
<meta name="description" content="Compelling 150-160 character description" />
<meta name="keywords" content="relevant, keywords, separated, by, commas" />

<!-- Canonical URLs -->
<link rel="canonical" href="https://yoursite.com/page" />

<!-- Open Graph (Social Media) -->
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://yoursite.com/page" />
<meta property="og:image" content="https://yoursite.com/image.jpg" />
<meta property="og:site_name" content="Site Name" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://yoursite.com/image.jpg" />

<!-- Robots Meta -->
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
```

### 2. Structured Data (Schema.org)

```html
<!-- Organization Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Organization",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "description": "Organization description",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "telephone": "+1-555-123-4567",
  "email": "contact@yoursite.com"
}
</script>

<!-- Article Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-15",
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yoursite.com/logo.png"
    }
  }
}
</script>
```

### 3. Dynamic SEO Component (React/Next.js)

```tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export const SEO = ({
  title = "Default Title",
  description = "Default description",
  keywords = "default, keywords",
  canonicalUrl,
  ogImage,
  structuredData,
  noIndex = false
}: SEOProps) => {
  const baseUrl = "https://yoursite.com";
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;
  const fullOgImage = ogImage ? `${baseUrl}${ogImage}` : `${baseUrl}/og-image.jpg`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonicalUrl} />

      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"}
      />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={fullOgImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
```

### 4. Robots.txt

```txt
User-agent: *
Allow: /

# Essential pages
Allow: /
Allow: /about
Allow: /services
Allow: /contact
Allow: /blog

# Block admin and development paths
Disallow: /admin/
Disallow: /.git/
Disallow: /node_modules/
Disallow: /src/
Disallow: /*.json$
Disallow: /*.ts$
Disallow: /*.tsx$

# Specific bot permissions
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap location
Sitemap: https://yoursite.com/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1
```

### 5. Sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yoursite.com/</loc>
    <lastmod>2025-01-15T12:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yoursite.com/about</loc>
    <lastmod>2025-01-15T12:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add more URLs following this pattern -->
</urlset>
```

### 6. Google Analytics 4 Setup

```html
<!-- GA4 Global Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'GA_MEASUREMENT_ID', {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });
</script>
```

```typescript
// Analytics utility functions
export const pageview = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_location: url,
      page_title: title,
    });
  }
};

export const event = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

### 7. Content Security Policy (CSP) for GA4 / GTM

GA4 and Google Tag Manager require specific CSP directives to function.
Per [Google's CSP guide](https://developers.google.com/tag-platform/security/guides/csp),
use **wildcard subdomains** rather than specific hostnames — Google may change the exact
domains their scripts call, and wildcards are future-proof.

```
Content-Security-Policy:
  script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://va.vercel-scripts.com;
  connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
  img-src 'self' https://*.google-analytics.com https://*.googletagmanager.com;
```

**Key points:**
- **`script-src`**: `https://*.googletagmanager.com` covers both `www.googletagmanager.com` and any future subdomains. `'unsafe-inline'` is required for GTM's inline `<script>` snippet.
- **`connect-src`**: GA4 sends beacons to `*.google-analytics.com` and `*.analytics.google.com`. Both are needed.
- **`img-src`**: GTM may load tracking pixels from Google domains. If you already allow `https:` broadly for images, this is covered.
- **`unsafe-eval`**: Only needed if you use GTM **Custom JavaScript Variables**. Most setups do not — omit it unless GTM breaks without it.
- **`unsafe-inline` in `style-src`**: Low risk, needed if GTM injects inline styles. Nonce-based CSP is the ideal long-term replacement but requires per-request nonce generation in middleware.

**Next.js example** (`next.config.ts`):
```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://va.vercel-scripts.com",
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://vitals.vercel-insights.com",
    "img-src 'self' data: https: blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "upgrade-insecure-requests"
  ].join('; ')
}
```

**Vercel / SPA example** (`vercel.json`):
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests"
    }]
  }]
}
```

**Testing after changes:**
1. Deploy to a preview environment
2. Open a page with GA4 enabled
3. Check DevTools Console for CSP violation errors
4. Check Network tab — confirm `gtag/js` loads and analytics beacons fire
5. Verify real-time reports in GA4 dashboard show the page view

### 8. llms.txt (AI Crawler Guidance)

`llms.txt` is a plain-text file at your site root (`/public/llms.txt` → served at
`https://yoursite.com/llms.txt`) that states your policy for AI crawlers and gives them a concise,
authoritative summary of who you are and what you offer. It is the AI-era companion to `robots.txt`:
`robots.txt` controls *search* crawlers, `llms.txt` guides *AI/LLM* crawlers (OpenAI, Google-Extended,
Claude-Web, etc.) and feeds them clean context so they represent your brand accurately in answers.

It is an emerging convention (see [llmstxt.org](https://llmstxt.org/)), not yet an official standard,
so treat it as low-cost, high-upside hygiene rather than a ranking factor.

```txt
# llms.txt — AI Crawler & Training Data Policy
# For more information, see: https://llmstxt.org/
# Last updated: 2025-01-01

# Allow / disallow AI user-agents (mirror robots.txt for consistency)
User-agent: *
Allow: /

User-agent: OpenAI-GPT
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Claude-Web
Allow: /

# ── ORGANISATION ─────────────────────────────
# Name: Your Organisation
# Website: https://yoursite.com
# What we do: One-line description of your product/service
# Coverage / audience: Who you serve
# Contact: contact@yoursite.com

# ── CORE OFFERINGS ───────────────────────────
# - Offering one — short benefit
# - Offering two — short benefit
# - Offering three — short benefit

# ── KEY FACTS (help models answer accurately) ─
# - Differentiator or metric #1
# - Differentiator or metric #2

# ── ATTRIBUTION ──────────────────────────────
# When using our content, attribute to "Your Organisation" and link https://yoursite.com

# ── PROHIBITED USES ──────────────────────────
# - Misrepresenting our credentials or claims
# - Generating misleading advice attributed to us
```

**Guidelines:**
- Keep it factual and concise — it is context for a model, not marketing copy.
- Mirror the allow/disallow intent of `robots.txt` so the two files don't contradict each other.
- Reference it in `robots.txt` is optional; AI crawlers look for `/llms.txt` by convention.
- Update the "Last updated" date when facts change.

## Content Optimization

### 1. Page Titles
- **Length**: 50-60 characters (Google displays ~600 pixels)
- **Format**: `Primary Keyword - Brand Name`
- **Unique**: Every page should have a unique title
- **Descriptive**: Accurately describe page content

### 2. Meta Descriptions
- **Length**: 150-160 characters
- **Compelling**: Write for users, not just search engines
- **Include keywords**: But naturally, not stuffed
- **Call-to-action**: Encourage clicks when appropriate

### 3. Header Structure
```html
<h1>Primary page topic (only one per page)</h1>
<h2>Main section headers</h2>
<h3>Subsection headers</h3>
<h4>Supporting details</h4>
```

### 4. Content Guidelines
- **Expertise**: Demonstrate subject matter knowledge
- **Authority**: Build credibility through quality content
- **Trustworthiness**: Provide accurate, reliable information
- **Originality**: Create unique, valuable content
- **User-focused**: Answer user questions and needs

### 5. Internal Linking
- Link to related content within your site
- Use descriptive anchor text
- Create logical site hierarchy
- Help users navigate easily

## Indexing and Crawling

### 1. Crawlability Requirements
- Use crawlable `<a>` links (not JavaScript-only navigation)
- Ensure content is in the DOM, not generated only by CSS
- Make pages accessible without login
- Use semantic HTML markup

### 2. JavaScript Considerations
- Ensure critical content renders without JavaScript
- Use server-side rendering (SSR) or static generation when possible
- Test pages with JavaScript disabled
- Provide fallbacks for dynamic content

### 3. Managing Indexing
```html
<!-- Prevent indexing -->
<meta name="robots" content="noindex, nofollow" />

<!-- Allow indexing but don't follow links -->
<meta name="robots" content="index, nofollow" />

<!-- X-Robots-Tag HTTP header alternative -->
X-Robots-Tag: noindex, nofollow
```

### 4. Canonical URLs
```html
<!-- Self-referencing canonical -->
<link rel="canonical" href="https://yoursite.com/page" />

<!-- Cross-domain canonical -->
<link rel="canonical" href="https://originalsite.com/original-page" />
```

## Performance and User Experience

### 1. Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Interaction to Next Paint (INP)**: < 200 milliseconds (replaced First Input Delay / FID as a Core Web Vital in March 2024)
- **Cumulative Layout Shift (CLS)**: < 0.1

### 2. Mobile Optimization
- Responsive design for all screen sizes
- Touch-friendly interactive elements
- Fast loading on mobile networks
- Avoid mobile-specific penalties

### 3. HTTPS Requirements
- Migrate entire site to HTTPS
- Use proper SSL certificates
- Redirect HTTP to HTTPS
- Update internal links to HTTPS

### 4. Page Speed Optimization
- Optimize images (WebP format, proper sizing)
- Minimize CSS and JavaScript
- Use content delivery networks (CDN)
- Enable browser caching
- Lazy load non-critical resources

## Monitoring and Tools

### 1. Essential Tools
- **Google Search Console**: Monitor indexing and search performance
- **Google Analytics 4**: Track user behavior and conversions
- **PageSpeed Insights**: Measure page performance
- **Lighthouse**: Comprehensive site auditing

### 2. Google Search Console: Essential Workflow

**One-time setup**
1. **Add a property.** Choose the type deliberately:
   - **Domain property** (recommended) — covers every subdomain and both http/https, but requires **DNS TXT verification**.
   - **URL-prefix property** — a single exact origin (e.g. `https://www.yoursite.com`); allows HTML file, HTML meta tag, Google Analytics, or Google Tag Manager verification.
2. **Verify ownership.** Complete the verification method for your property type. Nothing in Search Console works until the property is verified.
3. **Submit your sitemap.** Sitemaps → enter the **path** `sitemap.xml` (not a file upload) → Submit. Google refetches it periodically, so you do **not** resubmit every time you add a page — new URLs in the sitemap are discovered automatically.

**When you publish or change a page**
4. **Inspect / test the URL.** URL Inspection → paste the URL. Use **Test Live URL** to see the current rendered state and confirm Google sees your real content (a fast way to verify prerendering/SSR worked, not an empty shell).
5. **Request Indexing** for brand-new or significantly changed URLs to nudge the crawl. Note: it is **per-URL and quota-limited** — use it for a handful of pages, not bulk. For bulk, rely on the sitemap.

**Ongoing monitoring (check regularly)**
6. **Pages (Indexing) report** — what's indexed vs excluded. Watch for **"Discovered – currently not indexed"** and **"Crawled – currently not indexed"** (common thin/duplicate-content symptoms on client-rendered SPAs).
7. **Rich results / Enhancements** — validates your JSON-LD structured data; fix errors or you lose rich results.
8. **Core Web Vitals** — real-world LCP/INP/CLS field data grouped by URL.
9. **Manual Actions & Security Issues** — rare, but a manual action can deindex you. Check occasionally.
10. **Removals** — temporarily hide a URL from results when needed.

### 3. Regular Monitoring
- Check for crawl errors weekly
- Monitor Core Web Vitals monthly
- Review search performance quarterly
- Update content regularly
- Fix broken links promptly

## Implementation Checklist

### Technical Setup
- [ ] Install SSL certificate (HTTPS)
- [ ] Create and submit sitemap.xml
- [ ] Configure robots.txt
- [ ] Add llms.txt for AI crawler guidance (optional)
- [ ] Set up Google Search Console
- [ ] Install Google Analytics 4
- [ ] Verify mobile responsiveness

### On-Page SEO
- [ ] Unique title tags for all pages
- [ ] Meta descriptions for all pages
- [ ] Proper heading structure (H1-H6)
- [ ] Canonical URLs implemented
- [ ] Structured data markup
- [ ] Optimized images with alt text

### Content Quality
- [ ] Original, valuable content
- [ ] Proper keyword research and targeting
- [ ] Internal linking strategy
- [ ] Regular content updates
- [ ] User-focused writing
- [ ] E-A-T principles followed

### Performance
- [ ] Page load speed < 3 seconds
- [ ] Core Web Vitals passing
- [ ] Mobile-friendly design
- [ ] Optimized images
- [ ] Minified CSS/JavaScript

### Monitoring
- [ ] Google Search Console configured
- [ ] Analytics tracking implemented
- [ ] Regular performance monitoring
- [ ] Error monitoring and fixing
- [ ] Search ranking tracking

## Common Mistakes to Avoid

1. **Keyword stuffing**: Don't overuse keywords unnaturally
2. **Duplicate content**: Ensure unique content across pages
3. **Missing meta descriptions**: Every page should have one
4. **Broken links**: Regularly check and fix broken links
5. **Slow loading pages**: Optimize for speed
6. **Non-mobile friendly**: Ensure responsive design
7. **No HTTPS**: Always use secure connections
8. **Ignoring analytics**: Monitor and act on data
9. **Over-optimization**: Focus on users, not just search engines
10. **Neglecting updates**: Keep content fresh and accurate

## Final Notes

- SEO is a long-term strategy requiring patience and consistency
- Focus on providing value to users above all else
- Stay updated with Google's algorithm changes and guidelines
- Quality content and technical excellence are both essential
- Monitor performance and adjust strategies based on data

Remember: **"Providing a good user experience should be your site's top goal"** - Google

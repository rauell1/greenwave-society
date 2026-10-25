import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { APP_CONFIG } from "@/config/app.config";
import { CookieBanner } from "@/components/CookieBanner";
import { ScriptInjector } from "@/components/ScriptInjector";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default: "Greenwave Society | Youth Leadership, Skills & Community Development in Kenya",
    template: "%s | Greenwave Society Kenya",
  },
  description: APP_CONFIG.description,
  authors: [{ name: "Greenwave Society", url: APP_CONFIG.url }],
  creator: "Greenwave Society",
  publisher: "Greenwave Society",
  category: "Youth Empowerment & Environmental Conservation",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: APP_CONFIG.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YopMsxRCWbWYZU_ANAhcwd6ggCeArux5CR37WuXqXXA",
    other: {
      "msvalidate.01": "66CE208CF02793B41D19362E121494C6",
    },
  },
  openGraph: {
    title: "Greenwave Society | Youth Leadership, Skills & Community Development in Kenya",
    description: APP_CONFIG.description,
    url: APP_CONFIG.url,
    siteName: "Greenwave Society",
    images: [
      {
        url: "/images/IMG_9415.jpg",
        width: 1200,
        height: 630,
        alt: "Greenwave Society youth leadership and community development in Kenya",
      },
    ],
    locale: "en_KE",
    alternateLocale: ["en_US", "sw_KE"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenwave Society | Equipping Youth to Lead, Build & Connect in Kenya",
    description: "Closing the gaps in skills, opportunity, and wellbeing for young Kenyans aged 15-35. Enterprise training, conservation, and community-led programmes.",
    images: ["/images/IMG_9415.jpg"],
    creator: "@greenwaveke",
    site: "@greenwaveke",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "EducationalOrganization"],
        "@id": `${APP_CONFIG.url}/#organization`,
        "name": "Greenwave Society",
        "alternateName": ["Greenwave", "Greenwave Kenya"],
        "url": APP_CONFIG.url,
        "logo": {
          "@type": "ImageObject",
          "url": `${APP_CONFIG.url}/logo.png`,
          "width": 512,
          "height": 512,
        },
        "image": `${APP_CONFIG.url}/images/IMG_9415.jpg`,
        "description": APP_CONFIG.description,
        "foundingDate": "2024",
        "areaServed": [
          { "@type": "Country", "name": "Kenya" },
          { "@type": "City", "name": "Nairobi" },
        ],
        "knowsAbout": [
          "Youth empowerment",
          "Social enterprise training",
          "Environmental conservation",
          "Ecosystem restoration",
          "Mental health and wellbeing",
          "Community leadership",
          "Climate action",
          "Skills development",
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Greenwave Society Programmes",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Empower 360: Youth Leadership & Mentorship",
                "description": "Flagship leadership and mentorship initiative equipping young Kenyans with practical facilitation, project governance, and systems-change skills.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Intergenerational Summit",
                "description": "Signature policy dialogue and mentorship convening connecting Kenya's youth changemakers with seasoned civic and industry leaders.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Young Person's Guide to Systems Thinking",
                "description": "Ad hoc training in partnership with The 50 Percent, equipping youth aged 18-35 to map complex systemic challenges and build community solutions.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Conservation & Restoration",
                "description": "Hands-on ecological restoration including tree-planting with Tatu City and community clean-ups with Jessie K and the Nairobi County Environment.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Youth Pulse Program",
                "description": "Youth-volunteer initiative focused on intergenerational connection, mental health awareness, and community accountability.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Sustainability & Urban Resilience",
                "description": "Practical sustainable models reducing donor dependency through lean programme delivery, shared community infrastructure, and ecosystem design.",
              },
            },
          ],
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "KE",
          "addressLocality": "Nairobi",
          "addressRegion": "Nairobi County",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -1.2921,
          "longitude": 36.8219,
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": APP_CONFIG.contact.phone,
            "contactType": "customer support",
            "email": APP_CONFIG.contact.email,
            "availableLanguage": ["English", "Swahili"],
            "areaServed": "KE",
          },
          {
            "@type": "ContactPoint",
            "contactType": "volunteer",
            "url": `${APP_CONFIG.url}/join`,
            "availableLanguage": ["English", "Swahili"],
          },
        ],
        "sameAs": [
          APP_CONFIG.social.instagram,
          APP_CONFIG.social.twitter,
          APP_CONFIG.social.facebook,
          APP_CONFIG.social.tiktok,
          APP_CONFIG.social.linktree,
          APP_CONFIG.social.linkedin,
        ],
        "member": [
          {
            "@type": "Person",
            "@id": `${APP_CONFIG.url}/#martin-kyalo`,
            "name": "Martin Kyalo",
            "jobTitle": "Founder & Chief Executive Officer",
            "sameAs": ["https://www.linkedin.com/in/martin-kyalo-9373982b7/"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${APP_CONFIG.url}/#website`,
        "url": APP_CONFIG.url,
        "name": "Greenwave Society",
        "description": APP_CONFIG.description,
        "publisher": { "@id": `${APP_CONFIG.url}/#organization` },
        "inLanguage": ["en-KE", "sw-KE"],
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${APP_CONFIG.url}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en-KE" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-B54FTH27MB" />
        <script
          id="google-tag-setup"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-B54FTH27MB');
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Geo targeting for Kenya / Nairobi */}
        <meta name="geo.region" content="KE-110" />
        <meta name="geo.placename" content="Nairobi, Kenya" />
        <meta name="geo.position" content="-1.2921;36.8219" />
        <meta name="ICBM" content="-1.2921, 36.8219" />
        <meta name="language" content="English" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      </head>
      <body
        className={`${jakarta.variable} ${playfair.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
        <CookieBanner />
        <ScriptInjector />
      </body>
    </html>
  );
}


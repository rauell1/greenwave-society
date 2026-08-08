import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { APP_CONFIG } from "@/config/app.config";
import { CookieBanner } from "@/components/consent/CookieBanner";

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
  keywords: [
    // Brand
    "Greenwave Society",
    "Greenwave Society Kenya",
    "greenwavesociety.org",
    "Greenwave Kenya",
    // Core mission
    "youth empowerment Kenya",
    "youth empowerment Nairobi",
    "youth leadership Kenya",
    "youth leadership Nairobi",
    "youth development Kenya",
    "youth organisation Kenya",
    "youth NGO Kenya",
    "NGO Nairobi",
    "nonprofit Kenya",
    // Problems addressed
    "skills mismatch Kenya",
    "youth unemployment Kenya",
    "youth unemployment Nairobi",
    "mental health youth Kenya",
    "skills gap Kenya youth",
    "skills training Nairobi",
    // Flagship programmes
    "The 50 Percent social enterprise Kenya",
    "Young People Pulse YPP Kenya",
    "social enterprise training Kenya",
    "enterprise skills training Nairobi",
    "leadership training Kenya",
    "vocational training Nairobi",
    // Environmental
    "environmental conservation Kenya",
    "ecosystem restoration Kenya",
    "tree planting Kenya",
    "conservation Nairobi",
    "climate action youth Kenya",
    "Kangemi restoration Kenya",
    // Community
    "community development Nairobi",
    "community outreach Nairobi",
    "Maangani Primary School Kenya",
    "intergenerational programme Kenya",
    // Volunteer
    "volunteer Kenya",
    "volunteer Nairobi",
    "youth volunteer Kenya",
    // People
    "Martin Kyalo Greenwave",
    "Njeri Njoroge Greenwave",
    "Eugene Shadrack Greenwave",
    // SDG
    "SDG 3 health wellbeing Kenya",
    "SDG 4 education Kenya",
    "SDG 8 decent work Kenya",
    "SDG 13 climate action Kenya",
    "SDG 15 life on land Kenya",
    "UN SDG youth Kenya",
    // General
    "changemakers Kenya",
    "sustainability Kenya",
    "youth social enterprise Africa",
    "Kenya youth programmes",
    "Nairobi youth organisation",
  ],
  authors: [{ name: "Greenwave Society", url: APP_CONFIG.url }],
  creator: "Greenwave Society",
  publisher: "Greenwave Society",
  category: "Youth Empowerment & Environmental Conservation",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
        url: "/images/hero.png",
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
    images: ["/images/hero.png"],
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
        "@type": ["NGO", "Organization"],
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
        "image": `${APP_CONFIG.url}/images/hero.png`,
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
                "name": "The 50 Percent: Social Enterprise",
                "description": "Flagship enterprise-skills training programme addressing unemployment and skills mismatch for youth aged 15-35 in Kenya.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Young People Pulse (YPP)",
                "description": "Youth-volunteer initiative focused on intergenerational connection, mental health awareness, and community accountability.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Climate Action Programme",
                "description": "Direct climate education and advocacy training empowering youth to influence environmental policy across Kenya.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Conservation & Restoration",
                "description": "Hands-on ecological restoration including tree planting, Kangemi riverbank restoration, and school greening projects.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Youth Empowerment Programme",
                "description": "Leadership mentorship, skill-building workshops, and career development for young Kenyans across Nairobi and beyond.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Sustainability Education",
                "description": "Practical sustainable agriculture and eco-literacy curriculum delivered at primary and secondary schools across Kenya.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Geo targeting for Kenya / Nairobi */}
        <meta name="geo.region" content="KE-110" />
        <meta name="geo.placename" content="Nairobi, Kenya" />
        <meta name="geo.position" content="-1.2921;36.8219" />
        <meta name="ICBM" content="-1.2921, 36.8219" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
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
        <CookieBanner />
      </body>
    </html>
  );
}

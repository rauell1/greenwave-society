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
    default: "Greenwave Society | Empowering Youth & Conserving the Environment in Kenya",
    template: "%s | Greenwave Society Kenya",
  },
  description: APP_CONFIG.description,
  keywords: [
    "Greenwave Society",
    "Greenwave Kenya",
    "youth empowerment Kenya",
    "environmental conservation Nairobi",
    "climate action Kenya",
    "sustainability NGO Kenya",
    "tree planting initiative Kenya",
    "community outreach Nairobi",
    "nonprofit Kenya",
    "Maangani Primary School project",
    "Ngong Hike conservation",
    "Martin Kyalo",
    "SDG 13 Climate Action",
    "SDG 15 Life on Land",
  ],
  authors: [{ name: "Greenwave Society", url: APP_CONFIG.url }],
  creator: "Rauell Kyalo",
  publisher: "Greenwave Society",
  category: "Environment & Youth Empowerment",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "./",
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
    title: "Greenwave Society | Empowering Youth & Conserving the Environment",
    description: APP_CONFIG.description,
    url: APP_CONFIG.url,
    siteName: "Greenwave Society",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Greenwave Society environmental conservation action in Kenya",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenwave Society | Youth & Environmental Conservation",
    description: APP_CONFIG.description,
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
  // JSON-LD Organization & WebSite Structured Data Graph
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NGO",
        "@id": `${APP_CONFIG.url}/#organization`,
        "name": "Greenwave Society",
        "alternateName": "Greenwave",
        "url": APP_CONFIG.url,
        "logo": `${APP_CONFIG.url}/logo.png`,
        "image": `${APP_CONFIG.url}/images/hero.png`,
        "description": APP_CONFIG.description,
        "foundingDate": "2024",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "KE",
          "addressLocality": "Nairobi",
          "addressRegion": "Nairobi County",
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": APP_CONFIG.contact.phone,
          "contactType": "Customer Support",
          "email": APP_CONFIG.contact.email,
          "availableLanguage": ["English", "Swahili"],
        },
        "sameAs": [
          APP_CONFIG.social.instagram,
          APP_CONFIG.social.twitter,
          APP_CONFIG.social.facebook,
          APP_CONFIG.social.tiktok,
          APP_CONFIG.social.linktree,
          APP_CONFIG.social.linkedin,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${APP_CONFIG.url}/#website`,
        "url": APP_CONFIG.url,
        "name": "Greenwave Society",
        "description": APP_CONFIG.description,
        "publisher": {
          "@id": `${APP_CONFIG.url}/#organization`,
        },
        "inLanguage": "en-US",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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

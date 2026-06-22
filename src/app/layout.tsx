import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { APP_CONFIG } from "@/config/app.config";

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
    default: "Greenwave Society | Empowering Youth & Conserving the Environment",
    template: "%s | Greenwave Society",
  },
  description: APP_CONFIG.description,
  keywords: [
    "Greenwave Society",
    "youth empowerment",
    "environmental conservation",
    "climate action Kenya",
    "sustainability",
    "community outreach",
    "nonprofit Kenya",
    "Maangani Primary School project",
    "Ngong Hike conservation",
    "Elyjoy Maina",
    "Martin Kyalo",
  ],
  authors: [{ name: "Greenwave Society" }],
  creator: "Rauell Kyalo",
  icons: {
    icon: "/logo.svg",
  },
  alternates: {
    canonical: "./",
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
        alt: "Greenwave Society environmental action",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenwave Society",
    description: APP_CONFIG.description,
    images: ["/images/hero.png"],
    creator: "@greenwaveke",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Organization Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "Greenwave Society",
    "url": APP_CONFIG.url,
    "logo": `${APP_CONFIG.url}/logo.svg`,
    "description": APP_CONFIG.description,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KE",
      "addressLocality": "Nairobi",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": APP_CONFIG.contact.phone,
      "contactType": "General inquiries",
      "email": APP_CONFIG.contact.email,
    },
    "sameAs": [
      APP_CONFIG.social.instagram,
      APP_CONFIG.social.twitter,
      APP_CONFIG.social.facebook,
      APP_CONFIG.social.tiktok,
      APP_CONFIG.social.linktree,
      APP_CONFIG.social.linkedin,
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${jakarta.variable} ${playfair.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

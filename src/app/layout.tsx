/**
 * Root Layout
 *
 * The root layout wraps all pages and provides global configuration.
 * Includes environment validation, fonts, and global components.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Greenwave Society | Empowering Youth & Conserving the Environment",
  description:
    "Greenwave Society empowers youth holistically to be changemakers and conserve the environment. Environmental conservation and climate action in Kenya and beyond.",
  keywords: [
    "Greenwave Society",
    "youth empowerment",
    "environmental conservation",
    "climate action",
    "Kenya",
    "sustainability",
    "community outreach",
    "nonprofit",
  ],
  authors: [{ name: "Greenwave Society" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Greenwave Society | Empowering Youth & Conserving the Environment",
    description:
      "Greenwave Society empowers youth holistically to be changemakers and conserve the environment.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenwave Society",
    description:
      "Empowering Youth & Communities | Environmental Conservation and Climate Action",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

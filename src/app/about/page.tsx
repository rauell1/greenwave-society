import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { About } from "@/components/sections/About";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { APP_CONFIG } from "@/config/app.config";
import { getPublicImagePlacements } from "@/lib/cms/placements";
import { getPublicPageContent } from "@/lib/cms/public-content";
import { DEFAULT_SITE_PAGES } from "@/lib/cms/site-pages";

export const metadata: Metadata = {
  title: "About Greenwave Society | Mission, Vision & Strategy in Kenya",
  description: "Greenwave Society exists to close the gaps that hold young Kenyans back, in skills, opportunity, and wellbeing, by building leaders who serve their communities and drive lasting change. Learn our mission, vision, and four strategic pillars.",
  alternates: {
    canonical: `${APP_CONFIG.url}/about`,
  },
  openGraph: {
    title: "About Greenwave Society | Mission, Vision & Strategy in Kenya",
    description: "We exist to close the gaps that hold young Kenyans back. Discover our mission, four strategic pillars, and the leaders driving change.",
    url: `${APP_CONFIG.url}/about`,
    siteName: "Greenwave Society",
    images: [{ url: "/images/IMG_9415.jpg", width: 1200, height: 630, alt: "About Greenwave Society Kenya mission and vision" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Greenwave Society | Mission, Vision & Strategy",
    description: "Closing the gaps in skills, opportunity, and wellbeing for young Kenyans. Learn our strategy and the team behind the mission.",
    images: ["/images/IMG_9415.jpg"],
  },
};

export const revalidate = 60;

const defaultAbout = DEFAULT_SITE_PAGES.find((p) => p.slug === "about-us")!;

export default async function AboutPage() {
  const placements = await getPublicImagePlacements();
  const cmsContent = await getPublicPageContent("about-us", {
    title: defaultAbout.title,
    excerpt: defaultAbout.excerpt,
    body: defaultAbout.body,
    metadata: defaultAbout.metadata,
  });

  const quote =
    typeof cmsContent.metadata?.quote === "string"
      ? cmsContent.metadata.quote
      : (cmsContent.excerpt || "We exist to translate systems thinking into everyday action: equipping young Kenyans to diagnose the challenges in their communities, build enterprises that outlast donor cycles, and lead change from the ground up.");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${APP_CONFIG.url}/about/#webpage`,
        "url": `${APP_CONFIG.url}/about`,
        "name": "About Greenwave Society | Mission, Vision & Strategy in Kenya",
        "description": "Greenwave Society exists to close the gaps that hold young Kenyans back, in skills, opportunity, and wellbeing, by building leaders who serve their communities and drive lasting change.",
        "isPartOf": { "@id": `${APP_CONFIG.url}/#website` },
        "about": { "@id": `${APP_CONFIG.url}/#organization` },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", "h2", ".mission-text"],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${APP_CONFIG.url}/about/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": APP_CONFIG.url },
          { "@type": "ListItem", "position": 2, "name": "About Us", "item": `${APP_CONFIG.url}/about` },
        ],
      },
      {
        "@type": "Person",
        "@id": `${APP_CONFIG.url}/#martin-kyalo`,
        "name": "Martin Kyalo",
        "jobTitle": "Founder & Chief Executive Officer",
        "description": "Dedicated to designing and implementing impactful environmental programs, steering organizational growth, and uniting volunteers, youth changemakers, and strategic partners across Kenya.",
        "worksFor": { "@id": `${APP_CONFIG.url}/#organization` },
        "sameAs": ["https://www.linkedin.com/in/martin-kyalo-9373982b7/"],
        "knowsAbout": ["Youth empowerment", "Environmental conservation", "Social enterprise", "Community leadership"],
        "nationality": { "@type": "Country", "name": "Kenya" },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <About
          imagePlacement={placements?.about}
          content={{
            title: cmsContent.title,
            quote,
            body: cmsContent.body,
          }}
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

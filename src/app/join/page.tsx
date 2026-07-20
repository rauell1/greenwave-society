import { Metadata } from "next";
import JoinForm from "./JoinForm";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: "Join Us | Become a Member & Changemaker",
  description: "Join Greenwave Society as a member or volunteer. Fill out our membership intake application form and start protecting the environment in Kenya.",
  alternates: {
    canonical: "/join",
  },
};

export default function JoinPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": APP_CONFIG.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Join Us",
        "item": `${APP_CONFIG.url}/join`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <JoinForm />
    </>
  );
}

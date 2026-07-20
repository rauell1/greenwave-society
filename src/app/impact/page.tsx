import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Impact } from "@/components/sections/Impact";
import { Activities } from "@/components/sections/Activities";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const metadata: Metadata = {
  title: "Our Impact & Activities | Climate Restoration Metrics",
  description: "See the measurable impact of Greenwave Society: over 10,000 trees planted, 500+ youth empowered, and ecological activities across Nairobi, Ngong, and Kangemi.",
  alternates: {
    canonical: "/impact",
  },
};

export default function ImpactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <Impact />
        <Activities />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

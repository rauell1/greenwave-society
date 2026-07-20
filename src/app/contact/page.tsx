import { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const metadata: Metadata = {
  title: "Contact Us | Get Involved & Volunteer",
  description: "Get in touch with Greenwave Society in Kenya. Connect with us via Email, WhatsApp, or our secure form to volunteer, partner, or donate.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

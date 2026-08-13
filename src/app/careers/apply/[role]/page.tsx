import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ApplicationForm } from "@/components/forms/ApplicationForm";

const ROLES = {
  "communications-lead": {
    title: "Communications Lead",
    description: "Lead our communication strategies and shape our public narrative to amplify our impact across Kenya."
  }
};

export function generateMetadata({ params }: { params: { role: string } }): Metadata {
  const role = ROLES[params.role as keyof typeof ROLES];
  if (!role) return { title: "Position Not Found" };
  
  return {
    title: `Apply for ${role.title} | Greenwave Society`,
  };
}

export default function ApplyPage({ params }: { params: { role: string } }) {
  const role = ROLES[params.role as keyof typeof ROLES];
  if (!role) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-zinc-900 mb-2">
            Apply for {role.title}
          </h1>
          <p className="text-zinc-600">
            {role.description}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sm:p-8">
          <ApplicationForm roleTitle={role.title} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

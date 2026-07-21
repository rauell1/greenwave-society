import { Metadata } from 'next';
import { Navbar } from '@/components/sections/Navbar';
import { Footer } from '@/components/sections/Footer';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { Cookie, Shield } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import { runClientCookieScan } from '@/lib/scanner/cookie-scanner';

export const metadata: Metadata = {
  title: 'Cookie Policy & Consent Management | Greenwave Society',
  description: 'Understand how Greenwave Society uses cookies and tracking technologies under GDPR & CCPA.',
  alternates: {
    canonical: `${APP_CONFIG.url}/cookies`,
  },
};

export default function CookiePolicyPage() {
  const scanData = runClientCookieScan('greenwave.org');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
        
        <div className="space-y-3 text-center md:text-left border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-xs font-semibold">
            <Cookie className="h-3.5 w-3.5" />
            GDPR & CCPA Transparency Center
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Cookie Policy & Active Trackers
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl leading-relaxed">
            Greenwave Society is committed to absolute data privacy and transparency. Review our active cookie inventory, tracker classifications, and legal compliance framework below.
          </p>
        </div>

        {/* Dynamic Cookie Inventory Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" /> Active Cookie Inventory
          </h2>
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Cookie Name</th>
                  <th className="p-3.5">Domain</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Expiry</th>
                  <th className="p-3.5">Purpose & Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {scanData.scannedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-950/60 transition-colors">
                    <td className="p-3.5 font-bold text-white">{item.name}</td>
                    <td className="p-3.5 font-mono text-zinc-400">{item.domain}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-medium text-[11px] border border-emerald-800/40">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-400">{item.expiry}</td>
                    <td className="p-3.5 text-zinc-400 leading-relaxed max-w-xs">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Markdown Text */}
        <div className="p-6 md:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 space-y-4 leading-relaxed font-sans">
          <div className="prose prose-invert max-w-none text-xs md:text-sm space-y-4">
            <h3 className="text-lg font-bold text-white">1. Managing Your Cookie Preferences</h3>
            <p>
              You can change or withdraw your cookie consent at any time. Clicking the floating **Cookie Settings** icon on the bottom left corner of any page allows you to enable or disable individual tracker categories (Analytics, Marketing, Preferences).
            </p>

            <h3 className="text-lg font-bold text-white">2. Google Consent Mode v2 & IAB TCF 2.3</h3>
            <p>
              Our website uses Google Consent Mode v2 to respect your decisions dynamically. When analytics or marketing consent is denied, Google Tags run in cookieless state without storing persistent identifier cookies.
            </p>
          </div>
        </div>

      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Instagram, Facebook, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { APP_CONFIG } from "@/config/app.config";

function TwitterIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.95 4.57a10 10 0 0 1-2.83.78 4.93 4.93 0 0 0 2.16-2.72 9.86 9.86 0 0 1-3.12 1.19 4.92 4.92 0 0 0-8.39 4.48A13.95 13.95 0 0 1 1.64 3.16a4.93 4.93 0 0 0 1.52 6.57A4.9 4.9 0 0 1 .96 9.1v.06a4.93 4.93 0 0 0 3.94 4.83 5 5 0 0 1-2.21.08 4.94 4.94 0 0 0 4.6 3.42A9.88 9.88 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.06 0 14.02-7.5 14.02-14 0-.22-.01-.42-.02-.63a10 10 0 0 0 2.4-2.55Z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.6 5.82a4.78 4.78 0 0 1-1.23-3.2h-3.03v13.12a2.42 2.42 0 1 1-2.4-2.71c.2 0 .4.03.6.08V10a5.5 5.5 0 1 0 4.82 5.45v-6.2a7.82 7.82 0 0 0 4.59 1.48V7.72c-1.39 0-2.66-.7-3.35-1.9Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <Image quality={95}
                src="/logo.png"
                alt="Greenwave Society Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-xl font-serif font-black tracking-tight text-white">
                Green<span className="text-emerald-400 font-normal">wave</span> <span className="font-normal text-zinc-400">Society</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Equipping young Kenyans to lead, build, and connect, closing the gaps in skills, opportunity, and wellbeing, one community at a time.
            </p>
            <div className="mt-4 flex gap-3">
              {[
                { href: APP_CONFIG.social.instagram, icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { href: APP_CONFIG.social.twitter, icon: <TwitterIcon className="w-4 h-4" />, label: "Twitter" },
                { href: APP_CONFIG.social.facebook, icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                { href: APP_CONFIG.social.tiktok, icon: <TikTokIcon className="w-4 h-4" />, label: "TikTok" },
                { href: APP_CONFIG.social.linktree, icon: <Globe className="w-4 h-4" />, label: "Linktree" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-emerald-600 hover:text-white transition-colors"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Our Programs", href: "/programs" },
                { label: "Our Impact", href: "/impact" },
                { label: "Our Team", href: "/team" },
                { label: "Careers", href: "/careers" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy & Data Rights", href: "/privacy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">
              Programs
            </h4>
            <ul className="space-y-2.5">
              {[
                "The 50 Percent",
                "Young People Pulse (YPP)",
                "Climate Action & Advocacy",
                "Conservation & Restoration",
                "Youth Leadership",
                "Social Enterprise & Sustainability",
              ].map((l) => (
                <li key={l}>
                  <Link
                    href="/programs"
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-300">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${APP_CONFIG.contact.email}`}
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2 break-all"
                >
                  <Mail className="w-3.5 h-3.5" /> {APP_CONFIG.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${APP_CONFIG.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" /> {APP_CONFIG.contact.phone}
                </a>
              </li>
              <li>
                <span className="text-sm text-zinc-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {APP_CONFIG.contact.location}
                </span>
              </li>
              <li>
                <a
                  href={APP_CONFIG.social.linktree}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2 break-all"
                >
                  <Globe className="w-3.5 h-3.5" /> linktr.ee/greenwavesociety
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-zinc-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} Greenwave Society. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with{" "}
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />{" "}
            for the planet
          </p>
        </div>
      </div>
    </footer>
  );
}

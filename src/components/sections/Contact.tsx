import { Suspense } from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { ContactForm } from "@/components/sections/ContactForm";
import { NewsletterForm } from "@/components/sections/NewsletterForm";
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

export function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-32 bg-secondary/15 relative overflow-hidden">
      {/* Background vector accents */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gold" />
            Get in Touch
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-foreground leading-tight">
            Contact <span className="italic font-normal text-primary">Us</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Have a question, want to volunteer, or interested in partnering with us? We would love to hear from you.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 items-start">
          {/* Contact Info */}
          <FadeIn direction="left" className="lg:col-span-2">
            <div className="space-y-8 sm:space-y-10">
              <div>
                <h3 className="font-serif font-black text-xl text-foreground mb-6">Reach Out To Us</h3>
                <div className="space-y-4">
                  <a
                    href={`mailto:${APP_CONFIG.contact.email}`}
                    className="flex items-start gap-4 py-3 group border-b border-primary/10 transition-colors duration-300"
                  >
                    <div className="text-primary group-hover:text-gold transition-colors duration-300 mt-1">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-gold block mb-0.5">
                        Email Address
                      </span>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors break-all">
                        {APP_CONFIG.contact.email}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/${APP_CONFIG.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 py-3 group border-b border-primary/10 transition-colors duration-300"
                  >
                    <div className="text-primary group-hover:text-gold transition-colors duration-300 mt-1">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-gold block mb-0.5">
                        WhatsApp Call / Text
                      </span>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {APP_CONFIG.contact.phone}
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 py-3 border-b border-primary/10">
                    <div className="text-primary mt-1">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-gold block mb-0.5">
                        Primary Office
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {APP_CONFIG.contact.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-gold font-semibold mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    {
                      href: APP_CONFIG.social.instagram,
                      icon: <Instagram className="w-4 h-4" />,
                      label: "Instagram",
                    },
                    {
                      href: APP_CONFIG.social.twitter,
                      icon: <TwitterIcon className="w-4 h-4" />,
                      label: "Twitter",
                    },
                    {
                      href: APP_CONFIG.social.facebook,
                      icon: <Facebook className="w-4 h-4" />,
                      label: "Facebook",
                    },
                    {
                      href: APP_CONFIG.social.tiktok,
                      icon: <TikTokIcon className="w-4 h-4" />,
                      label: "TikTok",
                    },
                    {
                      href: APP_CONFIG.social.linktree,
                      icon: <Globe className="w-4 h-4" />,
                      label: "Linktree",
                    },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-primary/20 bg-background flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
                      aria-label={s.label}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="pt-4">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-gold font-semibold mb-2">Subscribe to Newsletter</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Stay updated on our latest events, programs, and impact stories.
                </p>
                <NewsletterForm />
              </div>
            </div>
          </FadeIn>

          {/* Contact Form Container */}
          <FadeIn direction="right" className="lg:col-span-3">
            <div className="bg-background rounded-[2rem] border border-primary/20 p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_oklch(var(--primary)/4%)] relative">
              <div className="absolute -top-3.5 left-8 bg-gold text-white font-mono text-[9px] tracking-widest uppercase py-1 px-3 rounded-full">
                Form
              </div>
              <Suspense fallback={
                <div className="space-y-6 animate-pulse">
                  <div className="h-12 bg-secondary/30 rounded w-3/4"></div>
                  <div className="h-12 bg-secondary/30 rounded w-1/2"></div>
                  <div className="h-36 bg-secondary/30 rounded"></div>
                  <div className="h-12 bg-secondary/30 rounded w-1/4"></div>
                </div>
              }>
                <ContactForm />
              </Suspense>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

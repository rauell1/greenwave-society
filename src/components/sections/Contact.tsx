import { Suspense } from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <section id="contact" className="py-16 sm:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            Get in Touch
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Contact <span className="text-primary">Us</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-base sm:text-lg">
            Have a question, want to volunteer, or interested in partnering with us?
            We would love to hear from you.
          </p>
        </FadeIn>

        <div className="mt-10 sm:mt-16 grid lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Contact Info */}
          <FadeIn direction="left" className="lg:col-span-2">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Reach Out To Us</h3>
                <div className="space-y-4">
                  <a
                    href={`mailto:${APP_CONFIG.contact.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground break-all">
                        {APP_CONFIG.contact.email}
                      </p>
                    </div>
                  </a>
                  <a
                    href={`https://wa.me/${APP_CONFIG.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">{APP_CONFIG.contact.phone}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{APP_CONFIG.contact.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    {
                      href: APP_CONFIG.social.instagram,
                      icon: <Instagram className="w-5 h-5" />,
                      label: "Instagram",
                    },
                    {
                      href: APP_CONFIG.social.twitter,
                      icon: <TwitterIcon className="w-5 h-5" />,
                      label: "Twitter",
                    },
                    {
                      href: APP_CONFIG.social.facebook,
                      icon: <Facebook className="w-5 h-5" />,
                      label: "Facebook",
                    },
                    {
                      href: APP_CONFIG.social.tiktok,
                      icon: <TikTokIcon className="w-5 h-5" />,
                      label: "TikTok",
                    },
                    {
                      href: APP_CONFIG.social.linktree,
                      icon: <Globe className="w-5 h-5" />,
                      label: "Linktree",
                    },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label={s.label}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Subscribe to Newsletter</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Stay updated on our latest events, programs, and impact stories.
                </p>
                <NewsletterForm />
              </div>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn direction="right" className="lg:col-span-3">
            <Card className="border-border/50">
              <CardContent className="p-5 sm:p-6 lg:p-8">
                <Suspense fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-muted rounded w-3/4"></div>
                    <div className="h-10 bg-muted rounded w-1/2"></div>
                    <div className="h-32 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded w-1/4"></div>
                  </div>
                }>
                  <ContactForm />
                </Suspense>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

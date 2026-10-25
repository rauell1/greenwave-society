import { Suspense } from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon } from "@/components/ui/social-icons";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { SafeEmailLink } from "@/components/ui/safe-email-link";
import { ContactForm } from "@/components/sections/ContactForm";
import { NewsletterForm } from "@/components/sections/NewsletterForm";
import { APP_CONFIG } from "@/config/app.config";

export interface ContactContentProps {
  title?: string;
  body?: string;
}

export function Contact({ content }: { content?: ContactContentProps } = {}) {
  const title = content?.title || "Contact Us";
  const body =
    content?.body ||
    "Have a question, want to volunteer, or interested in partnering with us? We would love to hear from you. We promise to get back to you within 24 hours.";

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
            {title.includes("Us") ? (
              <>
                Contact <span className="italic font-normal text-primary">Us</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            {body}
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 items-start">
          {/* Contact Info */}
          <FadeIn direction="left" className="lg:col-span-2">
            <div className="space-y-8 sm:space-y-10">
              <div>
                <h3 className="font-serif font-black text-xl text-foreground mb-6">Reach Out To Us</h3>
                <div className="space-y-4">
                  <SafeEmailLink className="flex items-start gap-4 py-3 group border-b border-primary/10 transition-colors duration-300">
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
                  </SafeEmailLink>

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

                  <div className="flex items-start gap-4 py-3 border-b border-primary/10">
                    <div className="text-primary mt-1">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-gold block mb-0.5">
                        Coverage
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        Nairobi, Maangani, Ngong & Across Kenya
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div>
                <h4 className="font-serif font-bold text-sm text-foreground mb-4">Connect on Social Media</h4>
                <div className="flex items-center gap-3">
                  <a
                    href={APP_CONFIG.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-background border border-primary/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4 text-gold" />
                  </a>
                  <a
                    href={APP_CONFIG.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-background border border-primary/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-4 h-4 text-gold" />
                  </a>
                  <a
                    href={APP_CONFIG.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-background border border-primary/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                    aria-label="Twitter / X"
                  >
                    <TwitterIcon className="w-4 h-4 text-gold" />
                  </a>
                  <a
                    href={APP_CONFIG.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-background border border-primary/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="w-4 h-4 text-gold" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Contact Forms & Newsletter */}
          <FadeIn direction="right" className="lg:col-span-3 space-y-8">
            <div className="bg-background rounded-3xl border border-primary/20 p-6 sm:p-10 shadow-sm">
              <h3 className="font-serif font-black text-2xl text-foreground mb-2">Send us a Message</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-8">
                Fill in the form below and our team will get in touch shortly.
              </p>
              <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-muted-foreground">Loading form...</div>}>
                <ContactForm />
              </Suspense>
            </div>

            <div className="bg-primary/5 rounded-3xl border border-primary/20 p-6 sm:p-8">
              <NewsletterForm />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

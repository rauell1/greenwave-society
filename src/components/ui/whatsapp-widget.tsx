"use client";

import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import Image from "next/image";

interface WhatsAppWidgetProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppWidget({
  phoneNumber = "254794287400",
  defaultMessage = "Hello Greenwave Society team, I would like to inquire about your programmes and upcoming events.",
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 left-6 z-40 print:hidden font-sans">
      {/* Popover Chat Card */}
      {isOpen && (
        <div className="mb-4 w-[310px] sm:w-[340px] rounded-3xl bg-card border border-border/80 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#0f3a22] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-emerald-700/80 p-0.5 border border-white/30 shrink-0 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Greenwave Society"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f3a22]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-white">Greenwave Society</h4>
                <p className="text-[11px] text-emerald-200">Official Support & Team</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#f8faf7] dark:bg-card space-y-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-secondary/30 border border-border/60 shadow-sm text-xs text-foreground/90 space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Karibu Greenwave!</span>
              </div>
              <p className="leading-relaxed">
                Hello! Welcome to Greenwave Society. How can we support you today regarding our community programmes, memberships, or the Empower 360 Graduation?
              </p>
              <div className="text-[10px] text-muted-foreground text-right pt-0.5">
                Online &bull; WhatsApp
              </div>
            </div>

            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Start WhatsApp Conversation</span>
              </a>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Typically responds in a few minutes &bull; +254 794 287 400
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3.5 py-3 rounded-full bg-[#0f3a22] text-white hover:bg-[#154c2d] shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-700/50 hover:scale-105"
        aria-label="Open WhatsApp Chat"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-semibold pr-1 hidden sm:inline-block">
          {isOpen ? "Close Chat" : "Chat on WhatsApp"}
        </span>
      </button>
    </div>
  );
}

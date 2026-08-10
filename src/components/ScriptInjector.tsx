"use client";

import { useEffect } from "react";
import { useConsent } from "@/hooks/useConsent";
import Script from "next/script";

export function ScriptInjector() {
  const { consent } = useConsent();

  // Here you can inject any dynamically loaded scripts based on categories
  // For demonstration, we'll log what would be injected.
  
  useEffect(() => {
    if (consent.analytics) {
      console.log("Analytics consent granted: Injecting GA/GTM script tags...");
      // e.g. execute GA script initialization if not using next/script below
    }
  }, [consent.analytics]);

  useEffect(() => {
    if (consent.marketing) {
      console.log("Marketing consent granted: Injecting Facebook Pixel...");
    }
  }, [consent.marketing]);

  return (
    <>
      {/* Example: Google Analytics (only if analytics is granted) */}
      {consent.analytics && (
        <Script
          id="ga-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
      )}
      
      {consent.analytics && (
        <Script id="ga-setup" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      )}

      {/* Example: Facebook Pixel (only if marketing is granted) */}
      {consent.marketing && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'XXXXXXXXXXXXXXX');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

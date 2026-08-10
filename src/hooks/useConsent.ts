import { useState, useEffect, useCallback } from 'react';

// EU/UK Countries requiring strict Opt-In
const GDPR_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", 
  "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", 
  "RO", "SK", "SI", "ES", "SE", "GB", "UK"
];

export type ConsentCategories = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

export const defaultConsentOptIn: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export const defaultConsentOptOut: ConsentCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
  preferences: true,
};



export function useConsent() {
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [consent, setConsent] = useState<ConsentCategories>(defaultConsentOptIn);
  const [country, setCountry] = useState<string>("US");

  useEffect(() => {
    // 1. Check local storage for existing consent
    const storedConsent = localStorage.getItem("user-consent");
    
    // 2. Determine default based on geolocation from cookie set by middleware
    const match = document.cookie.match(/(?:(?:^|.*;\s*)user-country\s*\=\s*([^;]*).*$)|^.*$/);
    const userCountry = match ? match[1] : "US";
    setCountry(userCountry);

    const isGdpr = GDPR_COUNTRIES.includes(userCountry);

    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        setConsent({ ...defaultConsentOptIn, ...parsed, necessary: true });
        setHasInteracted(true);
        pushToDataLayer({ ...defaultConsentOptIn, ...parsed, necessary: true });
      } catch (e) {
        setConsent(isGdpr ? defaultConsentOptIn : defaultConsentOptOut);
      }
    } else {
      // Default state based on region
      const defaultState = isGdpr ? defaultConsentOptIn : defaultConsentOptOut;
      setConsent(defaultState);
    }
  }, []);

  const pushToDataLayer = (categories: ConsentCategories) => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
      }

      window.gtag('consent', 'update', {
        'analytics_storage': categories.analytics ? 'granted' : 'denied',
        'ad_storage': categories.marketing ? 'granted' : 'denied',
        'ad_user_data': categories.marketing ? 'granted' : 'denied',
        'ad_personalization': categories.marketing ? 'granted' : 'denied',
        'personalization_storage': categories.preferences ? 'granted' : 'denied',
      });
    }
  };

  const updateConsent = useCallback((newConsent: Partial<ConsentCategories>) => {
    const updated = { ...consent, ...newConsent, necessary: true }; // necessary is always true
    setConsent(updated);
    setHasInteracted(true);
    localStorage.setItem("user-consent", JSON.stringify(updated));
    pushToDataLayer(updated);
    
    // Optionally log to backend
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: updated, countryCode: country }),
    }).catch(() => {});
  }, [consent, country]);

  const acceptAll = useCallback(() => {
    updateConsent(defaultConsentOptOut);
  }, [updateConsent]);

  const rejectAll = useCallback(() => {
    updateConsent(defaultConsentOptIn);
  }, [updateConsent]);

  return {
    consent,
    hasInteracted,
    country,
    updateConsent,
    acceptAll,
    rejectAll,
    isGdprRegion: GDPR_COUNTRIES.includes(country),
  };
}

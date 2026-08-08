/**
 * Google Consent Mode v2 Integration
 * Supports ad_storage, analytics_storage, ad_user_data, and ad_personalization
 */

export interface ConsentModeSettings {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  security_storage: 'granted' | 'denied';
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Initializes Google Consent Mode v2 with default values before GTM/GA loads
 */
export function initGoogleConsentMode(defaultGranted = false) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  const defaultState: ConsentModeSettings = {
    analytics_storage: defaultGranted ? 'granted' : 'denied',
    ad_storage: defaultGranted ? 'granted' : 'denied',
    ad_user_data: defaultGranted ? 'granted' : 'denied',
    ad_personalization: defaultGranted ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: defaultGranted ? 'granted' : 'denied',
    security_storage: 'granted',
  };

  gtag('consent', 'default', {
    ...defaultState,
    wait_for_update: 500,
  });
}

/**
 * Updates Google Consent Mode v2 values dynamically based on user choices
 */
export function updateGoogleConsentMode(categories: {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  if (!window.gtag) window.gtag = gtag;

  const updatedState: ConsentModeSettings = {
    analytics_storage: categories.analytics ? 'granted' : 'denied',
    ad_storage: categories.marketing ? 'granted' : 'denied',
    ad_user_data: categories.marketing ? 'granted' : 'denied',
    ad_personalization: categories.marketing ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: categories.preferences ? 'granted' : 'denied',
    security_storage: 'granted',
  };

  window.gtag('consent', 'update', updatedState);
}

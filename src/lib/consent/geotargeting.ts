/**
 * Geotargeting Engine for GDPR / CCPA Compliance
 * Automatically adjusts consent requirements based on visitor geographic location.
 */

export type ConsentRegion = 'EU_GDPR' | 'US_CCPA' | 'GLOBAL';

const EU_EEA_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO', 'CH'
]);

export interface GeoLocationInfo {
  countryCode: string;
  region: ConsentRegion;
  requiresOptIn: boolean; // EU GDPR: explicit prior consent required
  requiresOptOut: boolean; // California / CCPA: "Do Not Sell" opt-out banner required
}

/**
 * Detects visitor location and returns applicable legal framework
 */
export function getGeoTargetingInfo(userCountryHeader?: string | null): GeoLocationInfo {
  let countryCode = (userCountryHeader || 'KE').toUpperCase();

  // Client-side timezone fallback if header is absent
  if (typeof window !== 'undefined' && !userCountryHeader) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Europe') || tz.includes('London')) {
        countryCode = 'DE'; // Default EU representative
      } else if (tz.includes('America/Los_Angeles') || tz.includes('Pacific')) {
        countryCode = 'US';
      }
    } catch {
      countryCode = 'KE';
    }
  }

  if (EU_EEA_COUNTRIES.has(countryCode)) {
    return {
      countryCode,
      region: 'EU_GDPR',
      requiresOptIn: true,
      requiresOptOut: false,
    };
  }

  if (countryCode === 'US' || countryCode === 'CA') {
    return {
      countryCode,
      region: 'US_CCPA',
      requiresOptIn: false,
      requiresOptOut: true,
    };
  }

  return {
    countryCode,
    region: 'GLOBAL',
    requiresOptIn: false,
    requiresOptOut: true,
  };
}

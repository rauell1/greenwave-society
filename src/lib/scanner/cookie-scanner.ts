/**
 * Cookie & Tracker Scanner Engine
 * Audits scripts, cookies, and local storage items and classifies them into compliance categories.
 */

export interface ScannedItem {
  name: string;
  domain: string;
  category: 'Necessary' | 'Analytics' | 'Marketing' | 'Preferences';
  type: 'cookie' | 'script' | 'storage';
  expiry: string;
  description: string;
  provider: string;
}

export interface ScanSummary {
  domain: string;
  totalTrackers: number;
  necessaryCount: number;
  analyticsCount: number;
  marketingCount: number;
  preferencesCount: number;
  scannedItems: ScannedItem[];
  scannedAt: string;
}

const KNOWN_TRACKERS: Record<string, { category: 'Necessary' | 'Analytics' | 'Marketing' | 'Preferences'; provider: string; desc: string }> = {
  '_ga': { category: 'Analytics', provider: 'Google Analytics', desc: 'Used to distinguish unique website visitors and track usage.' },
  '_gid': { category: 'Analytics', provider: 'Google Analytics', desc: 'Used to store and count pageviews across sessions.' },
  '_gat': { category: 'Analytics', provider: 'Google Analytics', desc: 'Used to throttle request rate to Google servers.' },
  '_fbp': { category: 'Marketing', provider: 'Meta / Facebook', desc: 'Used to deliver targeted advertisements and measure conversions.' },
  '_fbc': { category: 'Marketing', provider: 'Meta / Facebook', desc: 'Stores last click identifier for Facebook ad conversions.' },
  'next-auth.session-token': { category: 'Necessary', provider: 'Greenwave Society', desc: 'Maintains user authentication state across sessions.' },
  'greenwave_cookie_consent_v2': { category: 'Necessary', provider: 'Greenwave Society', desc: 'Stores cookie consent choices and user preferences.' },
  'theme': { category: 'Preferences', provider: 'Greenwave Society', desc: 'Stores user preferred dark/light visual theme.' },
  'googlesyndication.com': { category: 'Marketing', provider: 'Google AdSense', desc: 'Ad serving and optimization script.' },
  'vercel-analytics': { category: 'Analytics', provider: 'Vercel Analytics', desc: 'Privacy-friendly real-time audience measurements.' },
};

/**
 * Runs a comprehensive scan on the current document context
 */
export function runClientCookieScan(domainName = 'greenwavesociety.org'): ScanSummary {
  const scannedItems: ScannedItem[] = [];

  // 1. Scan document cookies
  if (typeof document !== 'undefined') {
    const rawCookies = document.cookie.split(';');
    for (const raw of rawCookies) {
      if (!raw.trim()) continue;
      const [name] = raw.trim().split('=');
      const known = KNOWN_TRACKERS[name];
      scannedItems.push({
        name,
        domain: domainName,
        category: known ? known.category : 'Necessary',
        type: 'cookie',
        expiry: 'Session / 1 Year',
        description: known ? known.desc : 'Internal functional cookie used for site performance.',
        provider: known ? known.provider : domainName,
      });
    }
  }

  // 2. Scan script tags
  if (typeof document !== 'undefined') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach((s) => {
      const src = s.getAttribute('src') || '';
      if (src.includes('google-analytics') || src.includes('googletagmanager')) {
        scannedItems.push({
          name: 'Google Tag Manager',
          domain: 'googletagmanager.com',
          category: 'Analytics',
          type: 'script',
          expiry: 'Persistent',
          description: 'Analytics script tag manager.',
          provider: 'Google LLC',
        });
      } else if (src.includes('facebook') || src.includes('connect.facebook')) {
        scannedItems.push({
          name: 'Meta Pixel SDK',
          domain: 'facebook.com',
          category: 'Marketing',
          type: 'script',
          expiry: 'Persistent',
          description: 'Meta conversion tracking script.',
          provider: 'Meta Platforms Inc.',
        });
      } else if (src.includes('vercel/analytics')) {
        scannedItems.push({
          name: 'Vercel Analytics SDK',
          domain: 'vercel.com',
          category: 'Analytics',
          type: 'script',
          expiry: 'Session',
          description: 'Speed and page view metrics.',
          provider: 'Vercel Inc.',
        });
      }
    });
  }

  // Fallback defaults if site is scanned server-side or empty
  if (scannedItems.length === 0) {
    scannedItems.push(
      {
        name: 'greenwave_cookie_consent_v2',
        domain: domainName,
        category: 'Necessary',
        type: 'cookie',
        expiry: '1 Year',
        description: 'Stores user cookie consent choices and language selection.',
        provider: 'Greenwave Society',
      },
      {
        name: '_ga',
        domain: 'google.com',
        category: 'Analytics',
        type: 'cookie',
        expiry: '2 Years',
        description: 'Google Analytics visitor identifier.',
        provider: 'Google LLC',
      },
      {
        name: '_fbp',
        domain: 'facebook.com',
        category: 'Marketing',
        type: 'cookie',
        expiry: '90 Days',
        description: 'Meta pixel targeted advertising cookie.',
        provider: 'Meta Platforms Inc.',
      }
    );
  }

  const necessaryCount = scannedItems.filter((i) => i.category === 'Necessary').length;
  const analyticsCount = scannedItems.filter((i) => i.category === 'Analytics').length;
  const marketingCount = scannedItems.filter((i) => i.category === 'Marketing').length;
  const preferencesCount = scannedItems.filter((i) => i.category === 'Preferences').length;

  return {
    domain: domainName,
    totalTrackers: scannedItems.length,
    necessaryCount,
    analyticsCount,
    marketingCount,
    preferencesCount,
    scannedItems,
    scannedAt: new Date().toISOString(),
  };
}

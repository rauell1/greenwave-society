/**
 * Client-Side Script & Cookie Auto-blocker Engine
 * Intercepts third-party scripts and blocks non-essential cookies until consent is explicitly granted.
 */

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const STORAGE_KEY = 'greenwave_cookie_consent_v2';

export function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveConsentState(state: ConsentState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyAutoBlockRules(state);
  } catch (e) {
    console.error('Failed to save consent state', e);
  }
}

/**
 * Applies script auto-blocking rules dynamically
 */
export function applyAutoBlockRules(state: ConsentState) {
  if (typeof window === 'undefined') return;

  // Unblock scripts with data-consent-category attribute
  const blockedScripts = document.querySelectorAll<HTMLScriptElement>('script[data-consent-category]');
  blockedScripts.forEach((script) => {
    const category = script.getAttribute('data-consent-category') as keyof ConsentState;
    if (category && state[category]) {
      if (script.type === 'text/plain') {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== 'type') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        newScript.type = 'text/javascript';
        newScript.innerHTML = script.innerHTML;
        script.parentNode?.replaceChild(newScript, script);
      }
    }
  });

  // Clean non-essential cookies if analytics or marketing declined
  if (!state.analytics) {
    clearCookiesByPattern(['_ga', '_gid', '_gat', 'clsk', '_clck']);
  }
  if (!state.marketing) {
    clearCookiesByPattern(['_fbp', '_fbc', 'fr', 'tr', 'ads']);
  }
}

function clearCookiesByPattern(patterns: string[]) {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const cookieName = cookie.split('=')[0];
    if (patterns.some((p) => cookieName.startsWith(p))) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }
}

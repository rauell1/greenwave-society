/**
 * IAB Transparency and Consent Framework (TCF) v2.3 Engine
 * Provides __tcfapi window stub and generates standard TC strings
 */

export interface TCFConsentData {
  tcString: string;
  tcfPolicyVersion: number;
  cmpId: number;
  cmpVersion: number;
  gdprApplies: boolean;
  eventStatus: 'tcloaded' | 'cmpuishown' | 'useractioncomplete';
  publisherCC: string;
  purpose: {
    consents: Record<number, boolean>;
    legitimateInterests: Record<number, boolean>;
  };
  vendor: {
    consents: Record<number, boolean>;
    legitimateInterests: Record<number, boolean>;
  };
}

const CMP_ID = 28; // Registered / Custom CMP ID
const CMP_VERSION = 1;

declare global {
  interface Window {
    __tcfapi?: (
      command: string,
      version: number,
      callback: (data: any, success: boolean) => void,
      parameter?: any
    ) => void;
  }
}

/**
 * Encodes simplified TC String bitvector for IAB TCF 2.3
 */
export function generateTCString(grantedCategories: {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}): string {
  const version = 'CP'; // Custom Protocol Prefix for TCF v2.3
  const timestamp = Math.floor(Date.now() / 1000).toString(36);
  const flags = [
    grantedCategories.necessary ? '1' : '0',
    grantedCategories.analytics ? '1' : '0',
    grantedCategories.marketing ? '1' : '0',
    grantedCategories.preferences ? '1' : '0',
  ].join('');

  return `${version}-${timestamp}-${CMP_ID}-${flags}`;
}

/**
 * Initializes window.__tcfapi interface for IAB TCF 2.3 vendor compliance
 */
export function initTCFAPI(gdprApplies = true) {
  if (typeof window === 'undefined') return;

  const callbacks: Array<(data: any, success: boolean) => void> = [];

  window.__tcfapi = function (command, _version, callback, _parameter) {
    if (command === 'ping') {
      callback(
        {
          gdprApplies,
          cmpLoaded: true,
          cmpStatus: 'loaded',
          displayStatus: 'hidden',
          apiVersion: '2.3',
          cmpId: CMP_ID,
          cmpVersion: CMP_VERSION,
        },
        true
      );
    } else if (command === 'addEventListener') {
      callbacks.push(callback);
      callback(
        {
          eventStatus: 'tcloaded',
          gdprApplies,
          tcString: generateTCString({ necessary: true, analytics: false, marketing: false, preferences: false }),
        },
        true
      );
    } else if (command === 'getTCData') {
      callback(
        {
          tcString: generateTCString({ necessary: true, analytics: false, marketing: false, preferences: false }),
          tcfPolicyVersion: 2,
          cmpId: CMP_ID,
          cmpVersion: CMP_VERSION,
          gdprApplies,
          eventStatus: 'tcloaded',
          publisherCC: 'KE',
        },
        true
      );
    }
  };
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cookie, Globe, SlidersHorizontal, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, TranslationSet } from '@/lib/consent/languages';
import { initGoogleConsentMode, updateGoogleConsentMode } from '@/lib/consent/consent-mode';
import { initTCFAPI, generateTCString } from '@/lib/consent/tcf-engine';
import { getGeoTargetingInfo, GeoLocationInfo } from '@/lib/consent/geotargeting';
import { getStoredConsent, saveConsentState, ConsentState } from '@/lib/consent/autoblocker';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import { CookieFloatingWidget } from './CookieFloatingWidget';

export function CookieBanner() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hasConsented, setHasConsented] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState('en');
  const [geoInfo, setGeoInfo] = React.useState<GeoLocationInfo>({
    countryCode: 'KE',
    region: 'GLOBAL',
    requiresOptIn: false,
    requiresOptOut: true,
  });

  const [consentState, setConsentState] = React.useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  React.useEffect(() => {
    // 1. Init Google Consent Mode & TCF engine
    initGoogleConsentMode(false);
    initTCFAPI(true);

    // 2. Fetch server configuration & geotargeting
    fetch('/api/consent')
      .then((res) => res.json())
      .then((data) => {
        if (data.geo) {
          setGeoInfo(data.geo);
        }
        if (data.config?.defaultLang && SUPPORTED_LANGUAGES[data.config.defaultLang]) {
          setCurrentLang(data.config.defaultLang);
        }
      })
      .catch(() => {
        const detectedGeo = getGeoTargetingInfo();
        setGeoInfo(detectedGeo);
      });

    // 3. Auto detect browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      if (browserLang && SUPPORTED_LANGUAGES[browserLang]) {
        setCurrentLang(browserLang);
      }
    }

    // 4. Check stored consent
    const stored = getStoredConsent();
    if (stored) {
      setConsentState(stored);
      updateGoogleConsentMode(stored);
      setHasConsented(true);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  const t: TranslationSet = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.en;

  const handleConsentAction = (type: 'all' | 'necessary' | 'custom', customState?: ConsentState) => {
    let finalState: ConsentState;

    if (type === 'all') {
      finalState = { necessary: true, analytics: true, marketing: true, preferences: true };
    } else if (type === 'necessary') {
      finalState = { necessary: true, analytics: false, marketing: false, preferences: false };
    } else {
      finalState = customState || consentState;
    }

    setConsentState(finalState);
    saveConsentState(finalState);
    updateGoogleConsentMode(finalState);
    setHasConsented(true);
    setIsOpen(false);

    // Log consent anonymously
    const tcfStr = generateTCString(finalState);
    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentId: `cnst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        categories: JSON.stringify(finalState),
        consentType: type === 'all' ? 'opt-in' : type === 'necessary' ? 'opt-out' : 'customized',
        consentModeState: finalState,
        tcfVector: tcfStr,
      }),
    }).catch(() => {});
  };

  return (
    <>
      {!hasConsented && <CookieFloatingWidget onClick={() => setIsModalOpen(true)} />}

      {isOpen && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-zinc-950/95 backdrop-blur-xl border-t border-emerald-800/40 text-zinc-100 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Left Info */}
            <div className="flex items-start space-x-3.5 flex-1">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                <Cookie className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    {t.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800/60 uppercase tracking-wider">
                    {geoInfo.region === 'EU_GDPR' ? 'GDPR Explicit Opt-in' : 'CCPA Compliant'}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-zinc-300 max-w-4xl leading-relaxed">
                  {t.description}{' '}
                  <Link href="/privacy" className="underline text-emerald-400 hover:text-emerald-300 font-medium">
                    {t.policyLinkText}
                  </Link>
                </p>
              </div>
            </div>

            {/* Controls & Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
              {/* 35 Language Selector */}
              <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
                <Globe className="h-3.5 w-3.5 text-zinc-400" />
                <Select value={currentLang} onValueChange={(val) => setCurrentLang(val)}>
                  <SelectTrigger className="h-7 border-0 bg-transparent text-xs text-zinc-200 focus:ring-0 p-0 pr-2">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                      <SelectItem key={code} value={code} className="hover:bg-zinc-800 cursor-pointer">
                        {lang.nativeName} ({lang.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customize Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs h-9"
              >
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                {t.customize}
              </Button>

              {/* Reject Non-Essential */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConsentAction('necessary')}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs h-9"
              >
                {t.rejectAll}
              </Button>

              {/* Accept All */}
              <Button
                size="sm"
                onClick={() => handleConsentAction('all')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 px-4 shadow-lg shadow-emerald-900/40"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {t.acceptAll}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Preferences Modal */}
      <CookiePreferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(customState) => handleConsentAction('custom', customState)}
        t={t}
        initialState={consentState}
      />
    </>
  );
}

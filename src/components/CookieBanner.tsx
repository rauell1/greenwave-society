"use client";

import { useState, useEffect } from "react";
import { useConsent } from "@/hooks/useConsent";

export function CookieBanner() {
  const { consent, hasInteracted, updateConsent, acceptAll, rejectAll, isGdprRegion } = useConsent();
  const [showPreferences, setShowPreferences] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Floating shield button if already interacted and banner closed
  if (hasInteracted && !showPreferences) {
    return (
      <button
        onClick={() => setShowPreferences(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-transform hover:scale-105"
        aria-label="Manage Cookie Preferences"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </button>
    );
  }

  return (
    <>
      {/* Banner / Preferences Modal Background */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity">
        <div className="bg-white w-full sm:w-[500px] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto">
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {showPreferences ? "Cookie Preferences" : "We Value Your Privacy"}
            </h2>
            
            {!showPreferences ? (
              <>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.
                  {!isGdprRegion && <span className="block mt-2">California Residents: You may choose to opt-out below.</span>}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptAll}
                    className="w-full bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={rejectAll}
                    className="w-full bg-gray-100 text-gray-800 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setShowPreferences(true)}
                    className="text-emerald-600 text-sm hover:underline font-medium"
                  >
                    Manage Preferences
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-gray-600 text-sm mb-4">
                  Manage your cookie preferences below. Essential cookies cannot be disabled as they are required for the site to function properly.
                </p>
                
                {/* Essential Cookies */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Essential (Strictly Necessary)</h3>
                    <p className="text-xs text-gray-500 mt-1">Required for core site functionality and security.</p>
                  </div>
                  <input type="checkbox" checked disabled className="mt-1 h-5 w-5 text-emerald-600 bg-gray-100 border-gray-300 rounded cursor-not-allowed" />
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Analytics</h3>
                    <p className="text-xs text-gray-500 mt-1">Helps us understand how visitors interact with our website.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consent.analytics}
                    onChange={(e) => updateConsent({ analytics: e.target.checked })}
                    className="mt-1 h-5 w-5 text-emerald-600 border-gray-300 rounded cursor-pointer" 
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Marketing & Advertising</h3>
                    <p className="text-xs text-gray-500 mt-1">Used to deliver personalized advertisements and track campaigns.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consent.marketing}
                    onChange={(e) => updateConsent({ marketing: e.target.checked })}
                    className="mt-1 h-5 w-5 text-emerald-600 border-gray-300 rounded cursor-pointer" 
                  />
                </div>

                {/* Preferences */}
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Preferences</h3>
                    <p className="text-xs text-gray-500 mt-1">Allows the site to remember choices you make (like language).</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consent.preferences}
                    onChange={(e) => updateConsent({ preferences: e.target.checked })}
                    className="mt-1 h-5 w-5 text-emerald-600 border-gray-300 rounded cursor-pointer" 
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="w-full bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Save Preferences
                  </button>
                  {hasInteracted && (
                    <button
                      onClick={() => setShowPreferences(false)}
                      className="w-full bg-gray-100 text-gray-800 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield, Cookie, Info, Check, SlidersHorizontal } from 'lucide-react';
import { TranslationSet } from '@/lib/consent/languages';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: { necessary: boolean; analytics: boolean; marketing: boolean; preferences: boolean }) => void;
  t: TranslationSet;
  initialState: { necessary: boolean; analytics: boolean; marketing: boolean; preferences: boolean };
}

export function CookiePreferencesModal({
  isOpen,
  onClose,
  onSave,
  t,
  initialState,
}: CookiePreferencesModalProps) {
  const [categories, setCategories] = React.useState(initialState);

  React.useEffect(() => {
    setCategories(initialState);
  }, [initialState, isOpen]);

  const handleToggle = (key: keyof typeof categories) => {
    if (key === 'necessary') return; // Cannot disable necessary
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(categories);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-emerald-800/40 text-zinc-100 p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white">
                {t.customize}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                GDPR & CCPA Compliant Preference Center
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
          {/* Necessary */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between space-x-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <h4 className="font-semibold text-sm text-white">{t.necessary}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-medium border border-emerald-800/50">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">{t.necessaryDesc}</p>
            </div>
            <Switch checked={true} disabled />
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between space-x-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Cookie className="h-4 w-4 text-blue-400" />
                <h4 className="font-semibold text-sm text-white">{t.analytics}</h4>
              </div>
              <p className="text-xs text-zinc-400">{t.analyticsDesc}</p>
            </div>
            <Switch
              checked={categories.analytics}
              onCheckedChange={() => handleToggle('analytics')}
            />
          </div>

          {/* Marketing */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between space-x-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-purple-400" />
                <h4 className="font-semibold text-sm text-white">{t.marketing}</h4>
              </div>
              <p className="text-xs text-zinc-400">{t.marketingDesc}</p>
            </div>
            <Switch
              checked={categories.marketing}
              onCheckedChange={() => handleToggle('marketing')}
            />
          </div>

          {/* Preferences */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between space-x-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <h4 className="font-semibold text-sm text-white">{t.preferences}</h4>
              </div>
              <p className="text-xs text-zinc-400">{t.preferencesDesc}</p>
            </div>
            <Switch
              checked={categories.preferences}
              onCheckedChange={() => handleToggle('preferences')}
            />
          </div>

          {/* CCPA Opt Out Disclaimer */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-[11px] text-emerald-300 flex items-center justify-between">
            <span>{t.doNotSell}</span>
            <span className="text-[10px] bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-400 border border-emerald-700/40">
              CCPA Signal Active
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/40"
            onClick={handleSave}
          >
            <Check className="mr-2 h-4 w-4" />
            {t.savePreferences}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

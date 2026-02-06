"use client";

import { useState } from "react";
import { useAppStore } from "@/state/app-store";
import { Globe, Building2, Landmark, Flag, Edit2, Check, X } from "lucide-react";
import { CountrySelector } from "./CountrySelector";
import { CountryCode, getCountryConfig } from "@/lib/countries";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

const COUNTRY_FLAGS: Record<CountryCode, string> = {
  US: '🇺🇸',
  CA: '🇨🇦',
  IN: '🇮🇳',
  AE: '🇦🇪',
};

export function GeoFinanceBadge() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [tempCountryCode, setTempCountryCode] = useState<CountryCode | undefined>(
    profile?.countryCode as CountryCode | undefined
  );

  const countryCode = (profile?.countryCode as CountryCode) || 'IN';
  const countryConfig = getCountryConfig(countryCode);
  const currentYear = new Date().getFullYear();
  const taxYear = countryConfig.taxYearStart === '04-01' 
    ? `${currentYear}-${currentYear + 1}` 
    : `${currentYear}`;

  const handleSave = () => {
    if (!tempCountryCode) {
      toast.error("Please select a country");
      return;
    }

    const newConfig = getCountryConfig(tempCountryCode);
    updateProfile({
      country: newConfig.name,
      countryCode: tempCountryCode,
      currency: newConfig.currency,
    });
    
    setIsEditing(false);
    toast.success(`Country updated to ${newConfig.name}`);
  };

  const handleCancel = () => {
    setTempCountryCode(profile?.countryCode as CountryCode | undefined);
    setIsEditing(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-950 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Geo-Context</h3>
            </div>
            {!isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="gap-1.5 text-xs"
              >
                <Edit2 className="h-3 w-3" />
                Change
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <CountrySelector
                value={tempCountryCode}
                onChange={setTempCountryCode}
                showLabel={true}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gap-1.5"
                >
                  <Check className="h-3 w-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="gap-1.5"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-lg">
                  {COUNTRY_FLAGS[countryCode] || '🌍'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{profile?.country || countryConfig.name}</div>
                  <div className="text-xs text-zinc-500">Tax Residency</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <Landmark className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-300">
                    {countryConfig.taxYearStart === '04-01' ? `FY ${taxYear}` : `Tax Year ${taxYear}`}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {countryConfig.taxSystem === 'vat' ? 'VAT System' : 'Progressive Tax'} • Compliance Active
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <Flag className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-300">{countryConfig.currency}</div>
                  <div className="text-xs text-zinc-500">Base Currency</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-medium text-indigo-300">
              <Building2 className="h-3 w-3" />
              <span>Regulated</span>
            </div>
            <div className="block text-[10px] text-zinc-600 max-w-[120px]">
              Rules engine adapted for local capital gains & tax slabs.
            </div>
          </div>
        )}
      </div>

      {/* Background Decor */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
    </div>
  );
}

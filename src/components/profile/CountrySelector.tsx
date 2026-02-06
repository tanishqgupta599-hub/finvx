"use client";

import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { COUNTRIES, CountryCode, getCountryConfig } from "@/lib/countries";
import { HelpTooltip } from "@/components/widgets/HelpTooltip";
import { Globe } from "lucide-react";

interface CountrySelectorProps {
  value: CountryCode | undefined;
  onChange: (countryCode: CountryCode) => void;
  showLabel?: boolean;
  className?: string;
}

export function CountrySelector({ value, onChange, showLabel = true, className }: CountrySelectorProps) {
  const selectedCountry = value ? getCountryConfig(value) : null;

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="country">Country</Label>
          <HelpTooltip
            content="Select your country to enable region-specific features, tax calculations, and currency formatting."
            title="Country Selection"
          />
        </div>
      )}
      <div className="relative">
        <Select
          id="country"
          value={value || ''}
          onChange={(v) => onChange(v as CountryCode)}
          className="w-full"
        >
          <option value="">Select country...</option>
          {Object.values(COUNTRIES).map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.currency})
            </option>
          ))}
        </Select>
        {selectedCountry && (
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <Globe className="h-3 w-3" />
            <span>
              Currency: {selectedCountry.currencySymbol} {selectedCountry.currency} • 
              Tax Year: {selectedCountry.taxYearStart} to {selectedCountry.taxYearEnd}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

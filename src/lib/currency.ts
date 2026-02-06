// Currency formatting utilities with country support

import { CountryCode, getCountryConfig, formatCurrency as formatCurrencyUtil } from "./countries";
import { useAppStore } from "@/state/app-store";

/**
 * Format currency amount based on user's country
 */
export function formatCurrency(amount: number, countryCode?: CountryCode): string {
  // Get country from store if not provided
  if (!countryCode) {
    const profile = useAppStore.getState().profile;
    countryCode = (profile?.countryCode as CountryCode) || 'US';
  }
  
  return formatCurrencyUtil(amount, countryCode);
}

/**
 * Format currency for display in components (hook-friendly)
 */
export function useCurrencyFormat() {
  const profile = useAppStore((s) => s.profile);
  const countryCode = (profile?.countryCode as CountryCode) || 'US';
  const config = getCountryConfig(countryCode);
  
  return {
    format: (amount: number) => formatCurrencyUtil(amount, countryCode),
    symbol: config.currencySymbol,
    currency: config.currency,
    countryCode,
  };
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string, countryCode?: CountryCode): number {
  // Remove currency symbols and formatting
  const cleaned = value
    .replace(/[^\d.-]/g, '')
    .replace(/,/g, '');
  
  return parseFloat(cleaned) || 0;
}

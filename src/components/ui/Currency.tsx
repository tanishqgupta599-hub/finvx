"use client";

import { useCurrencyFormat } from "@/lib/currency";

interface CurrencyProps {
  amount: number;
  showSymbol?: boolean;
  className?: string;
  compact?: boolean; // Show in compact format (e.g., $1.2k instead of $1,200)
}

/**
 * Currency display component that automatically formats based on user's country
 */
export function Currency({ amount, showSymbol = true, className = "", compact = false }: CurrencyProps) {
  const { format, symbol } = useCurrencyFormat();
  
  let displayValue: string;
  
  if (compact && Math.abs(amount) >= 1000) {
    const value = Math.abs(amount);
    const suffix = value >= 1000000 ? 'M' : value >= 1000 ? 'k' : '';
    const divisor = value >= 1000000 ? 1000000 : 1000;
    const compactValue = (value / divisor).toFixed(1);
    displayValue = `${showSymbol ? symbol : ''}${compactValue}${suffix}`;
  } else {
    displayValue = format(amount);
  }
  
  return <span className={className}>{displayValue}</span>;
}

/**
 * Hook to get currency symbol for inline use
 */
export function useCurrencySymbol() {
  const { symbol, currency } = useCurrencyFormat();
  return { symbol, currency };
}

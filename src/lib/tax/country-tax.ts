// Country-specific tax calculations

import { CountryCode, getCountryConfig } from "../countries";

export interface TaxBracket {
  min: number;
  max?: number;
  rate: number;
}

export interface TaxCalculation {
  taxableIncome: number;
  tax: number;
  effectiveRate: number;
  marginalRate: number;
  brackets: Array<{ bracket: TaxBracket; tax: number }>;
}

// US Federal Tax Brackets 2024
const US_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: 44725, rate: 0.12 },
  { min: 44725, max: 95350, rate: 0.22 },
  { min: 95350, max: 201050, rate: 0.24 },
  { min: 201050, max: 383900, rate: 0.32 },
  { min: 383900, max: 487450, rate: 0.35 },
  { min: 487450, rate: 0.37 },
];

// Canada Federal Tax Brackets 2024
const CA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, rate: 0.33 },
];

// India Tax Brackets 2024-25 (New Regime)
const IN_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.10 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, rate: 0.30 },
];

// UAE has no personal income tax
const AE_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, rate: 0 },
];

function calculateProgressiveTax(income: number, brackets: TaxBracket[]): TaxCalculation {
  let totalTax = 0;
  const bracketTaxes: Array<{ bracket: TaxBracket; tax: number }> = [];
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    
    const taxableInBracket = Math.min(
      income - bracket.min,
      (bracket.max ?? Infinity) - bracket.min
    );
    
    if (taxableInBracket > 0) {
      const taxInBracket = taxableInBracket * bracket.rate;
      totalTax += taxInBracket;
      bracketTaxes.push({ bracket, tax: taxInBracket });
      marginalRate = bracket.rate;
    }
  }

  return {
    taxableIncome: income,
    tax: totalTax,
    effectiveRate: income > 0 ? totalTax / income : 0,
    marginalRate,
    brackets: bracketTaxes,
  };
}

export function calculateIncomeTax(
  income: number,
  countryCode: CountryCode,
  deductions: number = 0
): TaxCalculation {
  const config = getCountryConfig(countryCode);
  const taxableIncome = Math.max(0, income - deductions);

  switch (countryCode) {
    case 'US':
      return calculateProgressiveTax(taxableIncome, US_TAX_BRACKETS);
    case 'CA':
      return calculateProgressiveTax(taxableIncome, CA_TAX_BRACKETS);
    case 'IN':
      return calculateProgressiveTax(taxableIncome, IN_TAX_BRACKETS);
    case 'AE':
      return calculateProgressiveTax(taxableIncome, AE_TAX_BRACKETS);
    default:
      return calculateProgressiveTax(taxableIncome, US_TAX_BRACKETS);
  }
}

// VAT/GST calculations
export function calculateVAT(amount: number, countryCode: CountryCode): number {
  const config = getCountryConfig(countryCode);
  
  switch (countryCode) {
    case 'AE':
      return amount * 0.05; // UAE VAT is 5%
    case 'IN':
      return amount * 0.18; // India GST is typically 18% (varies by category)
    case 'CA':
      // Canada has GST (5%) and HST (varies by province)
      return amount * 0.13; // Average HST
    case 'US':
      // US doesn't have federal VAT, but state sales tax varies
      return 0;
    default:
      return 0;
  }
}

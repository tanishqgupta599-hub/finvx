// Country configurations for multi-region support

export type CountryCode = 'US' | 'CA' | 'IN' | 'AE';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  dateFormat: string;
  taxSystem: 'progressive' | 'flat' | 'vat';
  taxYearStart: string; // MM-DD format
  taxYearEnd: string; // MM-DD format
  features: {
    creditScore: boolean;
    investmentTypes: string[];
    bankingIntegration: string[];
    paymentMethods: string[];
  };
  financialProducts: {
    creditCards: string[];
    investmentOptions: string[];
    loanTypes: string[];
  };
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    taxSystem: 'progressive',
    taxYearStart: '01-01',
    taxYearEnd: '12-31',
    features: {
      creditScore: true,
      investmentTypes: ['stocks', 'mutual_funds', 'etf', 'bonds', '401k', 'ira', 'roth_ira', 'crypto'],
      bankingIntegration: ['Plaid', 'Yodlee'],
      paymentMethods: ['ACH', 'Wire Transfer', 'Credit Card', 'Debit Card', 'PayPal', 'Venmo', 'Zelle']
    },
    financialProducts: {
      creditCards: ['Visa', 'Mastercard', 'American Express', 'Discover'],
      investmentOptions: ['401(k)', 'IRA', 'Roth IRA', '529 Plan', 'HSA', 'Brokerage Account'],
      loanTypes: ['Mortgage', 'Auto Loan', 'Student Loan', 'Personal Loan', 'Credit Card Debt']
    }
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: '$',
    locale: 'en-CA',
    dateFormat: 'YYYY-MM-DD',
    taxSystem: 'progressive',
    taxYearStart: '01-01',
    taxYearEnd: '12-31',
    features: {
      creditScore: true,
      investmentTypes: ['stocks', 'mutual_funds', 'etf', 'bonds', 'rrsp', 'tfsa', 'resp', 'crypto'],
      bankingIntegration: ['Plaid', 'Yodlee'],
      paymentMethods: ['Interac e-Transfer', 'Wire Transfer', 'Credit Card', 'Debit Card', 'PayPal']
    },
    financialProducts: {
      creditCards: ['Visa', 'Mastercard', 'American Express'],
      investmentOptions: ['RRSP', 'TFSA', 'RESP', 'Non-Registered Account'],
      loanTypes: ['Mortgage', 'Auto Loan', 'Student Loan', 'Personal Loan', 'Line of Credit']
    }
  },
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    locale: 'en-IN',
    dateFormat: 'DD/MM/YYYY',
    taxSystem: 'progressive',
    taxYearStart: '04-01',
    taxYearEnd: '03-31',
    features: {
      creditScore: true,
      investmentTypes: ['stocks', 'mutual_funds', 'etf', 'bonds', 'ppf', 'epf', 'nps', 'fd', 'rd', 'gold', 'crypto'],
      bankingIntegration: ['Razorpay', 'Paytm', 'PhonePe'],
      paymentMethods: ['UPI', 'NEFT', 'RTGS', 'IMPS', 'Credit Card', 'Debit Card', 'Net Banking']
    },
    financialProducts: {
      creditCards: ['Visa', 'Mastercard', 'RuPay', 'American Express'],
      investmentOptions: ['PPF', 'EPF', 'NPS', 'ELSS', 'FD', 'RD', 'Mutual Funds', 'Stocks'],
      loanTypes: ['Home Loan', 'Personal Loan', 'Car Loan', 'Education Loan', 'Gold Loan']
    }
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'د.إ',
    locale: 'en-AE',
    dateFormat: 'DD/MM/YYYY',
    taxSystem: 'vat',
    taxYearStart: '01-01',
    taxYearEnd: '12-31',
    features: {
      creditScore: false,
      investmentTypes: ['stocks', 'mutual_funds', 'etf', 'bonds', 'gold', 'real_estate', 'crypto'],
      bankingIntegration: ['Emirates NBD API', 'ADCB API'],
      paymentMethods: ['Bank Transfer', 'Credit Card', 'Debit Card', 'Apple Pay', 'Samsung Pay']
    },
    financialProducts: {
      creditCards: ['Visa', 'Mastercard', 'American Express'],
      investmentOptions: ['Savings Account', 'Fixed Deposit', 'Mutual Funds', 'Stocks', 'Gold'],
      loanTypes: ['Home Loan', 'Personal Loan', 'Auto Loan', 'Credit Card']
    }
  }
};

export function getCountryConfig(countryCode: CountryCode): CountryConfig {
  return COUNTRIES[countryCode] || COUNTRIES.US;
}

export function formatCurrency(amount: number, countryCode: CountryCode): string {
  const config = getCountryConfig(countryCode);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompact(amount: number, countryCode: CountryCode): string {
  const config = getCountryConfig(countryCode);
  const symbol = config.currencySymbol;
  const absAmount = Math.abs(amount);

  if (absAmount >= 1000000) {
    return `${symbol}${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${symbol}${(absAmount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${absAmount.toFixed(0)}`;
}

export function formatDate(date: Date | string, countryCode: CountryCode): string {
  const config = getCountryConfig(countryCode);
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(config.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function getTaxYear(date: Date, countryCode: CountryCode): { start: Date; end: Date } {
  const config = getCountryConfig(countryCode);
  const currentYear = date.getFullYear();
  const [startMonth, startDay] = config.taxYearStart.split('-').map(Number);
  const [endMonth, endDay] = config.taxYearEnd.split('-').map(Number);
  
  let startYear = currentYear;
  let endYear = currentYear;
  
  // Handle tax years that span calendar years (like India: Apr 1 - Mar 31)
  if (startMonth > endMonth || (startMonth === endMonth && startDay > endDay)) {
    if (date.getMonth() + 1 < startMonth || (date.getMonth() + 1 === startMonth && date.getDate() < startDay)) {
      startYear = currentYear - 1;
    } else {
      endYear = currentYear + 1;
    }
  }
  
  return {
    start: new Date(startYear, startMonth - 1, startDay),
    end: new Date(endYear, endMonth - 1, endDay),
  };
}

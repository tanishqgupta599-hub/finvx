
export type TaxRegime = "old" | "new" | "none";
export type TaxJurisdiction = "IN" | "UAE" | "US" | "UK";

export interface TaxProfile {
  id: string;
  jurisdiction: TaxJurisdiction;
  regime: TaxRegime;
  pan?: string; // India specific
  fiscalYearStart: string; // e.g., "2024-04-01"
  filingStatus: "individual" | "huf" | "company";
}

export interface TaxLot {
  id: string;
  assetId: string; // or assetName if simple
  assetName?: string; // Added for display
  purchaseDate: string;
  purchasePrice: number;
  quantity: number;
  type: "equity" | "debt" | "crypto" | "property" | "gold";
  isLongTerm?: boolean; // Computed
  currentPrice?: number; // Added for simulation
}

export interface CapitalGainEvent {
  id: string;
  lotId: string;
  sellDate: string;
  sellPrice: number;
  quantity: number;
  gain: number;
  tax: number;
  type: "STCG" | "LTCG";
}

export interface TaxBreakdown {
  grossIncome: number;
  taxableIncome: number;
  deductions: number;
  incomeTax: number;
  surcharge: number;
  cess: number;
  capitalGainsTax: number;
  totalTaxLiability: number;
  effectiveRate: number;
}

export interface TaxEstimateSnapshot {
  id: string;
  timestamp: string;
  jurisdiction: TaxJurisdiction;
  breakdown: TaxBreakdown;
  confidenceScore: number; // 0-100
  isProjection: boolean;
}

export interface TaxSectionUsage {
  sectionId: string; // e.g., "80C", "80D"
  limit: number;
  used: number;
  remaining: number;
  name: string;
  description: string;
}

export interface TaxActionStep {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  potentialSaving: number; // matched with component usage
  type: "investment" | "filing" | "harvesting";
  status?: "pending" | "completed" | "ignored";
  isCompleted: boolean; // matched with component usage
  actionUrl?: string;
  impactLevel: "high" | "medium" | "low";
}

export interface TaxActionPlan {
  id: string;
  steps: TaxActionStep[];
  totalPotentialSavings: number;
  generatedAt: string;
}

export interface TaxRule {
  id: string;
  jurisdiction: TaxJurisdiction;
  name: string;
  description: string;
  slabs?: { limit: number; rate: number }[];
  cessRate?: number;
}

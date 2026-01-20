
import { TaxBreakdown, TaxLot, CapitalGainEvent, TaxSectionUsage, TaxRegime, TaxJurisdiction } from "@/domain/tax";
import { differenceInDays, parseISO } from "date-fns";

export interface TaxEngine {
  jurisdiction: TaxJurisdiction;
  calculateIncomeTax(taxableIncome: number, regime: TaxRegime): { tax: number; cess: number; surcharge: number };
  calculateCapitalGains(lot: TaxLot, sellDate: string, sellPrice: number): CapitalGainEvent;
  getDeductionSections(regime: TaxRegime): TaxSectionUsage[];
  getTaxBreakdown(income: number, gains: number, deductions: number, regime: TaxRegime): TaxBreakdown;
}

export class IndiaTaxEngine implements TaxEngine {
  jurisdiction: TaxJurisdiction = "IN";

  calculateIncomeTax(taxableIncome: number, regime: TaxRegime): { tax: number; cess: number; surcharge: number } {
    let tax = 0;
    
    // Simplified FY24-25 New Regime Slabs
    if (regime === "new") {
      if (taxableIncome <= 300000) tax = 0;
      else if (taxableIncome <= 700000) tax = (taxableIncome - 300000) * 0.05;
      else if (taxableIncome <= 1000000) tax = 20000 + (taxableIncome - 700000) * 0.10;
      else if (taxableIncome <= 1200000) tax = 50000 + (taxableIncome - 1000000) * 0.15;
      else if (taxableIncome <= 1500000) tax = 80000 + (taxableIncome - 1200000) * 0.20;
      else tax = 140000 + (taxableIncome - 1500000) * 0.30;
      
      // Rebate u/s 87A for income up to 7L
      if (taxableIncome <= 700000) tax = 0;
    } else {
      // Old Regime (Simplified generic slabs)
      if (taxableIncome <= 250000) tax = 0;
      else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
      else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
      else tax = 112500 + (taxableIncome - 1000000) * 0.30;

      // Rebate u/s 87A for income up to 5L
      if (taxableIncome <= 500000) tax = 0;
    }

    const surcharge = taxableIncome > 5000000 ? tax * 0.10 : 0; // Simplified surcharge
    const cess = (tax + surcharge) * 0.04;

    return { tax, cess, surcharge };
  }

  calculateCapitalGains(lot: TaxLot, sellDate: string, sellPrice: number): CapitalGainEvent {
    const purchaseDate = parseISO(lot.purchaseDate);
    const sellDt = parseISO(sellDate);
    const holdingDays = differenceInDays(sellDt, purchaseDate);
    const gain = (sellPrice - lot.purchasePrice) * lot.quantity;
    
    let tax = 0;
    let type: "STCG" | "LTCG" = "STCG";

    if (lot.type === "equity") {
      // Equity: LTCG > 12 months (365 days)
      if (holdingDays > 365) {
        type = "LTCG";
        // LTCG 12.5% above 1.25L (Simplified: assuming this is the only gain for now)
        // In a real engine, we'd aggregate gains first. Here we calculate per lot conservatively.
        const taxableGain = Math.max(0, gain - 125000); 
        tax = taxableGain * 0.125;
      } else {
        type = "STCG";
        // STCG 20%
        tax = Math.max(0, gain) * 0.20;
      }
    } else if (lot.type === "debt") {
      // Debt: Taxed at slab rate (treated as STCG for simplicity here, effectively added to income)
      // Real implementation would add to income. For estimation:
      type = "STCG";
      tax = Math.max(0, gain) * 0.30; // Worst case assumption
    }

    return {
      id: crypto.randomUUID(),
      lotId: lot.id,
      sellDate,
      sellPrice,
      quantity: lot.quantity,
      gain,
      tax,
      type
    };
  }

  getDeductionSections(regime: TaxRegime): TaxSectionUsage[] {
    if (regime === "new") return []; // New regime has almost no deductions

    return [
      { sectionId: "80C", name: "Section 80C", description: "LIC, PPF, ELSS, EPF", limit: 150000, used: 0, remaining: 150000 },
      { sectionId: "80D", name: "Section 80D", description: "Health Insurance Premium", limit: 25000, used: 0, remaining: 25000 },
      { sectionId: "80CCD(1B)", name: "NPS", description: "National Pension System", limit: 50000, used: 0, remaining: 50000 },
      { sectionId: "24(b)", name: "Home Loan Interest", description: "Interest on self-occupied property", limit: 200000, used: 0, remaining: 200000 },
    ];
  }

  getTaxBreakdown(income: number, gains: number, deductions: number, regime: TaxRegime): TaxBreakdown {
    const taxableIncome = Math.max(0, income - deductions);
    const { tax: incomeTax, cess, surcharge } = this.calculateIncomeTax(taxableIncome, regime);
    
    // Simplified: Gains tax is calculated separately in this model and added
    // In a full engine, gains would be part of taxable income with special rates.
    // Here we assume 'gains' input is the tax on gains for simplicity of the aggregate view.
    const capitalGainsTax = gains; 

    const totalTaxLiability = incomeTax + surcharge + cess + capitalGainsTax;

    return {
      grossIncome: income,
      taxableIncome,
      deductions,
      incomeTax,
      surcharge,
      cess,
      capitalGainsTax,
      totalTaxLiability,
      effectiveRate: income > 0 ? (totalTaxLiability / income) * 100 : 0
    };
  }
}

export class UaeTaxEngine implements TaxEngine {
  jurisdiction: TaxJurisdiction = "UAE";

  calculateIncomeTax(taxableIncome: number, regime: TaxRegime): { tax: number; cess: number; surcharge: number } {
    return { tax: 0, cess: 0, surcharge: 0 }; // 0% Personal Income Tax
  }

  calculateCapitalGains(lot: TaxLot, sellDate: string, sellPrice: number): CapitalGainEvent {
    const gain = (sellPrice - lot.purchasePrice) * lot.quantity;
    return {
      id: crypto.randomUUID(),
      lotId: lot.id,
      sellDate,
      sellPrice,
      quantity: lot.quantity,
      gain,
      tax: 0, // 0% Capital Gains
      type: "STCG"
    };
  }

  getDeductionSections(regime: TaxRegime): TaxSectionUsage[] {
    return [];
  }

  getTaxBreakdown(income: number, gains: number, deductions: number, regime: TaxRegime): TaxBreakdown {
    return {
      grossIncome: income,
      taxableIncome: income,
      deductions: 0,
      incomeTax: 0,
      surcharge: 0,
      cess: 0,
      capitalGainsTax: 0,
      totalTaxLiability: 0,
      effectiveRate: 0
    };
  }
}

export const TaxEngineFactory = {
  getEngine: (jurisdiction: TaxJurisdiction): TaxEngine => {
    switch (jurisdiction) {
      case "IN": return new IndiaTaxEngine();
      case "UAE": return new UaeTaxEngine();
      default: return new IndiaTaxEngine();
    }
  }
};

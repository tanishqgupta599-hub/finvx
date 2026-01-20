
import { useMemo } from "react";
import { useAppStore } from "@/state/app-store";
import { TaxEngineFactory } from "@/lib/tax/engine";
import { TaxBreakdown } from "@/domain/tax";

export function useTaxCalculation() {
  const taxProfile = useAppStore((s) => s.taxProfile);
  const profile = useAppStore((s) => s.profile);
  const transactions = useAppStore((s) => s.transactions);
  
  const engine = useMemo(() => {
    return TaxEngineFactory.getEngine(taxProfile?.jurisdiction || "IN");
  }, [taxProfile?.jurisdiction]);

  const estimates = useMemo(() => {
    if (!taxProfile || !profile) return null;

    // 1. Aggregate Income
    // Salary from Profile + Income Transactions
    const salaryIncome = profile.incomeStreams?.reduce((acc, s) => acc + (s.frequency === "monthly" ? s.amount * 12 : s.amount), 0) || 0;
    
    const txnIncome = transactions
      .filter(t => t.category === "income" && new Date(t.date) >= new Date(taxProfile.fiscalYearStart))
      .reduce((acc, t) => acc + t.amount, 0);

    const grossIncome = salaryIncome + txnIncome;

    // 2. Aggregate Deductions (Simplified)
    // In a real app, we'd sum up 80C investments from transactions
    const deductions = 0; // Placeholder

    // 3. Aggregate Capital Gains (Simplified)
    // We'd sum up realized gains from transactions
    const gainsTax = 0; // Placeholder

    const breakdown = engine.getTaxBreakdown(grossIncome, gainsTax, deductions, taxProfile.regime);

    return {
      breakdown,
      engine
    };
  }, [taxProfile, profile, transactions, engine]);

  return estimates;
}

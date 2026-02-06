
"use client";

import { useAppStore } from "@/state/app-store";
import { ArrowDown, ArrowUp, DollarSign, Info, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { IndiaTaxEngine } from "@/lib/tax/engine";
import { TaxBreakdown, TaxProfile } from "@/domain/tax";
import { useCurrencyFormat } from "@/lib/currency";

export function TaxOverview() {
  const profile = useAppStore((s) => s.profile);
  const storedTaxProfile = useAppStore((s) => s.taxProfile);
  const assets = useAppStore((s) => s.assets);
  const { format } = useCurrencyFormat();
  
  // Memoize taxProfile to prevent recreation on every render
  const taxProfile: TaxProfile = useMemo(() => {
    return storedTaxProfile || {
      id: "default",
      jurisdiction: "IN",
      regime: "new",
      fiscalYearStart: "2024-04-01",
      filingStatus: "individual"
    };
  }, [storedTaxProfile]);

  // Memoize income streams to prevent unnecessary recalculations
  const incomeStreams = useMemo(() => profile?.incomeStreams || [], [profile?.incomeStreams]);

  // Local state for the calculated breakdown
  const [breakdown, setBreakdown] = useState<TaxBreakdown | null>(null);
  
  // Use ref to track previous calculation to prevent unnecessary updates
  const prevCalculationRef = useRef<string>("");

  useEffect(() => {
    if (!taxProfile || taxProfile.jurisdiction !== "IN") return;

    // Calculate Gross Income from Income Streams
    const annualGrossIncome = incomeStreams.reduce((total, stream) => {
      let annualAmount = stream.amount;
      switch (stream.frequency) {
        case "monthly":
          annualAmount = stream.amount * 12;
          break;
        case "weekly":
          annualAmount = stream.amount * 52;
          break;
        case "yearly":
          annualAmount = stream.amount;
          break;
        case "irregular":
          annualAmount = stream.amount;
          break;
      }
      return total + annualAmount;
    }, 0);

    const estimatedGrossIncome = annualGrossIncome > 0 ? annualGrossIncome : 0;
    
    // Mock Deductions (Standard Deduction + 80C etc)
    const standardDeduction = 75000; // FY25 New Regime
    const estimatedDeductions = taxProfile.regime === "new" ? standardDeduction : 150000 + standardDeduction;

    const engine = new IndiaTaxEngine();
    const calculation = engine.getTaxBreakdown(
      estimatedGrossIncome,
      0, // No realized gains in overview yet
      estimatedDeductions,
      taxProfile.regime
    );

    // Create a stable key to compare calculations
    const calculationKey = JSON.stringify({
      income: estimatedGrossIncome,
      deductions: estimatedDeductions,
      regime: taxProfile.regime,
      totalTax: calculation.totalTaxLiability
    });

    // Only update if calculation actually changed
    if (prevCalculationRef.current !== calculationKey) {
      prevCalculationRef.current = calculationKey;
      setBreakdown(calculation);
    }
  }, [taxProfile, incomeStreams]);

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-900/20">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Estimated Tax Liability</p>
              <h2 className="mt-1 text-4xl font-bold tracking-tight">
                {breakdown?.totalTaxLiability ? format(breakdown.totalTaxLiability) : "..."}
              </h2>
            </div>
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-xs font-medium text-blue-200">Effective Rate</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold">
                  {breakdown?.effectiveRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-200">Regime</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-semibold capitalize">{taxProfile.regime}</span>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                  FY24-25
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Taxable Income</span>
          </div>
          <div className="mt-2 text-xl font-semibold text-white">
            {breakdown?.taxableIncome ? format(breakdown.taxableIncome) : "0"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Capital Gains Tax</span>
          </div>
          <div className="mt-2 text-xl font-semibold text-white">
            {breakdown?.capitalGainsTax ? format(breakdown.capitalGainsTax) : "0"}
          </div>
        </div>
      </div>

      {/* Regime Switcher / Comparison Teaser */}
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-4">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-zinc-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-300">
              Regime Comparison
            </p>
            <p className="text-xs text-zinc-500">
              Switching to Old Regime could save you {format(12500)} if you have HRA.
            </p>
          </div>
          <button className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10">
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}

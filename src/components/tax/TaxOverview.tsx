
"use client";

import { useAppStore } from "@/state/app-store";
import { ArrowDown, ArrowUp, DollarSign, Info, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { IndiaTaxEngine } from "@/lib/tax/engine";
import { TaxBreakdown } from "@/domain/tax";

export function TaxOverview() {
  const profile = useAppStore((s) => s.profile);
  const taxProfile = useAppStore((s) => s.taxProfile);
  const assets = useAppStore((s) => s.assets);
  
  // Local state for the calculated breakdown
  const [breakdown, setBreakdown] = useState<TaxBreakdown | null>(null);

  useEffect(() => {
    if (!taxProfile || taxProfile.jurisdiction !== "IN") return;

    // Calculate Gross Income from Income Streams
    const streams = profile?.incomeStreams || [];
    const annualGrossIncome = streams.reduce((total, stream) => {
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
          // Assuming irregular income is entered as a lump sum estimate for the year
          // or we could just treat it as-is. For safety, let's treat it as-is.
          annualAmount = stream.amount;
          break;
      }
      return total + annualAmount;
    }, 0);

    // If no streams, fallback to 0 (or a safe default if we want to show something)
    // But for "proper" logic, it should be 0 if the user has no income.
    // However, to avoid a jarring "0 tax" experience if they haven't set it up,
    // we might want to check if it's 0 and maybe show a prompt? 
    // For now, let's trust the data. If 0, tax is 0.
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

    setBreakdown(calculation);
  }, [taxProfile, assets, profile?.incomeStreams]);

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
                ₹{breakdown?.totalTaxLiability.toLocaleString() ?? "..."}
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
            ₹{breakdown?.taxableIncome.toLocaleString() ?? "0"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Capital Gains Tax</span>
          </div>
          <div className="mt-2 text-xl font-semibold text-white">
            ₹{breakdown?.capitalGainsTax.toLocaleString() ?? "0"}
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
              Switching to Old Regime could save you ₹12,500 if you have HRA.
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

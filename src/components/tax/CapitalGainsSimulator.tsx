
"use client";

import { useAppStore } from "@/state/app-store";
import { useState } from "react";
import { IndiaTaxEngine } from "@/lib/tax/engine";
import { CapitalGainEvent, TaxLot } from "@/domain/tax";
import { ArrowRight, Calculator, Calendar, Coins, TrendingUp } from "lucide-react";

export function CapitalGainsSimulator() {
  const taxLots = useAppStore((s) => s.taxLots);
  
  // State for simulation
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [sellPrice, setSellPrice] = useState<string>("");
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<CapitalGainEvent | null>(null);

  const handleSimulate = () => {
    const lot = taxLots.find(l => l.id === selectedLotId);
    if (!lot) return;

    const price = parseFloat(sellPrice);
    if (isNaN(price)) return;

    const engine = new IndiaTaxEngine();
    const calculation = engine.calculateCapitalGains(lot, sellDate, price);
    setResult(calculation);
  };

  const selectedLot = taxLots.find(l => l.id === selectedLotId);

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/50 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Capital Gains Simulator</h2>
          <p className="text-xs text-zinc-500">Calculate tax before you sell</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Select Asset to Sell</label>
            <select
              value={selectedLotId}
              onChange={(e) => {
                setSelectedLotId(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
            >
              <option value="">-- Select an Asset Lot --</option>
              {taxLots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.type.toUpperCase()} - {lot.quantity} units @ ₹{lot.purchasePrice} ({lot.purchaseDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Selling Price (Per Unit)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-8 pr-4 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Sale Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="date"
                value={sellDate}
                onChange={(e) => setSellDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={!selectedLotId || !sellPrice}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white transition-hover hover:bg-purple-500 disabled:opacity-50"
          >
            Calculate Impact
          </button>
        </div>

        {/* Result Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 p-1">
          {result ? (
            <div className="h-full rounded-xl bg-slate-900/80 p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-zinc-300">Projected Outcome</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${result.gain >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {result.gain >= 0 ? "PROFIT" : "LOSS"}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500">Total Sale Value</span>
                  <span className="font-medium text-white">₹{(result.sellPrice * result.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500">Capital Gain</span>
                  <span className={`font-bold ${result.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.gain >= 0 ? "+" : ""}₹{result.gain.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500">Tax Type</span>
                  <span className="font-medium text-blue-400">{result.type}</span>
                </div>
                
                <div className="mt-4 rounded-lg bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Tax Payable</span>
                    <span className="text-lg font-bold text-white">₹{result.tax.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    *Based on {result.type} rates for FY24-25. Does not account for grandfathering clauses.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-full bg-white/5 p-3">
                <TrendingUp className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-400">Ready to simulate</p>
              <p className="mt-1 max-w-[200px] text-xs text-zinc-600">
                Select an asset and enter sale details to see the tax impact.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

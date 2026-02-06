"use client";

import { useState, useMemo } from "react";
import { useCurrencyFormat } from "@/lib/currency";
import { useAppStore } from "@/state/app-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plane, ShoppingBag, CreditCard, ArrowRight, Gift, TrendingUp, Globe, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PROGRAMS = [
  { value: "amex_mr", label: "Amex Membership Rewards" },
  { value: "chase_ur", label: "Chase Ultimate Rewards" },
  { value: "citi_ty", label: "Citi ThankYou Points" },
  { value: "cap1_miles", label: "Capital One Miles" },
  { value: "bilt", label: "Bilt Rewards" },
];

import { Wallet, Coins } from "lucide-react";

const PROGRAM_KNOWLEDGE_BASE: Record<string, { partners: string[]; avg_cpp: string }> = {
  "amex_mr": {
    partners: ["Delta", "British Airways", "Virgin Atlantic", "Emirates", "Air Canada Aeroplan", "Singapore Airlines", "Hilton", "Marriott"],
    avg_cpp: "2.0"
  },
  "chase_ur": {
    partners: ["United Airlines", "Southwest", "British Airways", "Virgin Atlantic", "Hyatt", "Marriott", "IHG"],
    avg_cpp: "2.1"
  },
  "citi_ty": {
    partners: ["Emirates", "Singapore Airlines", "Turkish Airlines", "Virgin Atlantic", "Air France/KLM", "Wyndham"],
    avg_cpp: "1.8"
  },
  "cap1_miles": {
    partners: ["Air Canada Aeroplan", "British Airways", "Turkish Airlines", "Wyndham", "Virgin Red"],
    avg_cpp: "1.7"
  },
  "bilt": {
    partners: ["American Airlines", "United Airlines", "Hyatt", "Turkish Airlines", "Air Canada Aeroplan"],
    avg_cpp: "2.2"
  }
};

export default function RewardsMaximizerPage() {
  const { format, symbol, currency } = useCurrencyFormat();
  const creditCards = useAppStore((s) => s.creditCards);
  
  // Get cards that actually have points
  const cardsWithPoints = useMemo(() => {
    return creditCards
      .filter(c => (c.pointsBalance || 0) > 0)
      .sort((a, b) => (b.pointsBalance || 0) - (a.pointsBalance || 0));
  }, [creditCards]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async (selectedProgram: string, selectedPoints: number) => {
    if (!selectedProgram || !selectedPoints) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Find readable label or use the raw program name
      const programLabel = PROGRAMS.find(p => p.value === selectedProgram)?.label || selectedProgram;
      
      // Look up known partners for context injection
      let contextInjection = "";
      const kb = PROGRAM_KNOWLEDGE_BASE[selectedProgram];
      if (kb) {
        contextInjection = `
        CRITICAL KNOWLEDGE BASE for ${programLabel}:
        - Valid Transfer Partners: ${kb.partners.join(", ")}.
        - Realistic high-value redemption is around ${kb.avg_cpp} cents per point.
        - DO NOT invent partners not listed here unless you are 100% certain they are valid for ${programLabel}.
        - DO NOT suggest "Statement Credit" as a high-value strategy.
        `;
      }

      const query = `
        I have ${selectedPoints} points in the ${programLabel} program.
        ${contextInjection}
        
        Task:
        1. Calculate the baseline "Cash/Statement Credit" value (usually 0.6-1.0 cents per point).
        2. Identify 3 specific high-value redemption strategies using ONLY valid transfer partners for this program.
        3. Provide specific examples of what this could buy (e.g. "One-way Business Class to London via Virgin Atlantic").
        
        Return ONLY a JSON object with this structure:
        {
          "baseline": {
            "value": "Value in ${currency} symbol",
            "cpp": "0.6",
            "description": "Statement Credit"
          },
          "strategies": [
            {
              "partner": "Partner Name",
              "value": "Value in ${currency} symbol",
              "cpp": "Calculated CPP (e.g. 2.2)",
              "description": "Specific flight/hotel example",
              "type": "Travel"
            }
          ],
          "insight": "A short strategic advice summary."
        }
      `;

      const res = await fetch("/api/oracle/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: [],
          context: {
            currency: currency,
            netWorth: "N/A",
            totalAssets: "N/A",
            totalDebt: "N/A",
            monthlyIncome: "N/A",
            recentTransactions: [],
            creditCards: [] 
          }
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to analyze rewards");

      let jsonStr = data.response;
      // Robust JSON extraction: Find the first { and last }
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
         // Fallback cleanup if regex doesn't match
         jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "");
      }
      
      try {
        setResult(JSON.parse(jsonStr));
      } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Received invalid format from AI. Please try again.");
      }
    } catch (error: any) {
      console.error("Rewards analysis error:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!result) return [];
    return [
      {
        name: "Cash/Credit",
        value: parseFloat(result.baseline.value.replace(/[^0-9.]/g, "")),
        cpp: result.baseline.cpp,
        color: "#71717a" // zinc-500
      },
      ...result.strategies.map((s: any) => ({
        name: s.partner,
        value: parseFloat(s.value.replace(/[^0-9.]/g, "")),
        cpp: s.cpp,
        color: "#06b6d4" // cyan-500
      }))
    ].sort((a, b) => a.value - b.value);
  }, [result]);

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
          Rewards Maximizer
        </h1>
        <p className="text-zinc-400 text-lg">
          Stop burning points for pennies. Discover high-value redemption paths.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cards/Balances Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-400" />
                Your Rewards
              </CardTitle>
              <CardDescription>Select a balance to maximize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cardsWithPoints.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  <Coins className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No reward points found on your linked cards.
                </div>
              ) : (
                cardsWithPoints.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleAnalyze(card.rewardProgram || "Credit Card Points", card.pointsBalance || 0)}
                    disabled={isLoading}
                    className="w-full group relative flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800/50 hover:border-cyan-500/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500/20 transition-colors">
                         {/* Simple Brand Icon Fallback */}
                         <CreditCard className="h-5 w-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-cyan-100 transition-colors">
                          {card.name || card.rewardProgram || "Credit Card"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {card.name && card.rewardProgram ? `${card.rewardProgram} • ` : ""}
                          {card.brand?.toUpperCase()} •••• {card.last4}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white tabular-nums">
                        {(card.pointsBalance || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                        Maximize <Sparkles className="h-3 w-3" />
                      </div>
                    </div>
                    {isLoading && (
                       <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10 opacity-0 group-focus:opacity-100 pointer-events-none">
                         {/* Loading state handled by parent but visual feedback here is nice */}
                       </div>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
          
          <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
             <div className="flex gap-3">
               <Gift className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
               <div className="space-y-1">
                 <p className="text-sm font-medium text-blue-200">Pro Tip</p>
                 <p className="text-xs text-blue-300/80 leading-relaxed">
                   Transferring points to airline partners during bonus periods (e.g. +30% to Virgin Atlantic) can double your value instantly.
                 </p>
               </div>
             </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !isLoading && !error && (
            <div className="h-[400px] rounded-3xl border border-zinc-800 bg-zinc-900/20 flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <Globe className="h-16 w-16 opacity-20" />
              <p>Select a reward balance from the left to maximize its value</p>
            </div>
          )}

          {error && (
            <div className="h-[400px] rounded-3xl border border-red-500/20 bg-red-900/10 flex flex-col items-center justify-center text-red-400 space-y-4 p-8 text-center">
              <div className="p-3 bg-red-500/10 rounded-full">
                <Sparkles className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Analysis Failed</h3>
              <p className="max-w-md">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => setError(null)}
                className="mt-4 border-red-500/30 hover:bg-red-950/50 text-red-300"
              >
                Try Again
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="h-[400px] rounded-3xl border border-zinc-800 bg-zinc-900/20 flex flex-col items-center justify-center relative overflow-hidden">
               <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Plane className="h-16 w-16 text-cyan-500 animate-pulse mb-4" />
              <h3 className="text-xl font-medium text-white">Scanning Flight Networks...</h3>
              <p className="text-zinc-400">Checking transfer partners and redemption sweet spots</p>
            </div>
          )}

          {result && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Insight Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-300">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Strategy Insight</h3>
                    <p className="text-zinc-300 leading-relaxed">{result.insight}</p>
                  </div>
                </div>
              </div>

              {/* Value Comparison Chart */}
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Redemption Value Analysis</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                      <XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={(value) => `${symbol}${value}`} />
                      <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} width={120} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                        cursor={{ fill: '#27272a', opacity: 0.4 }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Cash/Credit' ? '#3f3f46' : '#06b6d4'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Strategy Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {result.strategies.map((strategy: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="h-full border-cyan-500/20 bg-gradient-to-br from-zinc-900 to-zinc-900/50 hover:border-cyan-500/40 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Plane className="h-24 w-24 text-cyan-500 transform rotate-[-10deg]" />
                      </div>
                      <CardHeader className="pb-2 relative">
                        <div className="flex justify-between items-start">
                          <div className="px-2 py-1 rounded text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                            {strategy.cpp} CPP
                          </div>
                        </div>
                        <CardTitle className="text-xl text-white group-hover:text-cyan-300 transition-colors">
                          {strategy.partner}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 relative">
                        <div>
                          <div className="text-3xl font-bold text-white">{strategy.value}</div>
                          <div className="text-sm text-zinc-500">Estimated Value</div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                          <p className="text-zinc-300 text-sm leading-relaxed">
                            {strategy.description}
                          </p>
                        </div>
                        <Button variant="ghost" className="w-full mt-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 group-hover:translate-x-1 transition-all">
                          How to book <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/state/app-store";
import { useCurrencyFormat } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sparkles, ArrowRight, CreditCard, ShoppingBag, Store, ScanLine, Wallet, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Simple Gauge Component
const RewardGauge = ({ value }: { value: string }) => {
  // Extract number for visual (mock percentage logic)
  const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  // Mock scale: assume max realistic return is 10% or $50 for typical small txns
  // This is just for visual "fun"
  const percentage = Math.min(Math.max((numValue * 2), 10), 100); 

  return (
    <div className="relative w-32 h-16 overflow-hidden mx-auto mb-2 group/gauge">
      <div className="absolute top-0 left-0 w-full h-32 rounded-full border-[12px] border-zinc-800 box-border"></div>
      <motion.div 
        initial={{ rotate: -180 }}
        animate={{ rotate: -180 + (percentage * 1.8) }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        className="absolute top-0 left-0 w-full h-32 rounded-full border-[12px] border-cyan-500 border-b-0 border-r-0 border-l-0 box-border shadow-[0_0_20px_rgba(6,182,212,0.5)]"
        style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center z-10">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider group-hover/gauge:text-cyan-400 transition-colors">Score</span>
      </div>
      {/* Holographic Glow Effect */}
      <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover/gauge:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default function SpendOptimizerPage() {
  const router = useRouter();
  const { creditCards, profile } = useAppStore();
  const { format, symbol } = useCurrencyFormat();
  
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("dining");
  const [storeName, setStoreName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const categories = [
    { value: "dining", label: "Dining & Restaurants", color: "from-orange-500 to-red-500" },
    { value: "groceries", label: "Groceries", color: "from-green-500 to-emerald-500" },
    { value: "travel", label: "Travel & Flights", color: "from-blue-500 to-indigo-500" },
    { value: "gas", label: "Gas & Fuel", color: "from-yellow-500 to-orange-500" },
    { value: "online", label: "Online Shopping", color: "from-purple-500 to-pink-500" },
    { value: "entertainment", label: "Entertainment", color: "from-pink-500 to-rose-500" },
    { value: "utilities", label: "Bills & Utilities", color: "from-cyan-500 to-blue-500" },
    { value: "other", label: "General / Other", color: "from-gray-500 to-zinc-500" },
  ];

  const handleAnalyze = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (creditCards.length === 0) {
      toast.error("Please add your credit cards first");
      router.push("/cards");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const cardsContext = creditCards.map(c => ({
        id: c.id,
        name: c.name || c.brand, // Use name if available
        brand: c.brand,
        rewardProgram: c.rewardProgram,
        limit: c.limit
      }));

      const query = `
        I am making a transaction.
        Amount: ${amount} ${profile?.currency || 'USD'}
        Category: ${category}
        Store: ${storeName || 'General Store'}
        
        My Cards: ${JSON.stringify(cardsContext)}
        
        Task:
        1. Identify the BEST card from my list for this transaction based on typical reward structures.
        2. Calculate the estimated value (points/cashback) I will earn.
        3. Compare this with the top market cards (e.g., Chase Sapphire, Amex Gold, etc.) that I DON'T have.
        
        Constraints:
        - You MUST strictly use the cards provided in "My Cards" for the recommendation.
        - You MUST use the currency "${profile?.currency || 'USD'}" (or its symbol) for all monetary values in the response.
        
        Return ONLY a JSON object with this structure (no markdown):
        {
          "bestCardId": "id of my best card",
          "reason": "short explanation why",
          "estimatedValue": "value string like $5.00 or 500 pts",
          "marketComparison": {
             "betterCardAvailable": boolean,
             "topMarketCardName": "name of a better market card",
             "potentialValue": "value string if I used that market card",
             "difference": "how much more I could earn"
          }
        }
      `;

      const res = await fetch("/api/oracle/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: [], // No history needed for this one-off
          context: {
            // Minimal context required by the endpoint
            netWorth: "N/A",
            totalAssets: "N/A",
            totalDebt: "N/A",
            monthlyIncome: "N/A",
            currency: profile?.currency || "USD",
            recentTransactions: [],
            creditCards: [] 
          }
        })
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch AI response");
      }

      // Parse the JSON response from AI
      // AI might wrap it in ```json ... ```
      let jsonStr = data.response;
      if (!jsonStr) throw new Error("No response received from AI");

      if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "");
      } else if (jsonStr.includes("```")) {
         jsonStr = jsonStr.replace(/```/g, "");
      }
      
      const parsedResult = JSON.parse(jsonStr);
      setResult(parsedResult);

    } catch (error) {
      console.error("Optimization error:", error);
      toast.error("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompare = () => {
    // Navigate to comparison page with params
    const params = new URLSearchParams({
      amount,
      category,
      store: storeName,
      userValue: result?.estimatedValue || "0",
      bestUserCard: result?.bestCardId || ""
    });
    router.push(`/optimizer/compare?${params.toString()}`);
  };

  const bestCard = result ? creditCards.find(c => c.id === result.bestCardId) : null;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          Spend Optimizer
        </h1>
        <p className="text-zinc-400">AI-powered recommendation for your next purchase.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Input Form */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-fit relative overflow-hidden group/form">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover/form:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Transaction Details
            </CardTitle>
            <CardDescription>Tell us what you're buying to maximize rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Amount</label>
              <div className="relative group">
                <span className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors">{symbol}</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-7 bg-zinc-950/50 border-zinc-800 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Category</label>
              <div className="relative">
                <ShoppingBag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Select 
                  value={category} 
                  onChange={(v) => setCategory(v)}
                  className="pl-9 bg-zinc-950/50 border-zinc-800"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Store Name (Optional)</label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="e.g. Whole Foods, Amazon" 
                  className="pl-9 bg-zinc-950/50 border-zinc-800"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-12 text-lg font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02]"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <ScanLine className="h-5 w-5" />
                  </motion.div>
                  <span>Scanning Wallet...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Find Best Card</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Area */}
        <div className="space-y-6 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm z-10 overflow-hidden"
              >
                <div className="relative">
                  <motion.div
                    className="absolute -inset-8 rounded-full bg-cyan-500/20 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     className="absolute -inset-1 rounded-full border border-dashed border-cyan-500/30"
                  />
                  <ScanLine className="h-16 w-16 text-cyan-400 relative z-10" />
                </div>
                <motion.div 
                  className="mt-8 space-y-2 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-medium text-white">Analyzing Rewards</h3>
                  <p className="text-zinc-400">Comparing {creditCards.length} cards against market data...</p>
                </motion.div>
              </motion.div>
            )}

            {result && bestCard && !isAnalyzing && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-zinc-900 to-black p-1 ring-1 ring-white/10 relative group shadow-2xl shadow-black/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative rounded-xl bg-zinc-900/90 backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-cyan-400">Top Pick</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        Highest Return
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
                       <div className="text-center md:text-left flex-1">
                          <h3 className="text-3xl font-bold text-white mb-2 leading-tight">Use your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{bestCard.name || bestCard.brand}</span></h3>
                          <p className="text-zinc-400 text-sm">{result.reason}</p>
                       </div>
                       <div className="shrink-0">
                          <RewardGauge value={result.estimatedValue} />
                          <div className="text-center">
                            <div className="text-3xl font-bold text-white tracking-tight">{result.estimatedValue}</div>
                            <div className="text-xs text-emerald-400 font-medium">Estimated Value</div>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white/50" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{bestCard.name || bestCard.brand}</div>
                          <div className="text-xs text-zinc-500">•••• {bestCard.last4}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500">Credit Limit</div>
                        <div className="text-sm font-medium text-zinc-300">{format(bestCard.limit)}</div>
                      </div>
                    </div>

                    {result.marketComparison?.betterCardAvailable && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-5 relative overflow-hidden group/alert cursor-pointer"
                        onClick={handleCompare}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10 transition-transform duration-700 group-hover/alert:scale-150" />
                        
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="mt-1 rounded-full bg-amber-500/20 p-2 text-amber-400 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-amber-200 mb-1">Missed Opportunity Alert</div>
                            <p className="text-sm text-amber-200/70 mb-3 leading-relaxed">
                              You could earn <span className="font-bold text-white">{result.marketComparison.potentialValue}</span> ({result.marketComparison.difference} more) with the <span className="font-bold text-white">{result.marketComparison.topMarketCardName}</span>.
                            </p>
                            <div className="flex items-center text-xs font-bold text-amber-400 uppercase tracking-wider gap-1 group-hover/alert:gap-2 transition-all">
                              See Comparison <ArrowRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {!result && !isAnalyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center group"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative rounded-full bg-zinc-900 border border-zinc-800 p-6 group-hover:border-cyan-500/30 group-hover:scale-110 transition-all duration-500">
                    <Wallet className="h-10 w-10 text-zinc-600 group-hover:text-cyan-400 transition-colors duration-500" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ready to Optimize</h3>
                <p className="text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Enter your transaction details to instantly find the most rewarding card in your wallet.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

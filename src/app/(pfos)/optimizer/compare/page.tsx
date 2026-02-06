"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrencyFormat } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, Sparkles, ExternalLink, CreditCard, TrendingUp, Award, Zap, ScanLine } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

function ComparisonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { format, symbol, currency } = useCurrencyFormat();
  
  const amount = searchParams.get("amount") || "0";
  const category = searchParams.get("category") || "General";
  const store = searchParams.get("store") || "";
  const userValue = searchParams.get("userValue") || "0";
  const bestUserCard = searchParams.get("bestUserCard") || "My Card";

  const [isLoading, setIsLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [insight, setInsight] = useState("");

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const query = `
          I am making a transaction of ${symbol}${amount} (${currency}) at ${store} for ${category}.
          
          Task:
          1. Identify the Top 3 Market Credit Cards for this specific transaction type (e.g. Amex Gold for dining, Chase Sapphire for travel).
          2. Compare them against a generic "Standard User Card" earning typical rewards.
          3. Calculate exact earnings for this transaction AND projected 1-year earnings if I spend ${symbol}${Number(amount) * 12} monthly on this category.
          
          Return ONLY a JSON object with this structure:
          {
            "marketCards": [
              {
                "name": "Card Name",
                "rate": "Multiplier (e.g. 4x)",
                "transactionEarnings": "Value for this txn (formatted with ${symbol})",
                "annualProjection": "Value for 1 year (formatted with ${symbol})",
                "annualFee": "Fee amount (formatted with ${symbol})",
                "verdict": "Best for..."
              }
            ],
            "insight": "A brief 2-sentence summary of the opportunity cost."
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
        
        if (!res.ok || data.error) {
           throw new Error(data.error || "Failed to compare market cards");
        }

        let jsonStr = data.response;
        if (!jsonStr) throw new Error("Empty response from AI");

        if (jsonStr.includes("```json")) {
          jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "");
        } else if (jsonStr.includes("```")) {
           jsonStr = jsonStr.replace(/```/g, "");
        }
        
        const result = JSON.parse(jsonStr);
        setComparisonData(result.marketCards);
        setInsight(result.insight);
      } catch (error) {
        console.error("Comparison error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparison();
  }, [amount, category, store, currency, symbol]);

  const chartData = useMemo(() => {
    return comparisonData.map(card => ({
      name: card.name.split(' ')[0], // Short name
      fullName: card.name,
      value: Number(card.annualProjection.replace(/[^0-9.-]+/g, "")),
      rate: parseFloat(card.rate.replace(/[^0-9.]/g, "")) || 1,
      fee: parseFloat(card.annualFee.replace(/[^0-9.]/g, "")) || 0,
      color: "#06b6d4" // Cyan
    })).sort((a, b) => b.value - a.value);
  }, [comparisonData]);

  // Prepare Radar Data for Top Market Card vs My Card (if data available)
  const radarData = useMemo(() => {
    if (!comparisonData[0]) return [];
    
    const marketCard = comparisonData[0];
    const myVal = parseFloat(userValue.replace(/[^0-9.]/g, "")) || 0;
    const marketVal = parseFloat(marketCard.transactionEarnings.replace(/[^0-9.]/g, "")) || 0;
    
    const myAnnual = myVal * 12; // Approximation if not provided
    const marketAnnual = parseFloat(marketCard.annualProjection.replace(/[^0-9.]/g, "")) || 0;
    
    // Normalize to 100 scale for radar
    const maxAnnual = Math.max(myAnnual, marketAnnual) || 1;
    
    return [
      { subject: '1-Year Value', A: (marketAnnual / maxAnnual) * 100, B: (myAnnual / maxAnnual) * 100, fullMark: 100 },
      { subject: 'Transaction', A: (marketVal / Math.max(marketVal, myVal)) * 100, B: (myVal / Math.max(marketVal, myVal)) * 100, fullMark: 100 },
      { subject: 'Rewards Rate', A: 90, B: 60, fullMark: 100 }, // Mock relative strength if detailed rate parsing fails
    ];
  }, [comparisonData, userValue]);

  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Market Comparison
          </h1>
          <p className="text-zinc-400">
            Comparing rewards for <span className="text-white font-medium">{format(Number(amount))}</span> on <span className="capitalize text-white font-medium">{category}</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[600px] flex-col items-center justify-center space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm relative overflow-hidden">
           <motion.div
            className="absolute -inset-4 rounded-full bg-cyan-500/10 blur-3xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <Sparkles className="h-12 w-12 animate-spin text-cyan-400 mb-4" />
            <h3 className="text-xl font-medium text-white">Analyzing Market Data</h3>
            <p className="text-zinc-400">Scanning top credit cards for maximum returns...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Insight Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-purple-950/20 to-zinc-900/50 p-1"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-20 -translate-y-20" />
            <div className="relative rounded-[22px] bg-zinc-900/40 backdrop-blur-md p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 shrink-0 border border-indigo-500/20">
                  <Zap className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    AI Strategic Insight
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/20">BETA</span>
                  </h3>
                  <p className="text-lg text-zinc-300 leading-relaxed font-light">
                    {insight}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Visual Chart Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 h-full flex flex-col gap-8"
            >
              {/* Main Bar Chart */}
              <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    Annual Reward Potential
                  </CardTitle>
                  <CardDescription>Projected value over 12 months based on your spending habits</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        </linearGradient>
                        <linearGradient id="grayGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3f3f46" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#52525b" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                      <XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={(value) => `${symbol}${value}`} />
                      <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                        cursor={{ fill: '#27272a', opacity: 0.4 }}
                        formatter={(value: any) => [`${symbol}${value}`, 'Est. Value']}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#cyanGradient)' : 'url(#grayGradient)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart Section - "Vs Mode" */}
              <div className="grid md:grid-cols-2 gap-6">
                 <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <ScanLine className="h-5 w-5 text-purple-400" />
                        Card DNA Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#3f3f46" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                            name="Market Leader"
                            dataKey="A"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fill="#06b6d4"
                            fillOpacity={0.4}
                          />
                          <Radar
                            name="My Card"
                            dataKey="B"
                            stroke="#a855f7"
                            strokeWidth={2}
                            fill="#a855f7"
                            fillOpacity={0.4}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                 </Card>

                 {/* Key Stat Cards */}
                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                      <div className="text-sm text-emerald-400 font-medium mb-1">Max Potential Gain</div>
                      <div className="text-3xl font-bold text-white">{comparisonData[0]?.annualProjection || '$0'}</div>
                      <div className="text-xs text-zinc-500 mt-1">If you switch today</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20">
                       <div className="text-sm text-red-400 font-medium mb-1">Current Missed Value</div>
                       <div className="text-3xl font-bold text-white">
                         {symbol}{Math.max((Number(comparisonData[0]?.annualProjection.replace(/[^0-9.-]+/g, "") || 0) - Number(userValue.replace(/[^0-9.-]+/g, "") || 0) * 12), 0).toFixed(0)}
                       </div>
                       <div className="text-xs text-zinc-500 mt-1">Lost annually with current card</div>
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* Top Pick Highlight */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              {comparisonData[0] && (
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-2xl rounded-3xl" />
                  <Card className="relative h-full border-cyan-500/30 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                         <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <Award className="h-6 w-6" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                          #1 Choice
                        </div>
                      </div>
                      <CardTitle className="text-2xl text-white">{comparisonData[0].name}</CardTitle>
                      <CardDescription className="text-zinc-400 line-clamp-2">{comparisonData[0].verdict}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4 flex-1 flex flex-col justify-end">
                      <div className="space-y-1 text-center py-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                        <div className="text-sm text-zinc-500 uppercase tracking-widest font-medium">Potential Value</div>
                        <div className="text-4xl font-bold text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
                          {comparisonData[0].annualProjection}
                        </div>
                        <div className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3" /> +{comparisonData[0].rate} Multiplier
                        </div>
                      </div>
                      
                      <Button className="w-full h-12 text-base font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/20">
                        Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>

          {/* Remaining Cards Grid */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              Other Contenders
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {comparisonData.slice(1).map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                >
                  <Card className="h-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 group">
                    <CardHeader>
                      <CardTitle className="text-lg text-white group-hover:text-cyan-200 transition-colors">{card.name}</CardTitle>
                      <CardDescription className="text-zinc-500">{card.verdict}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                        <div className="text-sm text-zinc-400">Rate</div>
                        <div className="font-mono font-bold text-white">{card.rate}</div>
                      </div>
                      <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                        <div className="text-sm text-zinc-400">1 Year</div>
                        <div className="font-mono font-bold text-emerald-400">{card.annualProjection}</div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-sm text-zinc-400">Fee</div>
                        <div className="font-mono text-sm text-zinc-300">{card.annualFee}</div>
                      </div>
                      
                      <Button className="w-full mt-4 border-zinc-700 hover:bg-zinc-800 text-zinc-300" variant="outline" size="sm">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading comparison...</div>}>
      <ComparisonContent />
    </Suspense>
  );
}

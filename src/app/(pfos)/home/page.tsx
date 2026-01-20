"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/state/app-store";
import { EXPENSE_CATEGORIES, Transaction } from "@/domain/models";
import { AlertsList } from "@/components/widgets/AlertsList";
import { QuickAddModal } from "@/components/widgets/QuickAddModal";
import { NetWorthSummaryCard } from "@/components/widgets/NetWorthSummaryCard";
import { DebtFreeCountdownCard } from "@/components/widgets/DebtFreeCountdownCard";
import { SafetyScoreCard } from "@/components/widgets/SafetyScoreCard";
import { SubscriptionLeakCard } from "@/components/widgets/SubscriptionLeakCard";
import { BestCardForSpend } from "@/components/widgets/BestCardForSpend";
import { BudgetPulseCard } from "@/components/widgets/BudgetPulseCard";
import { TopActionsList } from "@/components/widgets/TopActionsList";
import { FinancialAvatar } from "@/components/profile/FinancialAvatar";
import { financeQuotes } from "@/lib/quotes";
import { Sparkles, ArrowRight, CreditCard, Calendar, TrendingUp, Shield, Activity, Zap, CheckCircle2, Quote } from "lucide-react";

type QuickAddType = "asset" | "loan" | "expense" | "income" | "card" | "policy" | "subscription" | null;

export default function Home() {
  const profile = useAppStore((s) => s.profile);
  const mode = useAppStore((s) => s.profileMode);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);
  const calendarEvents = useAppStore((s) => s.calendarEvents);
  const creditCards = useAppStore((s) => s.creditCards);
  const taxProfile = useAppStore((s) => s.taxProfile);
  
  const addAsset = useAppStore((s) => s.addAsset);
  const addLoan = useAppStore((s) => s.addLoan);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const addCreditCard = useAppStore((s) => s.addCreditCard);
  const addInsurancePolicy = useAppStore((s) => s.addInsurancePolicy);
  const addSubscription = useAppStore((s) => s.addSubscription);
  
  const router = useRouter();
  const [quickAdd, setQuickAdd] = useState<QuickAddType>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [oracleQuery, setOracleQuery] = useState("");
  const [randomQuote, setRandomQuote] = useState<{text: string, author: string} | null>(null);

  useEffect(() => {
    if (financeQuotes && financeQuotes.length > 0) {
      setRandomQuote(financeQuotes[Math.floor(Math.random() * financeQuotes.length)]);
    }
  }, []);

  const handleOracleSearch = () => {
    if (oracleQuery.trim()) {
      router.push(`/oracle?q=${encodeURIComponent(oracleQuery)}`);
    } else {
      router.push("/oracle");
    }
  };

  // ... (rest of the state logic)

  // Derived State for New Widgets
  const upcomingBills = calendarEvents
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const totalCreditLimit = creditCards.reduce((acc, c) => acc + (c.limit || 0), 0);
  const totalCreditBalance = creditCards.reduce((acc, c) => acc + (c.balance || 0), 0);
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : 0;

  const resetForm = () => setForm({});

  const handleSubmit = () => {
    if (!quickAdd) return;
    if (quickAdd === "asset") {
      addAsset({
        id: `a-${Date.now()}`,
        name: form.name || "New asset",
        type: "cash",
        value: Number(form.value || 0),
        institution: form.institution || undefined,
      });
    }
    if (quickAdd === "loan") {
      addLoan({
        id: `l-${Date.now()}`,
        name: form.name || "New loan",
        principal: Number(form.principal || 0),
        balance: Number(form.balance || 0),
        apr: Number(form.apr || 0),
        monthlyPayment: Number(form.emi || 0),
      });
    }
    if (quickAdd === "expense") {
      addTransaction({
        id: `t-${Date.now()}`,
        date: new Date().toISOString(),
        description: form.description || "Expense",
        amount: -Number(form.amount || 0),
        category: (form.category as Transaction["category"]) || "spending",
        account: form.account || undefined,
      });
    }
    if (quickAdd === "income") {
      addTransaction({
        id: `t-${Date.now()}`,
        date: new Date().toISOString(),
        description: form.description || "Income",
        amount: Number(form.amount || 0),
        category: "income",
        account: form.account || undefined,
      });
    }
    if (quickAdd === "card") {
      addCreditCard({
        id: `c-${Date.now()}`,
        brand: "visa",
        last4: (form.last4 || "0000").slice(-4),
        limit: Number(form.limit || 0),
        balance: Number(form.balance || 0),
        apr: Number(form.apr || 0),
      });
    }
    if (quickAdd === "policy") {
      addInsurancePolicy({
        id: `p-${Date.now()}`,
        type: "health",
        provider: form.provider || "Policy",
        premium: Number(form.premium || 0),
        coverageAmount: form.coverage ? Number(form.coverage) : undefined,
      });
    }
    if (quickAdd === "subscription") {
      addSubscription({
        id: `s-${Date.now()}`,
        name: form.name || "Subscription",
        amount: Number(form.amount || 0),
        cadence: "monthly",
        nextChargeDate: new Date().toISOString(),
      });
    }
    resetForm();
    setQuickAdd(null);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Personalized Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header & Greeting */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                  System Online
                </span>
             </div>
             <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
               Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{profile?.name || "Pilot"}</span>.
             </h1>
             <p className="text-zinc-400 text-base max-w-xl">
               Your financial operating system is active. <span className="text-zinc-500">Net worth is trending up this week.</span>
             </p>
          </div>

          {/* Oracle AI Input - Prominent */}
          <div className="relative group max-w-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur-md"></div>
            <div className="relative flex items-center bg-zinc-900 rounded-2xl p-2 pl-5 border border-white/10 shadow-2xl">
              <Sparkles className="h-5 w-5 text-cyan-400 mr-4 shrink-0 animate-pulse" />
              <input 
                type="text" 
                placeholder="Ask Oracle AI (e.g., 'Am I spending too much on food?')"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 h-12 text-lg"
                value={oracleQuery}
                onChange={(e) => setOracleQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setOracleQuery("");
                  }
                }}
              />
              <Link href="/oracle">
                <Button size="md" className="bg-white text-black hover:bg-zinc-200 font-semibold px-6 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Ask
                </Button>
              </Link>
            </div>
          </div>

          {/* Daily Finance Quote */}
          {randomQuote && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm"
            >
              <div className="p-2 bg-zinc-900 rounded-lg border border-white/10 shrink-0">
                <Quote className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-zinc-300 italic font-serif leading-relaxed">
                  "{randomQuote.text}"
                </p>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  — {randomQuote.author}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Financial Avatar - Personal Identity */}
        <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900/50 to-black/50 rounded-[32px] border border-white/10 p-8 overflow-hidden backdrop-blur-sm">
           <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
           <div className="relative z-10 scale-110">
              <FinancialAvatar />
           </div>
           <div className="relative z-10 mt-6 text-center space-y-2">
              <div className="text-sm font-medium text-white">{profile?.name}</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider text-zinc-400">
                <Shield className="h-3 w-3 text-emerald-400" />
                {profile?.riskProfile || "Balanced"} Profile
              </div>
           </div>
        </div>
      </section>

      {/* Core Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <NetWorthSummaryCard />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SafetyScoreCard />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
           <BudgetPulseCard />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
           <Card className="h-full bg-zinc-900/50 border-white/10 hover:border-purple-500/30 transition-colors flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" /> Monthly Surplus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">
                   {profile?.currency} 12,400
                </div>
                <div className="text-xs text-zinc-500">
                   Projected savings this month
                </div>
                <div className="mt-4 w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                   <div className="bg-purple-500 h-full rounded-full w-[65%]" />
                </div>
              </CardContent>
           </Card>
        </motion.div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Actions & Alerts (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
           {/* Top Actions */}
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <CheckCircle2 className="h-5 w-5 text-cyan-400" /> Recommended Actions
               </h3>
             </div>
             <TopActionsList />
           </div>

           {/* Subscription Leak */}
           <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <Zap className="h-5 w-5 text-amber-400" /> Detected Leaks
              </h3>
              <SubscriptionLeakCard />
           </div>
        </div>

        {/* Right Column: Cards & Bills (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
           {/* Credit Card Utilization */}
           <Card className="bg-zinc-900/30 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-400" /> Credit Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-3xl font-bold text-white">{creditUtilization.toFixed(0)}%</div>
                    <div className="text-xs text-zinc-500">Utilization</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{profile?.currency} {totalCreditBalance.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">Total Debt</div>
                  </div>
                </div>
                <div className="space-y-1">
                   <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full ${creditUtilization > 30 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                       style={{ width: `${Math.min(creditUtilization, 100)}%` }}
                     />
                   </div>
                   <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-medium">
                      <span>0%</span>
                      <span>30%</span>
                      <span>100%</span>
                   </div>
                </div>
                <div className="mt-6">
                   <Link href="/cards" className="block w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-xs font-medium text-white transition-colors border border-white/5">
                     Manage Cards
                   </Link>
                </div>
              </CardContent>
           </Card>

           {/* Upcoming Bills */}
           <Card className="bg-zinc-900/30 border-white/10">
             <CardHeader className="pb-3 border-b border-white/5">
               <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                 <Calendar className="h-4 w-4 text-rose-400" /> Upcoming
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-4">
               {upcomingBills.length > 0 ? (
                 <div className="space-y-4">
                   {upcomingBills.map(bill => (
                     <div key={bill.id} className="flex items-center gap-4">
                       <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-800 border border-white/5 flex flex-col items-center justify-center text-zinc-400">
                         <span className="text-[10px] uppercase font-bold">{new Date(bill.date).toLocaleString('default', { month: 'short' })}</span>
                         <span className="text-sm font-bold text-white">{new Date(bill.date).getDate()}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-sm font-medium text-white truncate">{bill.title}</div>
                         <div className="text-xs text-zinc-500">Due in {Math.ceil((new Date(bill.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</div>
                       </div>
                       <div className="text-sm font-semibold text-white">
                         {profile?.currency} {bill.amount?.toLocaleString() || 0}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-sm text-zinc-500 py-2">No upcoming bills this week.</div>
               )}
               <div className="mt-6">
                  <Link href="/calendar" className="block w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-xs font-medium text-white transition-colors border border-white/5">
                    View Full Calendar
                  </Link>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>


      {/* Quick Actions Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30"
      >
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl flex items-center justify-between gap-2 pl-4">
          <span className="text-xs font-semibold text-zinc-400 hidden md:block">QUICK ADD</span>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {[
              { label: "Expense", type: "expense", icon: Zap },
              { label: "Income", type: "income", icon: TrendingUp },
              { label: "Asset", type: "asset", icon: Activity },
              { label: "Loan", type: "loan", icon: CreditCard },
              { label: "Card", type: "card", icon: CreditCard },
              { label: "Sub", type: "subscription", icon: Calendar },
              { label: "Policy", type: "policy", icon: Shield },
            ].map((action) => (
              <button
                key={action.type}
                onClick={() => setQuickAdd(action.type as QuickAddType)}
                className="flex items-center gap-2 px-4 py-3 md:py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm md:text-xs font-medium text-white transition-colors whitespace-nowrap active:scale-95"
              >
                <action.icon className="h-4 w-4 md:h-3 md:w-3" />
                {action.label}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <Button 
            size="icon" 
            className="rounded-full bg-cyan-500 text-black hover:bg-cyan-400 h-10 w-10 shrink-0"
            onClick={() => setQuickAdd("expense")}
          >
            <Zap className="h-5 w-5 fill-black" />
          </Button>
        </div>
      </motion.div>

      <QuickAddModal
        title={
          quickAdd === "asset"
            ? "Add asset"
            : quickAdd === "loan"
            ? "Add loan"
            : quickAdd === "expense"
            ? "Add expense"
            : quickAdd === "income"
            ? "Add income"
            : quickAdd === "card"
            ? "Add credit card"
            : quickAdd === "policy"
            ? "Add insurance policy"
            : "Add subscription"
        }
        open={quickAdd !== null}
        onOpenChange={(open) => {
          if (!open) {
            setQuickAdd(null);
            resetForm();
          }
        }}
      >
        <div className="space-y-4">
          {quickAdd === "asset" && (
            <>
              <Input
                placeholder="Asset Name (e.g., Tesla Stock)"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Value"
                type="number"
                value={form.value || ""}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
              <Input
                placeholder="Institution (Optional)"
                value={form.institution || ""}
                onChange={(e) =>
                  setForm({ ...form, institution: e.target.value })
                }
              />
            </>
          )}

          {quickAdd === "loan" && (
            <>
              <Input
                placeholder="Loan Name (e.g., Home Loan)"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Principal Amount"
                type="number"
                value={form.principal || ""}
                onChange={(e) => setForm({ ...form, principal: e.target.value })}
              />
              <Input
                placeholder="Current Balance"
                type="number"
                value={form.balance || ""}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
              <Input
                placeholder="Interest Rate (APR %)"
                type="number"
                value={form.apr || ""}
                onChange={(e) => setForm({ ...form, apr: e.target.value })}
              />
              <Input
                placeholder="Monthly Payment"
                type="number"
                value={form.emi || ""}
                onChange={(e) => setForm({ ...form, emi: e.target.value })}
              />
            </>
          )}

          {quickAdd === "expense" && (
            <>
              <Input
                placeholder="Description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <Input
                placeholder="Amount"
                type="number"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <Select
                value={form.category || "spending"}
                onChange={(val) => setForm({ ...form, category: val })}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </>
          )}

          {quickAdd === "income" && (
            <>
              <Input
                placeholder="Source"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <Input
                placeholder="Amount"
                type="number"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </>
          )}

          {quickAdd === "card" && (
            <>
              <Input
                placeholder="Last 4 Digits"
                maxLength={4}
                value={form.last4 || ""}
                onChange={(e) => setForm({ ...form, last4: e.target.value })}
              />
              <Input
                placeholder="Total Limit"
                type="number"
                value={form.limit || ""}
                onChange={(e) => setForm({ ...form, limit: e.target.value })}
              />
              <Input
                placeholder="Current Balance"
                type="number"
                value={form.balance || ""}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
              <Input
                placeholder="APR %"
                type="number"
                value={form.apr || ""}
                onChange={(e) => setForm({ ...form, apr: e.target.value })}
              />
            </>
          )}

          {quickAdd === "policy" && (
            <>
              <Input
                placeholder="Provider Name"
                value={form.provider || ""}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              />
              <Input
                placeholder="Annual Premium"
                type="number"
                value={form.premium || ""}
                onChange={(e) => setForm({ ...form, premium: e.target.value })}
              />
              <Input
                placeholder="Coverage Amount"
                type="number"
                value={form.coverage || ""}
                onChange={(e) => setForm({ ...form, coverage: e.target.value })}
              />
            </>
          )}

          {quickAdd === "subscription" && (
            <>
              <Input
                placeholder="Service Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Monthly Cost"
                type="number"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setQuickAdd(null)}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-cyan-500 text-black hover:bg-cyan-400">
              Save
            </Button>
          </div>
        </div>
      </QuickAddModal>
    </div>
  );
}


"use client";

import { useAppStore } from "@/state/app-store";
import { useCurrencyFormat } from "@/lib/currency";
import { CheckCircle, Circle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export function TaxActionPlan() {
  const { format } = useCurrencyFormat();
  const plan = useAppStore((s) => s.taxActionPlan);
  const toggleStep = useAppStore((s) => s.toggleTaxActionStep);
  const setTaxActionPlan = useAppStore((s) => s.setTaxActionPlan);
  const userProfile = useAppStore((s) => s.profile);
  const taxProfile = useAppStore((s) => s.taxProfile);
  const investments = useAppStore((s) => s.assets);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      // Calculate annual income
      const incomeStreams = userProfile?.incomeStreams || [];
      const annualIncome = incomeStreams.reduce((acc, stream) => {
        let multiplier = 1;
        if (stream.frequency === 'monthly') multiplier = 12;
        if (stream.frequency === 'weekly') multiplier = 52;
        if (stream.frequency === 'yearly') multiplier = 1;
        return acc + (stream.amount * multiplier);
      }, 0);

      // Estimate age
      let age = 30;
      if (userProfile?.ageRange) {
         const range = userProfile.ageRange;
         if (range === "18-24") age = 21;
         else if (range === "25-34") age = 30;
         else if (range === "35-44") age = 40;
         else if (range === "45-54") age = 50;
         else if (range === "55+") age = 60;
      }

      // Construct context from store
      const context = {
        annualIncome,
        investments: investments.map(a => ({ name: a.name, value: a.value, type: a.type })),
        regime: taxProfile?.regime,
        age,
        rentPaid: 0 // Ideally fetch from expenses
      };

      const response = await fetch("/api/tax/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");

      const newPlan = await response.json();
      setTaxActionPlan(newPlan);
      toast.success("Tax Strategy Generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate tax plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback empty state if no plan exists
  if (!plan) {
    return (
      <div className="space-y-6 rounded-3xl border border-white/5 bg-slate-950/50 p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">AI Tax Strategy</h2>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xs text-zinc-500">Tailored for your portfolio</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-sm text-zinc-400">No tax strategy generated yet.</p>
          <button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="mt-4 flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Analyzing...
              </>
            ) : (
              "Generate Plan"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/5 bg-slate-950/50 p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI Tax Strategy</h2>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-xs text-zinc-500">Tailored for your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 disabled:opacity-50"
            title="Regenerate Plan"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </button>
          <div className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
            Potential Savings: {format(plan.totalPotentialSavings)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {plan.steps.map((step) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group relative overflow-hidden rounded-2xl border p-4 transition-all ${
              step.isCompleted
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-white/5 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleStep(step.id)}
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                  step.isCompleted ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              >
                {step.isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              
              <div className="flex-1 space-y-1">
                <div className={`font-medium ${step.isCompleted ? "text-zinc-400 line-through" : "text-white"}`}>
                  {step.title}
                </div>
                <div className="text-xs text-zinc-500">{step.description}</div>
                
                {!step.isCompleted && step.actionUrl && (
                  <button className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300">
                    Take Action <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>

              {step.potentialSaving > 0 && !step.isCompleted && (
                <div className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-300">
                  Save {format(step.potentialSaving)}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


"use client";

import { useAppStore } from "@/state/app-store";
import { CheckCircle, Circle, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function TaxActionPlan() {
  const plan = useAppStore((s) => s.taxActionPlan);
  const toggleStep = useAppStore((s) => s.toggleTaxActionStep);

  if (!plan) return null;

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
        <div className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
          Potential Savings: ₹{plan.totalPotentialSavings.toLocaleString()}
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
                  Save ₹{step.potentialSaving.toLocaleString()}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

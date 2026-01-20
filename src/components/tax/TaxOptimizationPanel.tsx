
"use client";

import { useAppStore } from "@/state/app-store";
import { IndiaTaxEngine } from "@/lib/tax/engine";
import { TaxSectionUsage } from "@/domain/tax";
import { useEffect, useState } from "react";
import { CheckCircle, Circle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function TaxOptimizationPanel() {
  const taxProfile = useAppStore((s) => s.taxProfile);
  const [sections, setSections] = useState<TaxSectionUsage[]>([]);

  useEffect(() => {
    if (!taxProfile || taxProfile.jurisdiction !== "IN") return;

    const engine = new IndiaTaxEngine();
    // In a real app, we would pass actual investment data to calculate 'used'.
    // Here we get the limits and mock the usage for demo visualization.
    const availableSections = engine.getDeductionSections(taxProfile.regime);
    
    // Mock usage data for visualization
    const sectionsWithUsage = availableSections.map(section => ({
      ...section,
      used: section.sectionId === "80C" ? 100000 : 
            section.sectionId === "80D" ? 15000 : 0,
      remaining: section.sectionId === "80C" ? 50000 : 
                 section.sectionId === "80D" ? 10000 : section.limit
    }));

    setSections(sectionsWithUsage);
  }, [taxProfile]);

  if (!taxProfile) return null;

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/50 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Tax Optimization</h2>
            <p className="text-xs text-zinc-500">Maximize your deductions</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            ₹{sections.reduce((acc, curr) => acc + curr.used, 0).toLocaleString()}
          </div>
          <p className="text-xs text-zinc-500">Total Deductions Claimed</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const progress = (section.used / section.limit) * 100;
          const isMaxed = section.used >= section.limit;

          return (
            <motion.div
              key={section.sectionId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{section.name}</h3>
                  <p className="text-xs text-zinc-400">{section.description}</p>
                </div>
                {isMaxed ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-600" />
                )}
              </div>

              <div className="mb-2 flex items-end justify-between text-sm">
                <span className="font-medium text-zinc-300">
                  ₹{section.used.toLocaleString()}
                </span>
                <span className="text-zinc-500">
                  of ₹{section.limit.toLocaleString()}
                </span>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`absolute h-full rounded-full ${
                    isMaxed ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
              </div>

              {!isMaxed && (
                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Available to save:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{section.remaining.toLocaleString()}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {sections.length === 0 && (
         <div className="py-8 text-center text-zinc-500">
           No deductions available for the selected regime ({taxProfile.regime}).
         </div>
      )}
    </div>
  );
}

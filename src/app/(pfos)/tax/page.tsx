
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaxOverview } from "@/components/tax/TaxOverview";
import { CapitalGainsSimulator } from "@/components/tax/CapitalGainsSimulator";
import { TaxOptimizationPanel } from "@/components/tax/TaxOptimizationPanel";
import { TaxActionPlan } from "@/components/tax/TaxActionPlan";
import { Settings, BarChart3, TrendingUp, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

type Tab = "overview" | "simulator" | "optimization" | "plan" | "settings";

export default function TaxPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "simulator", label: "Simulator", icon: TrendingUp },
    { id: "optimization", label: "Optimization", icon: ShieldCheck },
    { id: "plan", label: "AI Plan", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">TaxOS</h1>
          <p className="text-zinc-400">Your proactive tax intelligence engine</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
          <BookOpen className="h-4 w-4" />
          <span>FY 2024-25 (Assessment Year 2025-26)</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 rounded-2xl bg-white/5 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <TaxOverview />
              <div className="space-y-6">
                <TaxActionPlan />
                <TaxOptimizationPanel />
              </div>
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="mx-auto max-w-2xl">
              <CapitalGainsSimulator />
            </div>
          )}

          {activeTab === "optimization" && (
            <div className="mx-auto max-w-3xl">
              <TaxOptimizationPanel />
            </div>
          )}

          {activeTab === "plan" && (
            <div className="mx-auto max-w-3xl">
              <TaxActionPlan />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-3xl border border-white/5 bg-slate-950/50 p-8 text-center backdrop-blur-sm">
              <Settings className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
              <h3 className="text-lg font-semibold text-white">Tax Settings</h3>
              <p className="text-zinc-500">Configure regime, deductions, and carry-forward losses here.</p>
              <div className="mt-6 rounded-lg bg-yellow-500/10 p-4 text-sm text-yellow-500">
                This module is under development. Defaulting to India / New Regime.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { FinancialAvatar } from "@/components/profile/FinancialAvatar";
import { PersonalitySelector } from "@/components/profile/PersonalitySelector";
import { IncomeFlow } from "@/components/profile/IncomeFlow";
import { GeoFinanceBadge } from "@/components/profile/GeoFinanceBadge";
import { AIInsightsPanel } from "@/components/profile/AIInsightsPanel";
import { CurrencyOrb } from "@/components/profile/CurrencyOrb";
import { AccountsManager } from "@/components/profile/AccountsManager";
import { CardsManager } from "@/components/profile/CardsManager";
import { ProfessionSelector } from "@/components/profile/ProfessionSelector";

export default function ProfilePage() {
  const profile = useAppStore((s) => s.profile);
  const archetype = profile?.financialArchetype || "The Uncharted";

  return (
    <div className="min-h-screen space-y-8 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-950 px-6 py-12 md:px-12">
        {/* Background Ambient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Financial Health Pulse: Strong
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold tracking-tight text-white md:text-6xl"
              >
                {profile?.name}
              </motion.h1>
              
              <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
              >
                {archetype}
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
               <CurrencyOrb />
               <div className="text-xs text-zinc-500">
                 Member since 2024 • {profile?.country}
               </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FinancialAvatar />
          </motion.div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Main Inputs */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. PERSONALITY ENGINE */}
          <section>
            <PersonalitySelector />
          </section>

          {/* 3. PROFESSION */}
          <section className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
            <ProfessionSelector />
          </section>

          {/* 4. INCOME IDENTITY */}
          <section className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
            <IncomeFlow />
          </section>

          {/* 5. ASSETS & LIABILITIES (New) */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <section className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
              <AccountsManager />
            </section>
            <section className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
              <CardsManager />
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN: Context & AI */}
        <div className="space-y-8">
           {/* 6. GEO CONTEXT */}
           <GeoFinanceBadge />
           
           {/* 7. AI INSIGHTS */}
           <AIInsightsPanel />
           
           {/* Extra: Quick Stats */}
           <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center">
             <div className="text-xs text-zinc-500 uppercase tracking-widest">Profile Completion</div>
             <div className="mt-2 text-3xl font-bold text-white">96%</div>
             <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-800">
               <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

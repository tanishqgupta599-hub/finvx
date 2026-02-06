"use client";

import Link from "next/link";
import { ArrowLeft, Check, Sparkles, MessageCircle, Cloud, FileText, Smartphone, Lock, Mic, TrendingUp, Shield, Calendar, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCurrencyFormat } from "@/lib/currency";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const { format } = useCurrencyFormat();

  return (
    <div className="min-h-screen bg-[#020410] text-white selection:bg-cyan-500/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[128px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white mb-12"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mb-6 border border-cyan-500/20">
            <Sparkles className="h-3 w-3" />
            Launch Offer: 50% Off Annual Plan
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Choose your financial destiny
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Powerful tools for everyone. Exclusive intelligence for the committed.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-1 rounded-full bg-zinc-900/50 p-1 border border-white/10 backdrop-blur-sm">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  billing === "monthly" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billing === "yearly" ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                Yearly <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">SAVE 35%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {/* Legacy Tier (Free) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="rounded-3xl border border-white/10 bg-zinc-900/40 p-8 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-zinc-400">Legacy</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{format(0)}</span>
                <span className="text-zinc-500">/forever</span>
              </div>
              <p className="text-zinc-400 mt-4 text-sm leading-relaxed">
                Everything you need to track your wealth privately. No ads, no limits on manual data.
              </p>
            </div>

            <div className="h-px w-full bg-white/5 mb-6" />
            
            <ul className="space-y-4 mb-8">
              {[
                { icon: Lock, text: "Unlimited Local Storage" },
                { icon: Smartphone, text: "Manual Expense Tracking" },
                { icon: TrendingUp, text: "Net Worth Dashboard" },
                { icon: FileText, text: "Basic CSV Import" },
                { icon: Smartphone, text: "SMS/Email Parsing (Local)" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="rounded-full bg-white/5 p-1.5 text-zinc-400">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>

            <button className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Get Started for Free
            </button>
          </motion.div>

          {/* Citizen Tier (Subscription) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-zinc-900/40 p-1 backdrop-blur-md relative overflow-hidden shadow-2xl shadow-cyan-900/20 transform md:-translate-y-4"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
            <div className="rounded-[22px] bg-[#020410]/80 p-7 h-full">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-cyan-500 to-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">
                MOST POPULAR
              </div>

              <div className="mb-6 relative">
                <h3 className="text-xl font-semibold mb-2 text-cyan-400 flex items-center gap-2">
                  Citizen <Sparkles className="h-4 w-4" />
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">
                    {billing === "yearly" ? format(999) : format(129)}
                  </span>
                  <span className="text-zinc-500">/{billing === "yearly" ? "year" : "month"}</span>
                </div>
                {billing === "yearly" && (
                   <div className="text-xs text-emerald-400 mt-1 font-medium">
                     Equivalent to {format(83)}/month
                   </div>
                )}
                <p className="text-zinc-400 mt-4 text-sm leading-relaxed">
                  Supercharge your finances with AI automation and deep insights.
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent mb-6" />
              
              <ul className="space-y-4 mb-8 relative">
                {[
                  { icon: Sparkles, text: "Oracle AI Strategist", sub: "Your 24/7 Personal Financial Advisor" },
                  { icon: Shield, text: "TaxOS Optimization", sub: "Advanced harvesting & 80C/80D planning" },
                  { icon: Calendar, text: "Smart Calendar & Cards", sub: "Recurring bills & credit utilization tracking" },
                  { icon: MessageCircle, text: "WhatsApp AI Bot", sub: "Just chat to log expenses instantly" },
                  { icon: Cloud, text: "Secure Cloud Sync", sub: "Access on Web, Mobile & Tablet" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="rounded-full bg-cyan-500/20 p-1.5 text-cyan-400 mt-0.5">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{item.text}</div>
                      <div className="text-xs text-zinc-500">{item.sub}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <button className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Become a Citizen</span>
              </button>
            </div>
          </motion.div>

          {/* Sovereign Tier (Lifetime) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-purple-500/30 bg-zinc-900/40 p-8 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-xl shadow-purple-900/10"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-400 flex items-center gap-2">
                Sovereign <Crown className="h-4 w-4" />
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{format(4999)}</span>
                <span className="text-zinc-500">/lifetime</span>
              </div>
              <p className="text-zinc-400 mt-4 text-sm leading-relaxed">
                The ultimate commitment to your financial independence. Pay once, own forever.
              </p>
            </div>

            <div className="h-px w-full bg-white/5 mb-6" />
            
            <ul className="space-y-4 mb-8">
              {[
                { icon: Check, text: "Everything in Citizen Plan" },
                { icon: Crown, text: "Lifetime Access" },
                { icon: Zap, text: "Priority Support" },
                { icon: Lock, text: "Early Access Features" },
                { icon: Shield, text: "Founder's Community Access" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="rounded-full bg-purple-500/20 p-1.5 text-purple-400">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>

            <button className="w-full rounded-xl border border-purple-500/30 bg-purple-500/10 py-3.5 text-sm font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors">
              Get Lifetime Access
            </button>
          </motion.div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Compare Plans</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/30">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/50">
                  <th className="p-4 font-medium text-zinc-400">Feature</th>
                  <th className="p-4 font-medium text-white">Legacy (Free)</th>
                  <th className="p-4 font-medium text-cyan-400">Citizen (Paid)</th>
                  <th className="p-4 font-medium text-purple-400">Sovereign (Lifetime)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Manual Expense Tracking", legacy: true, citizen: true, sovereign: true },
                  { name: "Unlimited Accounts", legacy: true, citizen: true, sovereign: true },
                  { name: "Net Worth History", legacy: true, citizen: true, sovereign: true },
                  { name: "Local Data Backup", legacy: true, citizen: true, sovereign: true },
                  { name: "Ad-free Experience", legacy: true, citizen: true, sovereign: true },
                  { name: "Oracle AI Strategist", legacy: false, citizen: true, sovereign: true },
                  { name: "TaxOS Advanced Planning", legacy: false, citizen: true, sovereign: true },
                  { name: "Smart Calendar (Recurring)", legacy: false, citizen: true, sovereign: true },
                  { name: "Credit Card Maximizer", legacy: false, citizen: true, sovereign: true },
                  { name: "WhatsApp/Telegram Bot", legacy: false, citizen: true, sovereign: true },
                  { name: "Cross-Device Sync", legacy: false, citizen: true, sovereign: true },
                  { name: "Document Vault (Encrypted)", legacy: false, citizen: true, sovereign: true },
                  { name: "Priority Support", legacy: false, citizen: false, sovereign: true },
                  { name: "Early Access Beta", legacy: false, citizen: false, sovereign: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 text-zinc-300">{row.name}</td>
                    <td className="p-4">
                      {row.legacy ? <Check className="h-4 w-4 text-zinc-500" /> : <span className="text-zinc-700">-</span>}
                    </td>
                    <td className="p-4">
                      {row.citizen ? <Check className="h-4 w-4 text-cyan-400" /> : <span className="text-zinc-700">-</span>}
                    </td>
                    <td className="p-4">
                      {row.sovereign ? <Check className="h-4 w-4 text-purple-400" /> : <span className="text-zinc-700">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

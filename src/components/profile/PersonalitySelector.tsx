"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { RiskProfile } from "@/domain/models";
import { Shield, Zap, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";

const ARCHETYPES: {
  id: RiskProfile;
  label: string;
  icon: any;
  description: string;
  color: string;
  gradient: string;
}[] = [
  {
    id: "conservative",
    label: "The Guardian",
    icon: Shield,
    description: "Prioritizes safety and steady growth. Avoids volatility.",
    color: "bg-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/5",
  },
  {
    id: "balanced",
    label: "The Strategist",
    icon: Zap,
    description: "Balances growth with stability. Smart, calculated moves.",
    color: "bg-emerald-500",
    gradient: "from-emerald-500/20 to-teal-500/5",
  },
  {
    id: "optimizer",
    label: "The Optimizer",
    icon: Zap, // Using Zap for now, could be Brain or similar
    description: "Maximizes every dollar. Efficiency is the key metric.",
    color: "bg-violet-500",
    gradient: "from-violet-500/20 to-fuchsia-500/5",
  },
  {
    id: "aggressive",
    label: "The Pioneer",
    icon: TrendingUp,
    description: "Seeks high returns. Willing to ride the waves of volatility.",
    color: "bg-red-500",
    gradient: "from-red-500/20 to-orange-500/5",
  },
];

export function PersonalitySelector() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const handleSelect = (risk: RiskProfile) => {
    if (!profile) return;
    updateProfile({ riskProfile: risk });
    toast.success(`Identity updated: ${ARCHETYPES.find(a => a.id === risk)?.label}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-white">Financial DNA</h3>
        <div className="group relative">
          <Info className="h-4 w-4 text-zinc-500 hover:text-white cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Your risk profile shapes your automated suggestions.
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ARCHETYPES.map((type) => {
          const isSelected = profile?.riskProfile === type.id || (!profile?.riskProfile && type.id === "balanced");
          const Icon = type.icon;

          return (
            <motion.div
              key={type.id}
              onClick={() => handleSelect(type.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                isSelected
                  ? `border-${type.color.split("-")[1]}-500/50 bg-gradient-to-br ${type.gradient} shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                  : "border-white/5 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${isSelected ? type.color : "bg-zinc-800"} text-white transition-colors`}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="space-y-1">
                <div className={`font-medium ${isSelected ? "text-white" : "text-zinc-300"}`}>
                  {type.label}
                </div>
                <div className="text-xs text-zinc-500 leading-relaxed">
                  {type.description}
                </div>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="active-ring"
                  className={`absolute inset-0 rounded-2xl border-2 border-${type.color.split("-")[1]}-500 opacity-50`}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

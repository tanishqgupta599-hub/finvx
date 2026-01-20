"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { RefreshCw } from "lucide-react";

export function CurrencyOrb() {
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="group relative flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md transition-all hover:border-cyan-500/30">
      <div className="relative flex h-8 w-8 items-center justify-center">
         {/* Orb Animation */}
         <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30"
         />
         <div className="font-bold text-cyan-400">{profile?.currency || "INR"}</div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] text-zinc-400">Base Currency</span>
      </div>
    </div>
  );
}

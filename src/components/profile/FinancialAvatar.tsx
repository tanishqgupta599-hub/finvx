"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { Zap, Shield, TrendingUp, Activity } from "lucide-react";

export function FinancialAvatar() {
  const profile = useAppStore((s) => s.profile);
  const risk = profile?.riskProfile || "balanced";

  // Determine colors based on risk profile
  const getColors = () => {
    switch (risk) {
      case "conservative":
        return "from-blue-400 via-cyan-500 to-teal-500";
      case "aggressive":
        return "from-red-500 via-orange-500 to-yellow-500";
      case "optimizer":
        return "from-violet-500 via-fuchsia-500 to-purple-500";
      default: // balanced
        return "from-emerald-400 via-cyan-500 to-blue-500";
    }
  };

  const colors = getColors();

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors} blur-3xl`}
      />

      {/* Core Avatar (Abstract Sigil) */}
      <div className="relative z-10 h-48 w-48">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <defs>
            <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" className="text-white/80" />
              <stop offset="100%" stopColor="currentColor" className="text-white/20" />
            </linearGradient>
          </defs>
          
          {/* Animated Rings */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke="url(#avatarGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, rotate: 0 }}
            animate={{ pathLength: 1, rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="opacity-50"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="60"
            stroke="url(#avatarGradient)"
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0, rotate: 180 }}
            animate={{ pathLength: 1, rotate: -180 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="opacity-70"
          />
          
          {/* Central Core Shape based on Archetype */}
          <motion.path
            d={risk === "aggressive" 
              ? "M100 20 L180 160 L20 160 Z" // Triangle for aggressive
              : risk === "conservative"
              ? "M40 40 L160 40 L160 160 L40 160 Z" // Square for conservative
              : "M100 20 C 180 20, 180 180, 100 180 C 20 180, 20 20, 100 20" // Circle/Organic for others
            }
            fill={`url(#avatarGradient)`}
            className="text-white/10"
            animate={{
              scale: [0.9, 1.1, 0.9],
              rotate: risk === "aggressive" ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </svg>

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {risk === "aggressive" && <TrendingUp className="h-16 w-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />}
          {risk === "conservative" && <Shield className="h-16 w-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />}
          {(risk === "balanced" || risk === "optimizer") && <Zap className="h-16 w-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />}
        </motion.div>
      </div>

      {/* Pulse Rings */}
      <div className="absolute inset-0 z-0">
         {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
              className={`absolute inset-0 rounded-full border border-white/20`}
            />
         ))}
      </div>
    </div>
  );
}

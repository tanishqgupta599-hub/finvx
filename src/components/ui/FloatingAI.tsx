"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export function FloatingAI() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
    >
      {/* Pulse Rings */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md"
      />
      
      {/* Main Orb Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-lg shadow-cyan-500/40 border border-white/20"
      >
        <motion.div
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="h-6 w-6 text-white" fill="white" />
        </motion.div>
      </motion.button>

      {/* "Thinking" indicators (optional, visible when active) */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-3 right-0 whitespace-nowrap rounded-xl bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-white border border-white/10 backdrop-blur-md"
        >
          Ask AI Advisor
        </motion.div>
      )}
    </motion.div>
  );
}

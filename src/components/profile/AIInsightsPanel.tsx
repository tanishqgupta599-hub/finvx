"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function AIInsightsPanel() {
  const insights = [
    {
      id: 1,
      text: "Your 'Optimizer' profile suggests shifting 15% more to equity for tax efficiency.",
      type: "strategy",
    },
    {
      id: 2,
      text: "Long-term goals are 85% funded. Consider a step-up SIP to close the gap.",
      type: "alert",
    },
    {
      id: 3,
      text: "Income predictability is high. You can safely increase automated savings.",
      type: "observation",
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-b from-fuchsia-500/5 to-purple-500/5 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-fuchsia-300">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">AI Observer</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="group relative rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
          >
            <p className="text-xs leading-relaxed text-zinc-300">
              {insight.text}
            </p>
            <button className="mt-2 flex items-center gap-1 text-[10px] font-medium text-fuchsia-400 opacity-0 transition-opacity group-hover:opacity-100">
              Why? <ArrowRight className="h-2.5 w-2.5" />
            </button>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center">
        <button className="text-[10px] text-zinc-500 hover:text-zinc-300">
          View all observations
        </button>
      </div>
    </div>
  );
}

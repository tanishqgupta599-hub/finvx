"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function HelpTooltip({ content, title, position = 'top', className }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`absolute z-50 w-64 rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-2xl ${
                position === 'top' ? 'bottom-full mb-2' :
                position === 'bottom' ? 'top-full mt-2' :
                position === 'left' ? 'right-full mr-2' :
                'left-full ml-2'
              }`}
            >
              {title && (
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{title}</h4>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-0.5 hover:bg-white/10"
                  >
                    <X className="h-3 w-3 text-zinc-400" />
                  </button>
                </div>
              )}
              <div className="text-xs text-zinc-400 leading-relaxed">
                {typeof content === 'string' ? <p>{content}</p> : content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

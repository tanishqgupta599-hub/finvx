"use client";

import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";
import { TopBar } from "./TopBar";
import { useAppStore } from "@/state/app-store";
import { useEffect } from "react";
import { FloatingAI } from "@/components/ui/FloatingAI";

export function AppShell({ children }: { children: React.ReactNode }) {
  const demoDataEnabled = useAppStore((s) => s.demoDataEnabled);
  const seedDemoData = useAppStore((s) => s.seedDemoData);

  useEffect(() => {
    if (demoDataEnabled) seedDemoData();
  }, [demoDataEnabled, seedDemoData]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#020410] text-zinc-100">
      <div className="relative z-10">
        <TopBar />
        
        <div className="mx-auto flex w-full max-w-7xl px-3 pb-24 pt-3 md:px-6 md:pb-10 md:pt-5">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-20 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4 px-2">
                Command Center
              </div>
              <Sidebar />
            </div>
          </aside>
          
          <main className="flex-1 md:pl-6 min-w-0">
            {children}
          </main>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 bg-black/40 px-4 py-3 text-center text-[10px] uppercase tracking-wider text-zinc-600 backdrop-blur-sm md:px-6">
          Finvx AI • Private Financial Intelligence
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-xl pb-safe">
          <BottomTabs />
        </div>

        {/* Floating AI Button */}
        <FloatingAI />
      </div>
    </div>
  );
}

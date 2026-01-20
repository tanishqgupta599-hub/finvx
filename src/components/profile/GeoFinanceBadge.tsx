"use client";

import { useAppStore } from "@/state/app-store";
import { Globe, Building2, Landmark, Flag } from "lucide-react";

export function GeoFinanceBadge() {
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-950 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Geo-Context</h3>
          </div>
          
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-lg">
                 🇮🇳
               </div>
               <div>
                 <div className="text-sm font-medium text-white">{profile?.country || "India"}</div>
                 <div className="text-xs text-zinc-500">Tax Residency</div>
               </div>
             </div>

             <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                 <Landmark className="h-4 w-4 text-zinc-400" />
               </div>
               <div>
                 <div className="text-sm font-medium text-zinc-300">FY 2025-26</div>
                 <div className="text-xs text-zinc-500">Compliance Mode: Active</div>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-2 text-right">
           <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-medium text-indigo-300">
             <Building2 className="h-3 w-3" />
             <span>Regulated</span>
           </div>
           <div className="block text-[10px] text-zinc-600 max-w-[120px]">
             Rules engine adapted for local capital gains & tax slabs.
           </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
    </div>
  );
}

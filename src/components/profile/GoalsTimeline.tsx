"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { Home, Plane, GraduationCap, Flame, Car, Briefcase } from "lucide-react";
import { Goal } from "@/domain/models";

const GOAL_ICONS: Record<string, any> = {
  home: Home,
  travel: Plane,
  education: GraduationCap,
  retirement: Flame,
  emergency: ShieldIcon, // Helper defined below
  other: Briefcase,
};

function ShieldIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function GoalsTimeline() {
  const goals = useAppStore((s) => s.goals);
  
  // Group goals by timeframe
  const now = new Date();
  const getYear = (dateStr?: string) => dateStr ? new Date(dateStr).getFullYear() : now.getFullYear() + 1;
  
  const shortTerm = goals.filter(g => getYear(g.dueDate) <= now.getFullYear() + 2);
  const midTerm = goals.filter(g => {
    const y = getYear(g.dueDate);
    return y > now.getFullYear() + 2 && y <= now.getFullYear() + 5;
  });
  const longTerm = goals.filter(g => getYear(g.dueDate) > now.getFullYear() + 5);

  const sections = [
    { label: "Short Term (0-2y)", data: shortTerm, color: "text-cyan-400", border: "border-cyan-500/30" },
    { label: "Mid Term (2-5y)", data: midTerm, color: "text-violet-400", border: "border-violet-500/30" },
    { label: "Long Term (5y+)", data: longTerm, color: "text-fuchsia-400", border: "border-fuchsia-500/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Future Roadmap</h3>
        <div className="text-xs text-zinc-500">Drag goals to adjust timeline (Simulated)</div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20" />

        <div className="grid grid-cols-3 gap-4">
          {sections.map((section, idx) => (
            <div key={idx} className="relative pt-4">
              <div className={`mb-4 text-xs font-medium uppercase tracking-wider ${section.color}`}>
                {section.label}
              </div>
              
              <div className="min-h-[120px] space-y-3 rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10">
                {section.data.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                    No active goals
                  </div>
                ) : (
                  section.data.map((goal) => {
                    const Icon = GOAL_ICONS[goal.type] || GOAL_ICONS.other;
                    const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                    
                    return (
                      <motion.div
                        key={goal.id}
                        whileHover={{ scale: 1.02, x: 2 }}
                        className={`group relative overflow-hidden rounded-lg border ${section.border} bg-slate-900/50 p-2.5`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-md bg-white/5 p-1.5 ${section.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-xs font-medium text-zinc-200">{goal.title}</div>
                            <div className="flex items-center justify-between text-[10px] text-zinc-500">
                              <span>{getYear(goal.dueDate)}</span>
                              <span>{progress}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full ${section.color.replace("text", "bg")}`}
                          />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

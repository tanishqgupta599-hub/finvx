"use client";

import { useAppStore } from "@/state/app-store";
import { Briefcase, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PROFESSIONS = [
  "Software Engineer",
  "Product Designer",
  "Data Scientist",
  "Doctor / Medical",
  "Lawyer",
  "Finance Professional",
  "Entrepreneur",
  "Freelancer",
  "Student",
  "Other"
];

const JOB_TYPES = [
  { id: "student", label: "Student" },
  { id: "salaried", label: "Salaried" },
  { id: "self-employed", label: "Self-Employed" },
  { id: "business", label: "Business Owner" },
  { id: "unemployed", label: "Unemployed" },
  { id: "retired", label: "Retired" }
];

export function ProfessionSelector() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const handleSelect = (prof: string) => {
    if (!profile) return;
    updateProfile({ profession: prof });
    toast.success(`Profession set to ${prof}`);
  };

  const handleEmploymentSelect = (type: any) => {
    if (!profile) return;
    updateProfile({ employment: type });
    toast.success(`Employment status updated`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Employment Status</h3>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((type) => {
            const isSelected = profile?.employment === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleEmploymentSelect(type.id)}
                className={`relative flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                  isSelected 
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]" 
                    : "border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                }`}
              >
                {isSelected && (
                  <motion.span 
                    layoutId="activeEmp"
                    className="absolute inset-0 rounded-xl border border-blue-500/50"
                  />
                )}
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Profession / Role</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {PROFESSIONS.map((prof) => {
            const isSelected = profile?.profession === prof;
            return (
              <button
                key={prof}
                onClick={() => handleSelect(prof)}
                className={`relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected 
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                    : "border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                }`}
              >
                {isSelected && (
                  <motion.span 
                    layoutId="activeProf"
                    className="absolute inset-0 rounded-full border border-cyan-500/50"
                  />
                )}
                {prof}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

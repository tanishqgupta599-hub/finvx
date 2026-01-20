"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function SafetyScoreCard() {
  const profile = useAppStore((s) => s.profile);
  const policies = useAppStore((s) => s.insurancePolicies);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-sky-500/15 border border-emerald-500/30">
        <CardContent>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="mt-2 h-8 w-16" />
          <Skeleton className="mt-2 h-2 w-full rounded-full" />
          <Skeleton className="mt-2 h-3 w-48" />
        </CardContent>
      </Card>
    );
  }

  let score = 40;
  if (policies.length) score += 20;
  if (profile?.insuranceHealth) score += 20;
  if (profile?.insuranceTerm) score += 10;
  if (profile?.emergencyContactName && profile.emergencyContactPhone) score += 10;
  if (score > 100) score = 100;

  return (
    <Card className="h-full bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-sky-500/15 border border-emerald-500/30">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Safety score
          </div>
          <div className="text-xs text-emerald-50/80">Calm, not judgmental</div>
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {score}/100
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-emerald-500/20">
          <div
            className="h-2 rounded-full bg-emerald-400"
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-emerald-50/90">
          This is a gentle nudge, not a grade. Small changes move it quickly.
        </div>
      </CardContent>
    </Card>
  );
}

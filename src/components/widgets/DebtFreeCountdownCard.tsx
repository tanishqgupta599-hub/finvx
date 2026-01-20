"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";

export function DebtFreeCountdownCard() {
  const loans = useAppStore((s) => s.loans);
  const demoEnabled = useAppStore((s) => s.demoDataEnabled);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-500/30">
        <CardContent>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!loans.length && !demoEnabled) {
    return (
      <Card className="h-full bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-500/30">
        <CardContent>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!loans.length) {
    return (
      <Card className="h-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/30">
        <CardContent>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Debt free countdown
          </div>
          <div className="mt-2 text-sm text-emerald-50">No active loans right now.</div>
        </CardContent>
      </Card>
    );
  }

  const totalMonths = loans.reduce((months, loan) => {
    if (!loan.monthlyPayment || loan.monthlyPayment <= 0) return months;
    const m = Math.ceil(loan.balance / loan.monthlyPayment);
    return Math.max(months, m);
  }, 0);

  return (
    <Card className="h-full bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-500/30">
      <CardContent>
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-200">
          Debt free countdown
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {totalMonths ? `${totalMonths} months` : "In progress"}
        </div>
        <div className="mt-2 text-xs text-amber-50/90">
          Assuming you keep current EMIs steady and avoid new debt.
        </div>
      </CardContent>
    </Card>
  );
}

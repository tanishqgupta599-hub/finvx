"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { useCurrencyFormat } from "@/lib/currency";

export function NetWorthSummaryCard() {
  const assets = useAppStore((s) => s.assets);
  const loans = useAppStore((s) => s.loans);
  const liabilities = useAppStore((s) => s.liabilities);
  const creditCards = useAppStore((s) => s.creditCards);
  const demoEnabled = useAppStore((s) => s.demoDataEnabled);
  const [mounted, setMounted] = useState(false);
  const { format } = useCurrencyFormat();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-emerald-500/15 border border-cyan-500/30">
        <CardContent>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-3 h-8 w-32" />
          <Skeleton className="mt-3 h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!assets.length && !loans.length && !demoEnabled) {
    return (
      <Card className="h-full">
        <CardContent>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-3 h-8 w-32" />
          <Skeleton className="mt-3 h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalAssets = assets.reduce((a, b) => a + b.value, 0);
  const totalDebt = loans.reduce((a, b) => a + b.balance, 0);
  const totalLiabilities = liabilities.reduce((a, b) => a + b.balance, 0);
  // Calculate total credit card debt to include in net worth
  const totalCreditCardDebt = creditCards.reduce((a, b) => a + b.balance, 0);
  const netWorth = totalAssets - (totalDebt + totalLiabilities + totalCreditCardDebt);

  return (
    <Card className="h-full bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-emerald-500/15 border border-cyan-500/30">
      <CardContent>
        <div className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Net worth snapshot
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {format(netWorth)}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-cyan-100/80">
          <span>Assets {format(totalAssets)}</span>
          <span>Debt {format(totalDebt + totalLiabilities + totalCreditCardDebt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

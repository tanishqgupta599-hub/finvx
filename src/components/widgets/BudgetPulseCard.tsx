"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { EXPENSE_CATEGORIES } from "@/domain/models";

export function BudgetPulseCard() {
  const transactions = useAppStore((s) => s.transactions);
  const demoEnabled = useAppStore((s) => s.demoDataEnabled);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/15 border border-violet-500/30">
        <CardContent>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  // Filter for expense transactions (negative amount) in current month
  const now = new Date();
  const currentMonthExpenses = transactions
    .filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        t.amount < 0
      );
    })
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  if (!transactions.length && !demoEnabled) {
    return (
      <Card className="h-full bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/15 border border-violet-500/30">
        <CardContent>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  // Calculate daily average
  const dayOfMonth = now.getDate();
  const dailyAverage = dayOfMonth > 0 ? currentMonthExpenses / dayOfMonth : 0;
  const projected = dailyAverage * 30; // Approx

  // Calculate top category
  const categoryTotals = new Map<string, number>();
  transactions.forEach((t) => {
    if (!t.date) return;
    const d = new Date(t.date);
    if (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      t.amount < 0
    ) {
      const cat = t.category || "other";
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + Math.abs(t.amount));
    }
  });

  let topCategory = "";
  let topAmount = 0;
  categoryTotals.forEach((amount, cat) => {
    if (amount > topAmount) {
      topAmount = amount;
      topCategory = cat;
    }
  });
  
  const topCategoryLabel = EXPENSE_CATEGORIES.find(c => c.value === topCategory)?.label || topCategory;

  return (
    <Card className="h-full bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/15 border border-violet-500/30">
      <CardContent>
        <div className="text-xs font-semibold uppercase tracking-wide text-violet-200">
          Monthly Burn Rate
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
          ₹{currentMonthExpenses.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
        <div className="mt-2 text-xs text-violet-100/80">
          ~₹{dailyAverage.toFixed(0)}/day • Proj: ₹{projected.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
        {topAmount > 0 && (
           <div className="mt-1 text-xs text-violet-200/60">
             Top: {topCategoryLabel} (₹{topAmount.toLocaleString("en-IN")})
           </div>
        )}
      </CardContent>
    </Card>
  );
}

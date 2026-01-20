"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/state/app-store";
import { useState, useEffect } from "react";
import { EXPENSE_CATEGORIES } from "@/domain/models";
import { Skeleton } from "@/components/ui/Skeleton";

export function BestCardForSpend() {
  const cards = useAppStore((s) => s.creditCards);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15 border border-blue-500/30">
        <CardContent>
          <Skeleton className="h-4 w-32" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="mt-3 h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  let recommendation = "Add a card to see suggestions.";
  if (cards.length) {
    const best = cards.reduce((bestCard, card) => {
      if (!bestCard) return card;
      const bestUtil = bestCard.balance / bestCard.limit;
      const util = card.balance / card.limit;
      return util < bestUtil ? card : bestCard;
    }, cards[0]);
    const catLabel = EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category;
    recommendation = `Use •••• ${best.last4} for this ${catLabel.toLowerCase()} spend.`;
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15 border border-blue-500/30">
      <CardContent>
        <div className="text-xs font-semibold uppercase tracking-wide text-blue-200">Best card for spend</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            inputMode="decimal"
            className="border-blue-500/30 bg-black/20 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20"
          />
          <Select 
            value={category} 
            onChange={(v) => setCategory(v as any)}
            className="border-blue-500/30 bg-black/20 text-white focus:border-blue-400 focus:ring-blue-400/20"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-zinc-900 text-white">
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 text-xs text-blue-100/80">
          {amount ? recommendation : "Enter an amount to see a gentle suggestion."}
        </div>
      </CardContent>
    </Card>
  );
}


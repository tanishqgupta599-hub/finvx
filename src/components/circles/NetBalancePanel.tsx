
import { ExpenseCircle } from "@/domain/circles";
import { useMemo, useState } from "react";
import { Bell, Check } from "lucide-react";

interface NetBalancePanelProps {
  circle: ExpenseCircle;
  currentUserId: string;
}

export function NetBalancePanel({ circle, currentUserId }: NetBalancePanelProps) {
  const [sentReminders, setSentReminders] = useState<string[]>([]);

  const handleRemind = (memberId: string) => {
    // Simulate sending a gentle reminder
    setSentReminders((prev) => [...prev, memberId]);
  };

  const settlements = useMemo(() => {
    // 1. Calculate Net Balance for everyone
    const balances: Record<string, number> = {};
    circle.members.forEach((m) => (balances[m.id] = 0));

    circle.expenses.forEach((exp) => {
      balances[exp.paidBy] += exp.amount; // They paid, so they are owed this amount (initially)
      exp.splits.forEach((split) => {
        balances[split.memberId] -= split.amount; // They consumed, so they owe this amount
      });
    });

    // 2. Separate into Debtors and Creditors
    let debtors = [];
    let creditors = [];

    for (const [memberId, amount] of Object.entries(balances)) {
      if (amount < -0.01) debtors.push({ memberId, amount }); // Negative amount = Owe
      if (amount > 0.01) creditors.push({ memberId, amount }); // Positive amount = Owed
    }

    // Sort by magnitude to minimize transactions (simple heuristic)
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    // 3. Match them
    const result = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // The amount to settle is min(abs(debt), credit)
      const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

      result.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount,
      });

      // Update balances
      debtor.amount += amount;
      creditor.amount -= amount;

      // If settled, move to next
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return result;
  }, [circle]);

  const getMemberName = (id: string) => {
    if (id === currentUserId) return "You";
    return circle.members.find((m) => m.id === id)?.name || "Unknown";
  };

  if (settlements.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="font-medium text-white">All settled up!</h3>
        <p className="text-sm text-zinc-500">No pending balances in this circle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h3 className="font-semibold text-zinc-300">Net Balances</h3>
      <div className="space-y-3">
        {settlements.map((s, idx) => {
          const isMeFrom = s.from === currentUserId;
          const isMeTo = s.to === currentUserId;
          
          // Privacy check: In a real app, maybe only show what involves ME?
          // Requirement: "Show net balance per user, not itemized clutter"
          // Requirement: "Net balances" are shared in circle.
          // So showing all is fine for the circle context.

          return (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isMeFrom ? "bg-orange-400" : "bg-zinc-600"}`} />
                <span className={isMeFrom ? "font-medium text-white" : "text-zinc-400"}>
                  {getMemberName(s.from)}
                </span>
                <span className="text-zinc-600">owes</span>
                <span className={isMeTo ? "font-medium text-white" : "text-zinc-400"}>
                  {getMemberName(s.to)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-medium text-white">
                  ₹{Math.round(s.amount).toLocaleString("en-IN")}
                </span>
                {isMeTo && (
                  <button
                    onClick={() => handleRemind(s.from)}
                    disabled={sentReminders.includes(s.from)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    title="Send gentle reminder"
                  >
                    {sentReminders.includes(s.from) ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Bell className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary for current user */}
      <div className="mt-4 border-t border-zinc-800 pt-3">
        {(() => {
           const myReceivables = settlements.filter(s => s.to === currentUserId).reduce((acc, s) => acc + s.amount, 0);
           const myPayables = settlements.filter(s => s.from === currentUserId).reduce((acc, s) => acc + s.amount, 0);
           
           if (myReceivables > 0) return <div className="text-emerald-400 text-sm font-medium">You will receive ₹{Math.round(myReceivables).toLocaleString("en-IN")} in total</div>
           if (myPayables > 0) return <div className="text-orange-400 text-sm font-medium">You need to pay ₹{Math.round(myPayables).toLocaleString("en-IN")} in total</div>
           return <div className="text-zinc-500 text-sm">You are all settled.</div>
        })()}
      </div>
    </div>
  );
}

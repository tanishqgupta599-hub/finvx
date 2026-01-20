
import { ExpenseCircle } from "@/domain/circles";
import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";

interface CircleCardProps {
  circle: ExpenseCircle;
  currentUserId: string;
}

export function CircleCard({ circle, currentUserId }: CircleCardProps) {
  const balance = useMemo(() => {
    let paid = 0;
    let share = 0;

    circle.expenses.forEach((exp) => {
      if (exp.paidBy === currentUserId) {
        paid += exp.amount;
      }
      const mySplit = exp.splits.find((s) => s.memberId === currentUserId);
      if (mySplit) {
        share += mySplit.amount;
      }
    });

    return paid - share;
  }, [circle, currentUserId]);

  const balanceText =
    balance > 0
      ? `You get back ₹${balance.toLocaleString("en-IN")}`
      : balance < 0
      ? `You owe ₹${Math.abs(balance).toLocaleString("en-IN")}`
      : "Settled up";

  const balanceColor =
    balance > 0
      ? "text-emerald-400"
      : balance < 0
      ? "text-orange-400" // Soft orange instead of red
      : "text-zinc-400";

  return (
    <Link href={`/circles/${circle.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-cyan-500/30 hover:bg-zinc-900/80">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
              {circle.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {circle.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <Users className="h-3 w-3" />
                <span>{circle.members.length} members</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-cyan-500" />
        </div>

        <div className="mt-4 border-t border-zinc-800 pt-3">
          <p className={`text-sm font-medium ${balanceColor}`}>{balanceText}</p>
        </div>
      </div>
    </Link>
  );
}

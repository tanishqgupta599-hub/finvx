
"use client";

import { useAppStore } from "@/state/app-store";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Receipt } from "lucide-react";
import Link from "next/link";
import { NetBalancePanel } from "@/components/circles/NetBalancePanel";
import { AddExpenseModal } from "@/components/circles/AddExpenseModal";
import { Button } from "@/components/ui/Button";

export default function CircleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const circle = useAppStore((s) => s.circles.find((c) => c.id === id));
  const currentUserId = "finos_x7A9KQ"; // Mock current user

  if (!circle) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-white">Circle Not Found</h2>
        <p className="text-zinc-400">The circle you are looking for does not exist or you don't have access.</p>
        <Link href="/circles">
          <Button variant="secondary">Go Back</Button>
        </Link>
      </div>
    );
  }

  // Sort expenses by date desc
  const sortedExpenses = [...circle.expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/circles" className="rounded-full bg-zinc-900 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
              {circle.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{circle.name}</h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <User className="h-3 w-3" />
                <span>{circle.members.length} members</span>
                <span>•</span>
                <span className="font-mono">{circle.id}</span>
              </div>
            </div>
          </div>
        </div>
        <AddExpenseModal circle={circle} currentUserId={currentUserId} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Net Balance & Summary */}
        <div className="space-y-6 lg:col-span-1">
          <NetBalancePanel circle={circle} currentUserId={currentUserId} />
          
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h3 className="mb-3 font-semibold text-zinc-300">Circle Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Created</span>
                <span>{new Date(circle.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Total Expenses</span>
                <span>{circle.expenses.length}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Currency</span>
                <span>{circle.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Expenses Feed */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-white">Activity</h2>
          <div className="space-y-3">
            {sortedExpenses.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
                <Receipt className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
                <p className="text-zinc-400">No expenses yet.</p>
                <p className="text-xs text-zinc-600">Add an expense to start tracking.</p>
              </div>
            ) : (
              sortedExpenses.map((expense) => {
                const paidByMe = expense.paidBy === currentUserId;
                const paidByMember = circle.members.find(m => m.id === expense.paidBy);
                
                return (
                  <div key={expense.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-900">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-zinc-800 text-xs font-medium text-zinc-400">
                        <span>{new Date(expense.date).getDate()}</span>
                        <span className="text-[10px] uppercase">{new Date(expense.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{expense.description}</p>
                        <p className="text-xs text-zinc-500">
                          {paidByMe ? "You" : paidByMember?.name} paid ₹{expense.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       {/* Show my share logic */}
                       {(() => {
                         const mySplit = expense.splits.find(s => s.memberId === currentUserId);
                         if (paidByMe) {
                            // I paid, show how much I lent
                            const lent = expense.amount - (mySplit?.amount || 0);
                            return (
                              <div className="text-xs font-medium text-emerald-400">
                                you lent ₹{lent.toLocaleString("en-IN")}
                              </div>
                            );
                         } else {
                            // Someone else paid, show my share (debt)
                            return (
                              <div className="text-xs font-medium text-orange-400">
                                you owe ₹{mySplit?.amount.toLocaleString("en-IN") || 0}
                              </div>
                            );
                         }
                       })()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

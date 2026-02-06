"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { useCurrencyFormat } from "@/lib/currency";
import { format as formatDate } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, History, Receipt } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function RecentActivityCard() {
  const transactions = useAppStore((s) => s.transactions);
  const { format } = useCurrencyFormat();

  // Get last 5 transactions
  const recentTxns = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card className="bg-zinc-900/30 border-white/10 h-full">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" /> Recent Activity
          </div>
          <Link href="/expenses" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            View All
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {recentTxns.length > 0 ? (
          <div className="space-y-4">
            {recentTxns.map((txn, i) => (
              <motion.div 
                key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    txn.amount > 0 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors"
                  }`}>
                    {txn.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">{txn.description}</span>
                    <span className="text-[10px] text-zinc-500">
                      {formatDate(new Date(txn.date), "MMM d")} • {txn.category}
                    </span>
                  </div>
                </div>
                <div className={`text-sm font-semibold whitespace-nowrap ${
                  txn.amount > 0 ? "text-emerald-400" : "text-white"
                }`}>
                  {txn.amount > 0 ? "+" : ""}{format(txn.amount)}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-10 w-10 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
              <Receipt className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400">No recent transactions</p>
            <p className="text-xs text-zinc-600 mt-1">Start by adding your expenses</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

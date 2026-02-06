"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAppStore } from "@/state/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCurrencyFormat } from "@/lib/currency";
import { formatCompact } from "@/lib/countries";

export function SpendingTrendChart() {
  const transactions = useAppStore((s) => s.transactions);
  const { format, countryCode } = useCurrencyFormat();

  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData = new Map<string, { income: number; spending: number; month: string }>();
    
    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, spending: 0, month: monthLabel });
      }
      
      const data = monthlyData.get(monthKey)!;
      if (txn.amount > 0) {
        data.income += txn.amount;
      } else {
        data.spending += Math.abs(txn.amount);
      }
    });

    // Convert to array and sort by date
    return Array.from(monthlyData.values())
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Last 6 months
  }, [transactions]);

  const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);
  const totalSpending = chartData.reduce((sum, d) => sum + d.spending, 0);
  const netFlow = totalIncome - totalSpending;
  const trend = chartData.length >= 2 
    ? chartData[chartData.length - 1].spending - chartData[chartData.length - 2].spending
    : 0;

  if (chartData.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-zinc-500">
            Add transactions to see spending trends
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-400">Spending Trends</CardTitle>
          <div className="flex items-center gap-2 text-xs">
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-rose-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            )}
            <span className={trend >= 0 ? "text-rose-400" : "text-emerald-400"}>
              {trend >= 0 ? "+" : ""}{format(Math.abs(trend))}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="month" 
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
            />
                <YAxis 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={(value) => formatCompact(value, countryCode)}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    borderRadius: 8,
                    color: "#fff"
                  }}
                  formatter={(value: any) => format(Number(value))}
                />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: "#22c55e", r: 3 }}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="spending" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 3 }}
              name="Spending"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-zinc-500">Total Income</div>
            <div className="text-sm font-semibold text-emerald-400">{format(totalIncome)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Total Spending</div>
            <div className="text-sm font-semibold text-rose-400">{format(totalSpending)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Net Flow</div>
            <div className={`text-sm font-semibold ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netFlow >= 0 ? '+' : ''}{format(netFlow)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAppStore } from "@/state/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EXPENSE_CATEGORIES } from "@/domain/models";
import { useCurrencyFormat } from "@/lib/currency";

const COLORS = [
  '#22c55e', // emerald
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f59e0b', // amber
  '#ef4444', // rose
  '#06b6d4', // cyan
  '#f97316', // orange
  '#8b5cf6', // violet
];

export function CategoryPieChart() {
  const transactions = useAppStore((s) => s.transactions);
  const { format } = useCurrencyFormat();

  const chartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    transactions
      .filter(t => t.amount < 0) // Only expenses
      .forEach(txn => {
        const category = txn.category;
        const amount = Math.abs(txn.amount);
        categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
      });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        name: EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category,
        value: amount,
        category
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [transactions]);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-zinc-500">
            Add expenses to see category breakdown
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(2, 6, 23, 0.95)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
                borderRadius: 8,
                color: "#fff"
              }}
              formatter={(value: any) => format(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {chartData.map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-zinc-400">{item.name}</span>
              <span className="ml-auto font-medium text-white">
                {format(item.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <div className="text-xs text-zinc-500">Total Spending</div>
          <div className="text-lg font-semibold text-white">{format(total)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

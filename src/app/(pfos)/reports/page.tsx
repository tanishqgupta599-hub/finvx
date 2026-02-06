"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/state/app-store";
import { ExportButton } from "@/components/widgets/ExportButton";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Download, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrencyFormat } from "@/lib/currency";
import { formatCompact } from "@/lib/countries";

export default function ReportsPage() {
  const transactions = useAppStore((s) => s.transactions);
  const assets = useAppStore((s) => s.assets);
  const loans = useAppStore((s) => s.loans);
  const creditCards = useAppStore((s) => s.creditCards);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const goals = useAppStore((s) => s.goals);
  const profile = useAppStore((s) => s.profile);
  const { format, symbol, countryCode } = useCurrencyFormat();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');

  // Calculate net worth over time
  const netWorthData = useMemo(() => {
    const now = new Date();
    const months: { month: string; assets: number; debt: number; netWorth: number }[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // For demo, we'll use current values (in real app, would track historical)
      const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
      const totalDebt = loans.reduce((sum, l) => sum + l.balance, 0) + 
                       creditCards.reduce((sum, c) => sum + c.balance, 0);
      
      months.push({
        month: monthLabel,
        assets: totalAssets,
        debt: totalDebt,
        netWorth: totalAssets - totalDebt
      });
    }
    
    return months;
  }, [assets, loans, creditCards]);

  // Income vs Expenses
  const incomeExpenseData = useMemo(() => {
    const monthly = new Map<string, { income: number; expenses: number; label: string }>();
    
    transactions.forEach(txn => {
      const date = new Date(txn.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthly.has(key)) {
        monthly.set(key, { income: 0, expenses: 0, label });
      }
      
      const data = monthly.get(key)!;
      if (txn.amount > 0) {
        data.income += txn.amount;
      } else {
        data.expenses += Math.abs(txn.amount);
      }
    });

    return Array.from(monthly.values())
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(-6);
  }, [transactions]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    transactions
      .filter(t => t.amount < 0)
      .forEach(txn => {
        const category = txn.category;
        categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(txn.amount));
      });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [transactions]);

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalDebt = loans.reduce((sum, l) => sum + l.balance, 0) + 
                   creditCards.reduce((sum, c) => sum + c.balance, 0);
  const netWorth = totalAssets - totalDebt;
  
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const savings = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          <p className="text-zinc-400">Comprehensive insights into your financial health</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onChange={(v) => setTimeRange(v as any)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </Select>
          <ExportButton type="full-report" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-200/80 mb-1">Net Worth</div>
                  <div className="text-2xl font-bold text-white">
                    {format(netWorth)}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-200/80 mb-1">Total Assets</div>
                  <div className="text-2xl font-bold text-white">
                    {format(totalAssets)}
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-rose-500/20 to-orange-500/10 border-rose-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-rose-200/80 mb-1">Total Debt</div>
                  <div className="text-2xl font-bold text-white">
                    {format(totalDebt)}
                  </div>
                </div>
                <TrendingDown className="h-8 w-8 text-rose-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-purple-200/80 mb-1">Savings Rate</div>
                  <div className="text-2xl font-bold text-white">
                    {totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(0) : 0}%
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Trend */}
        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Net Worth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={netWorthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={(value) => formatCompact(value, countryCode)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    borderRadius: 8
                  }}
                  formatter={(value: any) => format(Number(value))}
                />
                <Area 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="assets" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income vs Expenses */}
        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="label" 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={(value) => formatCompact(value, countryCode)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    borderRadius: 8
                  }}
                  formatter={(value: any) => format(Number(value))}
                />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-zinc-900/50 border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number"
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="category"
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    borderRadius: 8
                  }}
                  formatter={(value: any) => format(Number(value))}
                />
                <Bar dataKey="amount" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Income Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Total Income</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {format(totalIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Transactions</span>
                <span className="text-sm text-white">
                  {transactions.filter(t => t.amount > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Average per Transaction</span>
                <span className="text-sm text-white">
                  {transactions.filter(t => t.amount > 0).length > 0
                    ? format(totalIncome / transactions.filter(t => t.amount > 0).length)
                    : format(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Total Expenses</span>
                <span className="text-sm font-semibold text-rose-400">
                  {format(totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Transactions</span>
                <span className="text-sm text-white">
                  {transactions.filter(t => t.amount < 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Average per Transaction</span>
                <span className="text-sm text-white">
                  {transactions.filter(t => t.amount < 0).length > 0
                    ? format(totalExpenses / transactions.filter(t => t.amount < 0).length)
                    : format(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Savings Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Net Savings</span>
                <span className={`text-sm font-semibold ${savings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {format(savings)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Savings Rate</span>
                <span className="text-sm text-white">
                  {totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Monthly Average</span>
                <span className="text-sm text-white">
                  {format(savings / 12)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

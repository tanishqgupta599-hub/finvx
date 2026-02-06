"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, DollarSign, Plus, Building, Briefcase } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Asset } from "@/domain/models";
import { ExportButton } from "@/components/widgets/ExportButton";
import { EnhancedEmptyState } from "@/components/ui/EnhancedEmptyState";
import { useCurrencyFormat } from "@/lib/currency";

export default function InvestmentsPage() {
  const { assets, addAsset } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ type: "investment" });
  const { format } = useCurrencyFormat();

  const investments = assets.filter(a => a.type === "investment" || a.type === "property");
  const totalValue = investments.reduce((acc, curr) => acc + curr.value, 0);

  // Mock data for charts since we don't have granular categories in Asset yet
  // We'll try to guess based on name or just group by type
  const allocationData = [
    { name: "Equity", value: investments.filter(i => i.name.toLowerCase().includes("stock") || i.name.toLowerCase().includes("fund") || i.name.toLowerCase().includes("equity")).reduce((a, c) => a + c.value, 0) || 0 },
    { name: "Real Estate", value: investments.filter(i => i.type === "property").reduce((a, c) => a + c.value, 0) || 0 },
    { name: "Debt/Bonds", value: investments.filter(i => i.name.toLowerCase().includes("bond") || i.name.toLowerCase().includes("fd") || i.name.toLowerCase().includes("debt")).reduce((a, c) => a + c.value, 0) || 0 },
    { name: "Crypto", value: investments.filter(i => i.name.toLowerCase().includes("bitcoin") || i.name.toLowerCase().includes("crypto") || i.name.toLowerCase().includes("eth")).reduce((a, c) => a + c.value, 0) || 0 },
    { name: "Other", value: 0 } // calculated below
  ];

  // Fix "Other" calculation
  const categorizedValue = allocationData.reduce((acc, curr) => acc + curr.value, 0);
  allocationData[4].value = Math.max(0, totalValue - categorizedValue);

  // Filter out zero values for chart
  const chartData = allocationData.filter(d => d.value > 0);
  const COLORS = ["#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#64748b"];

  const handleAdd = () => {
    if (!newAsset.name || !newAsset.value) return;
    addAsset({
      id: crypto.randomUUID(),
      name: newAsset.name,
      value: Number(newAsset.value),
      type: newAsset.type as any,
      institution: newAsset.institution,
    });
    setIsAddOpen(false);
    setNewAsset({ type: "investment" });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Investment Portfolio</h1>
          <p className="text-zinc-400">Track your wealth creation journey.</p>
        </div>
        <div className="flex items-center gap-2">
          {investments.length > 0 && <ExportButton type="investments" />}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
                <Plus className="mr-2 h-4 w-4" /> Add Investment
              </Button>
            </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Investment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newAsset.name || ""}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. Nifty 50 Index Fund"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Current Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={newAsset.value || ""}
                  onChange={(e) => setNewAsset({ ...newAsset, value: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newAsset.type}
                  onChange={(v: any) => setNewAsset({ ...newAsset, type: v })}
                >
                  <option value="investment">Investment</option>
                  <option value="property">Property</option>
                  <option value="cash">Cash/Bank</option>
                </Select>
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
              Save Investment
            </Button>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{format(totalValue)}</div>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +12.5% (mock)
            </p>
          </CardContent>
        </Card>
        {/* More cards can be added here */}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Allocation Chart */}
        <Card className="border-zinc-800 bg-zinc-900/30 h-[400px]">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [format(value), "Value"]}
                    />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center">
                  <EnhancedEmptyState
                    type="investments"
                    title="No investment data"
                    description="Add investments to see your portfolio allocation"
                    primaryAction={{
                      label: "Add Investment",
                      onClick: () => setIsAddOpen(true)
                    }}
                  />
                </div>
             )}
          </CardContent>
        </Card>

        {/* Holdings List */}
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-800">
                      {inv.type === "property" ? <Building className="h-5 w-5 text-zinc-400" /> : <Briefcase className="h-5 w-5 text-zinc-400" />}
                    </div>
                    <div>
                      <div className="font-medium text-white">{inv.name}</div>
                      <div className="text-xs text-zinc-400 capitalize">{inv.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{format(inv.value)}</div>
                  </div>
                </div>
              ))}
              {investments.length === 0 && (
                <EnhancedEmptyState
                  type="investments"
                  primaryAction={{
                    label: "Add Investment",
                    onClick: () => setIsAddOpen(true)
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

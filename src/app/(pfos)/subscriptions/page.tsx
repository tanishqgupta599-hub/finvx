"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Calendar, CreditCard, AlertTriangle, Plus, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { useCurrencyFormat } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Subscription } from "@/domain/models";

export default function SubscriptionsPage() {
  const { subscriptions, addSubscription, updateSubscription } = useAppStore();
  const { format } = useCurrencyFormat();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSub, setNewSub] = useState<Partial<Subscription>>({
    cadence: "monthly",
  });

  const monthlyBurn = subscriptions.reduce((acc, sub) => {
    if (sub.cadence === "monthly") return acc + sub.amount;
    if (sub.cadence === "yearly") return acc + sub.amount / 12;
    if (sub.cadence === "weekly") return acc + sub.amount * 4;
    return acc;
  }, 0);

  const yearlyBurn = monthlyBurn * 12;

  const sortedSubs = [...subscriptions].sort((a, b) => {
    return new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime();
  });

  const handleAdd = () => {
    if (!newSub.name || !newSub.amount) return;
    addSubscription({
      id: crypto.randomUUID(),
      name: newSub.name,
      amount: Number(newSub.amount),
      cadence: newSub.cadence as "monthly" | "yearly" | "weekly",
      nextChargeDate: newSub.nextChargeDate || new Date().toISOString(),
    });
    setIsAddOpen(false);
    setNewSub({ cadence: "monthly" });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
          <p className="text-zinc-400">Manage your recurring commitments and spot leaks.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
              <Plus className="mr-2 h-4 w-4" /> Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Subscription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newSub.name || ""}
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  placeholder="Netflix, Spotify, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newSub.amount || ""}
                  onChange={(e) => setNewSub({ ...newSub, amount: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cadence">Frequency</Label>
                <Select
                  value={newSub.cadence}
                  onChange={(v: any) => setNewSub({ ...newSub, cadence: v })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Next Billing Date</Label>
                <Input
                  id="date"
                  type="date"
                  onChange={(e) =>
                    setNewSub({ ...newSub, nextChargeDate: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
              Save Subscription
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Monthly Burn</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{format(monthlyBurn)}</div>
            <p className="text-xs text-zinc-500">projected monthly cost</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Yearly Projection</CardTitle>
            <Calendar className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{format(yearlyBurn)}</div>
            <p className="text-xs text-zinc-500">total annual commitment</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Subs</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{subscriptions.length}</div>
            <p className="text-xs text-zinc-500">services connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline / Calendar */}
        <Card className="border-zinc-800 bg-zinc-900/30 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-cyan-500" />
              Upcoming Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedSubs.slice(0, 5).map((sub) => {
                const date = new Date(sub.nextChargeDate);
                const isToday = new Date().toDateString() === date.toDateString();
                const daysLeft = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={sub.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded bg-zinc-800 text-xs font-bold">
                      <span className="text-zinc-500">{date.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-white">{date.getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{sub.name}</div>
                      <div className="text-xs text-zinc-400">
                        {isToday ? "Due today" : `In ${daysLeft} days`}
                      </div>
                    </div>
                    <div className="font-semibold text-white">{format(sub.amount)}</div>
                  </div>
                );
              })}
              {sortedSubs.length === 0 && (
                <div className="py-8 text-center text-sm text-zinc-500">No upcoming charges</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* List View */}
        <div className="space-y-4 lg:col-span-2">
          {subscriptions.length === 0 ? (
            <EmptyState
              title="No subscriptions"
              description="Add your recurring expenses to track them here."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {subscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80 p-5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{sub.name}</h3>
                      <p className="text-sm text-zinc-400 capitalize">{sub.cadence} plan</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{format(sub.amount)}</div>
                      <div className="text-xs text-zinc-500">per {sub.cadence.replace("ly", "")}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                     <div className="flex items-center gap-2 text-xs text-zinc-400">
                       <Calendar className="h-3 w-3" />
                       Next: {new Date(sub.nextChargeDate).toLocaleDateString()}
                     </div>
                     <Button variant="ghost" size="sm" className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                        Cancel
                     </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { EnhancedEmptyState } from "@/components/ui/EnhancedEmptyState";
import { useAppStore } from "@/state/app-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Transaction, EXPENSE_CATEGORIES } from "@/domain/models";
import { ExportButton } from "@/components/widgets/ExportButton";
import { RecurringTransactionManager } from "@/components/widgets/RecurringTransactionManager";
import { CategoryPieChart } from "@/components/widgets/CategoryPieChart";
import { useCurrencyFormat } from "@/lib/currency";
import { formatCompact } from "@/lib/countries";

type TxnFilter = "all" | "income" | "spending";
type TxnWindow = "all" | "30d" | "7d";

export default function Spending() {
  const subs = useAppStore((s) => s.subscriptions);
  const txns = useAppStore((s) => s.transactions);
  const assets = useAppStore((s) => s.assets);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const addSubscription = useAppStore((s) => s.addSubscription);
  const updateSubscription = useAppStore((s) => s.updateSubscription);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);
  const { format, symbol, countryCode } = useCurrencyFormat();

  const [txnFilter, setTxnFilter] = useState<TxnFilter>("all");
  const [txnWindow, setTxnWindow] = useState<TxnWindow>("30d");
  const [txnSheetOpen, setTxnSheetOpen] = useState(false);
  const [subscriptionSheetOpen, setSubscriptionSheetOpen] = useState(false);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<string | null>(null);
  const [txnForm, setTxnForm] = useState<{
    description: string;
    amount: string;
    category: Transaction["category"];
    date: string;
    account: string;
  }>({
    description: "",
    amount: "",
    category: "spending",
    date: new Date().toISOString().slice(0, 10),
    account: "",
  });
  const [subscriptionForm, setSubscriptionForm] = useState<{
    name: string;
    amount: string;
    cadence: "monthly" | "yearly" | "weekly";
    nextChargeDate: string;
  }>({
    name: "",
    amount: "",
    cadence: "monthly",
    nextChargeDate: new Date().toISOString().slice(0, 10),
  });
  const [allowance, setAllowance] = useState(15000);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const msInDay = 1000 * 60 * 60 * 24;
    const withinWindow = (dateStr: string) => {
      if (txnWindow === "all") return true;
      const d = new Date(dateStr);
      const diff = (now.getTime() - d.getTime()) / msInDay;
      if (txnWindow === "30d") return diff <= 30;
      return diff <= 7;
    };
    return txns.filter((t) => {
      if (!withinWindow(t.date)) return false;
      if (txnFilter === "income") return t.amount > 0;
      if (txnFilter === "spending") return t.amount < 0;
      return true;
    });
  }, [txns, txnFilter, txnWindow]);

  const monthlySpending = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const monthlyIncome = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      const key = t.category;
      map.set(key, (map.get(key) ?? 0) + Math.abs(t.amount));
    });
    return Array.from(map.entries())
      .map(([key, value]) => ({
        category: key,
        amount: value,
        label: EXPENSE_CATEGORIES.find(c => c.value === key)?.label || key
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [filteredTransactions]);

  const openNewTransaction = () => {
    setTxnForm({
      description: "",
      amount: "",
      category: "spending",
      date: new Date().toISOString().slice(0, 10),
      account: "",
    });
    setTxnSheetOpen(true);
  };

  const saveTransaction = () => {
    if (!txnForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    const rawAmount = Number(txnForm.amount || 0);
    if (Number.isNaN(rawAmount) || rawAmount === 0) {
      toast.error("Amount must be a non-zero number");
      return;
    }
    if (!txnForm.account) {
      toast.error("Please select an account (asset) to link this transaction to");
      return;
    }

    let finalAmount = Math.abs(rawAmount);
    if (txnForm.category !== "income") {
      finalAmount = -finalAmount;
    }

    const tx = {
      id: `txn-${Date.now()}`,
      date: txnForm.date || new Date().toISOString(),
      description: txnForm.description,
      amount: finalAmount,
      category: txnForm.category,
      account: txnForm.account || undefined,
    };
    addTransaction(tx);
    toast.success("Transaction added");
    setTxnSheetOpen(false);
  };

  const openNewSubscription = () => {
    setEditingSubscriptionId(null);
    setSubscriptionForm({
      name: "",
      amount: "",
      cadence: "monthly",
      nextChargeDate: new Date().toISOString().slice(0, 10),
    });
    setSubscriptionSheetOpen(true);
  };

  const openEditSubscription = (id: string) => {
    const sub = subs.find((s) => s.id === id);
    if (!sub) return;
    setEditingSubscriptionId(id);
    setSubscriptionForm({
      name: sub.name,
      amount: String(sub.amount),
      cadence: sub.cadence,
      nextChargeDate: sub.nextChargeDate.slice(0, 10),
    });
    setSubscriptionSheetOpen(true);
  };

  const saveSubscription = () => {
    if (!subscriptionForm.name.trim()) {
      toast.error("Subscription name is required");
      return;
    }
    const amount = Number(subscriptionForm.amount || 0);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    const subscription = {
      id: editingSubscriptionId ?? `sub-${Date.now()}`,
      name: subscriptionForm.name,
      amount,
      cadence: subscriptionForm.cadence,
      nextChargeDate:
        subscriptionForm.nextChargeDate ||
        new Date().toISOString().slice(0, 10),
    };
    if (editingSubscriptionId) {
      updateSubscription(subscription);
      toast.success("Subscription updated");
    } else {
      addSubscription(subscription);
      toast.success("Subscription added");
    }
    setSubscriptionSheetOpen(false);
  };

  const hasTransactions = filteredTransactions.length > 0;
  const hasSubscriptions = subs.length > 0;
  const dailyAllowance =
    allowance > 0 ? Math.round((allowance / 30) * 10) / 10 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Spending
              </div>
              <div className="mt-1 text-xl font-semibold">Monthly snapshot</div>
            </div>
            <Button size="sm" variant="secondary" onClick={openNewTransaction}>
              Add spend
            </Button>
          </div>
          {hasTransactions ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-amber-500/15 p-4 text-sm border border-rose-500/30">
                <div className="text-xs text-rose-100/80">Outflows this period</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {format(Math.round(monthlySpending))}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 p-4 text-sm border border-emerald-500/30">
                <div className="text-xs text-emerald-100/80">Incomes this period</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {format(Math.round(monthlyIncome))}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Net Flow</div>
                <div
                  className={`mt-1 text-lg font-semibold ${
                    monthlyIncome - monthlySpending >= 0
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {monthlyIncome - monthlySpending >= 0 ? "+" : "-"}
                  {format(Math.round(Math.abs(monthlyIncome - monthlySpending)))}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Subscriptions/mo</div>
                <div className="mt-1 text-lg font-semibold text-zinc-100">
                  {format(subs.reduce((sum, s) => sum + s.amount, 0))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EnhancedEmptyState
                type="transactions"
                primaryAction={{
                  label: "Add your first transaction",
                  onClick: openNewTransaction
                }}
              />
            </div>
          )}
          {!overwhelmMode && hasTransactions && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Category breakdown</span>
                <span>
                  Window:{" "}
                  {txnWindow === "all"
                    ? "All time"
                    : txnWindow === "30d"
                    ? "Last 30 days"
                    : "Last 7 days"}
                </span>
              </div>
              <div className="mt-2 h-40 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 p-2">
                {categoryBreakdown.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryBreakdown}
                    >
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        interval={0} 
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCompact(value, countryCode)}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(15, 23, 42, 0.1)" }}
                        contentStyle={{
                          backgroundColor: "rgba(2, 6, 23, 0.9)",
                          borderRadius: 8,
                          border: "1px solid rgba(34, 211, 238, 0.3)",
                        }}
                        formatter={(value: any) =>
                          typeof value === "number"
                            ? format(Math.round(value))
                            : value
                        }
                      />
                      <Bar
                        dataKey="amount"
                        radius={[6, 6, 0, 0]}
                        fill="url(#spendingCategoryGradient)"
                      />
                      <defs>
                        <linearGradient
                          id="spendingCategoryGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    We will gently surface patterns once a few transactions exist.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium">Transactions</div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <ExportButton type="transactions" />
                <Select
                  value={txnWindow}
                  onChange={(v) => setTxnWindow(v as TxnWindow)}
                >
                  <option value="30d">Last 30 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="all">All time</option>
                </Select>
                <Select
                  value={txnFilter}
                  onChange={(v) => setTxnFilter(v as TxnFilter)}
                >
                  <option value="all">All types</option>
                  <option value="spending">Spending only</option>
                  <option value="income">Income only</option>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hidden sm:inline-flex"
                  onClick={openNewTransaction}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              {!hasTransactions && (
                <EnhancedEmptyState
                  type="transactions"
                  title="No transactions in view"
                  description="Adjust filters or add a small expense to get started."
                  primaryAction={{
                    label: "Add transaction",
                    onClick: openNewTransaction
                  }}
                />
              )}
              {filteredTransactions.slice(0, 20).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-900 p-2 text-sm"
                >
                  <div>
                    <div>{t.description}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(t.date).toLocaleDateString()} · {t.category}
                      {t.account ? ` · ${t.account}` : ""}
                    </div>
                  </div>
                  <div
                    className={
                      t.amount < 0 ? "text-red-600" : "text-emerald-600"
                    }
                  >
                    {t.amount < 0 ? "-" : "+"}
                    {format(Math.abs(t.amount))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!overwhelmMode && (
          <CategoryPieChart />
        )}
      </div>

      {/* Recurring Transactions */}
      {!overwhelmMode && (
        <RecurringTransactionManager />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Subscriptions</div>
              <Button size="sm" variant="secondary" onClick={openNewSubscription}>
                Add subscription
              </Button>
            </div>
            <div className="mt-3 grid gap-2">
              {!hasSubscriptions && (
                <EnhancedEmptyState
                  type="subscriptions"
                  primaryAction={{
                    label: "Add subscription",
                    onClick: openNewSubscription
                  }}
                />
              )}
              {subs.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => openEditSubscription(s.id)}
                  className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-left text-sm hover:bg-zinc-800"
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {s.cadence === "monthly"
                        ? "Monthly"
                        : s.cadence === "yearly"
                        ? "Yearly"
                        : "Weekly"}{" "}
                      · next{" "}
                      {new Date(s.nextChargeDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Amount</div>
                    <div className="text-sm font-semibold">
                      {format(s.amount)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm font-medium">Healthy Spend Allowance</div>
            <div className="mt-2 text-xs text-zinc-500">
              A gentle, guilt-free number for everyday discretionary spending.
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Monthly allowance</span>
                <span>{format(allowance)}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={50000}
                step={1000}
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>
            <div className="mt-3 rounded-xl bg-zinc-900 p-3 text-xs">
              <div className="text-zinc-500">Guilt-free daily</div>
              <div className="mt-1 text-sm font-semibold">
                {dailyAllowance
                  ? `~${format(dailyAllowance)} per day`
                  : "Slide to choose a number that feels light"}
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                This is not a rule. It is a soft boundary so you can enjoy life
                today while still moving towards your future self.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={txnSheetOpen}
        onOpenChange={setTxnSheetOpen}
        title="Add transaction"
      >
        <div className="space-y-3 text-sm">
          <Input
            placeholder="Description"
            value={txnForm.description}
            onChange={(e) =>
              setTxnForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <Input
            placeholder="Amount"
            inputMode="decimal"
            value={txnForm.amount}
            onChange={(e) =>
              setTxnForm((f) => ({ ...f, amount: e.target.value }))
            }
          />
          <Select
            value={txnForm.category}
            onChange={(v) =>
              setTxnForm((f) => ({
                ...f,
                category: v as typeof txnForm.category,
              }))
            }
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <div className="space-y-1">
            <div className="text-xs text-zinc-500 px-1">Date</div>
            <Input
              type="date"
              value={txnForm.date}
              onChange={(e) =>
                setTxnForm((f) => ({ ...f, date: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-500 px-1">Account</div>
            <Select
              value={txnForm.account}
              onChange={(v) =>
                setTxnForm((f) => ({ ...f, account: v }))
              }
            >
              <option value="">Select account...</option>
              {assets.filter(a => a.type === 'cash' || a.type === 'other').map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({format(a.value)})
                </option>
              ))}
            </Select>
          </div>
          <Button className="w-full" onClick={saveTransaction}>
            Save
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={subscriptionSheetOpen}
        onOpenChange={setSubscriptionSheetOpen}
        title={editingSubscriptionId ? "Edit subscription" : "Add subscription"}
      >
        <div className="space-y-3 text-sm">
          <Input
            placeholder="Subscription name"
            value={subscriptionForm.name}
            onChange={(e) =>
              setSubscriptionForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Input
            placeholder="Amount"
            inputMode="decimal"
            value={subscriptionForm.amount}
            onChange={(e) =>
              setSubscriptionForm((f) => ({ ...f, amount: e.target.value }))
            }
          />
          <Select
            value={subscriptionForm.cadence}
            onChange={(v) =>
              setSubscriptionForm((f) => ({
                ...f,
                cadence: v as typeof subscriptionForm.cadence,
              }))
            }
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
          </Select>
          <div className="space-y-1">
            <div className="text-xs text-zinc-500 px-1">Next Charge</div>
            <Input
              type="date"
              value={subscriptionForm.nextChargeDate}
              onChange={(e) =>
                setSubscriptionForm((f) => ({
                  ...f,
                  nextChargeDate: e.target.value,
                }))
              }
            />
          </div>
          <Button className="w-full" onClick={saveSubscription}>
            Save
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

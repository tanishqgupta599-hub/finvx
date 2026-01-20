"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/state/app-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Wallet, PieChart, Tag, Pencil, Trash2 } from "lucide-react";
import { Transaction, EXPENSE_CATEGORIES } from "@/domain/models";

type PaymentType = "asset" | "creditCard";
type Category = Transaction["category"];

export default function Expenses() {
  const assets = useAppStore((s) => s.assets);
  const creditCards = useAppStore((s) => s.creditCards);
  const txns = useAppStore((s) => s.transactions);
  const addExpense = useAppStore((s) => s.addExpense);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    description: string;
    amount: string;
    category: Category;
    date: string;
    paymentType: PaymentType;
    sourceId: string;
  }>({
    description: "",
    amount: "",
    category: "spending",
    date: new Date().toISOString().slice(0, 10),
    paymentType: "asset",
    sourceId: "",
  });

  // Filter only spending transactions for this view
  const expenses = useMemo(() => {
    return txns
      .filter((t) => t.amount < 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [txns]);

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return expenses
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((t) => {
      // Group all unknown categories into 'other' or keep them as is if valid
      const key = t.category || "other";
      map.set(key, (map.get(key) ?? 0) + Math.abs(t.amount));
    });
    
    // Convert to array and sort by amount descending
    return Array.from(map.entries())
      .map(([key, value]) => ({ 
        key, 
        value, 
        label: EXPENSE_CATEGORIES.find(c => c.value === key)?.label || key 
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const getSourceName = (type: PaymentType, id: string) => {
    if (type === "asset") {
      return assets.find((a) => a.id === id)?.name || "Unknown Asset";
    } else {
      const card = creditCards.find((c) => c.id === id);
      return card ? `${card.brand.toUpperCase()} ${card.last4}` : "Unknown Card";
    }
  };

  const handleEdit = (t: Transaction) => {
    let type: PaymentType = "asset";
    let sourceId = "";

    // Try to find source from account name
    if (t.account) {
      const asset = assets.find(a => a.name === t.account);
      if (asset) {
        type = "asset";
        sourceId = asset.id;
      } else {
        // Try card
        const card = creditCards.find(c => `${c.brand.toUpperCase()} ${c.last4}` === t.account);
        if (card) {
          type = "creditCard";
          sourceId = card.id;
        }
      }
    }

    setForm({
      description: t.description,
      amount: Math.abs(t.amount).toString(),
      category: t.category,
      date: t.date.slice(0, 10),
      paymentType: type,
      sourceId: sourceId,
    });
    setEditingId(t.id);
    setSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense? This will adjust your balances.")) {
      deleteTransaction(id);
      toast.success("Expense deleted");
    }
  };

  const saveExpense = () => {
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }
    const amount = Number(form.amount || 0);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (!form.sourceId) {
      toast.error("Please select a payment source");
      return;
    }

    if (editingId) {
      // Update existing
      const tx: Transaction = {
        id: editingId,
        date: form.date || new Date().toISOString(),
        description: form.description,
        amount: -amount,
        category: form.category,
        account: getSourceName(form.paymentType, form.sourceId),
      };
      updateTransaction(tx);
      toast.success("Expense updated");
    } else {
      // Add new
      const tx = {
        id: `txn-${Date.now()}`,
        date: form.date || new Date().toISOString(),
        description: form.description,
        amount: -amount,
        category: form.category,
        account: getSourceName(form.paymentType, form.sourceId),
      };
      addExpense(tx, { type: form.paymentType, id: form.sourceId });
      toast.success("Expense tracked & balances updated");
    }

    setSheetOpen(false);
    
    // Reset form
    setEditingId(null);
    setForm({
      description: "",
      amount: "",
      category: "spending",
      date: new Date().toISOString().slice(0, 10),
      paymentType: "asset",
      sourceId: "",
    });
  };

  const cashAssets = assets.filter((a) => a.type === "cash");

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Tracking
              </div>
              <div className="mt-1 text-xl font-semibold">Monthly Expenses</div>
            </div>
            <Button onClick={() => {
              setEditingId(null);
              setForm({
                description: "",
                amount: "",
                category: "spending",
                date: new Date().toISOString().slice(0, 10),
                paymentType: "asset",
                sourceId: "",
              });
              setSheetOpen(true);
            }}>Add Expense</Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-rose-500/15 via-red-500/10 to-orange-500/15 p-4 text-sm border border-rose-500/30">
              <div className="text-xs text-rose-100/80">Total spent this month</div>
              <div className="mt-1 text-2xl font-bold text-white">
                ₹{monthlyTotal.toLocaleString("en-IN")}
              </div>
            </div>
            
            {!overwhelmMode && (
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm sm:col-span-2">
                <div className="text-xs text-zinc-500">Smart Insight</div>
                <div className="mt-1 font-medium">
                  Tracking every rupee? Good. 
                  Remember: spending on credit cards increases your liabilities immediately.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="text-sm font-medium mb-4">Recent Activity</div>
            {expenses.length === 0 ? (
              <EmptyState
                title="No expenses yet"
                description="Start tracking your spending to see insights here."
                primaryActionLabel="Add Expense"
                onPrimaryAction={() => setSheetOpen(true)}
              />
            ) : (
              <div className="space-y-2">
                {expenses.slice(0, 20).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        t.account?.includes("Checking") || t.account?.includes("Cash") 
                          ? "bg-emerald-500/10 text-emerald-600" 
                          : "bg-purple-500/10 text-purple-600"
                      }`}>
                         {t.account?.includes("Checking") || t.account?.includes("Cash") ? <Wallet size={16} /> : <CreditCard size={16} />}
                      </div>
                      <div>
                        <div className="font-medium">{t.description}</div>
                        <div className="text-xs text-zinc-500">
                          {new Date(t.date).toLocaleDateString()} · {t.account}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-rose-600">
                        -₹{Math.abs(t.amount).toLocaleString("en-IN")}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600" onClick={() => handleEdit(t)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600" onClick={() => handleDelete(t.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <div className="text-sm font-medium mb-4">Spending Breakdown</div>
              <div className="space-y-4">
                {categoryBreakdown.length === 0 ? (
                  <div className="text-sm text-zinc-500">No expenses tracked this month</div>
                ) : (
                  categoryBreakdown.slice(0, 5).map((item) => (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                        <span className="text-zinc-500">₹{item.value.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${Math.min((item.value / monthlyTotal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
                {categoryBreakdown.length > 5 && (
                  <div className="pt-2 text-center text-xs text-zinc-500">
                    + {categoryBreakdown.length - 5} more categories
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm font-medium mb-4">Payment Methods</div>
            <div className="space-y-3">
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Credit Cards</div>
              {creditCards.map(card => (
                 <div key={card.id} className="flex justify-between items-center text-sm p-2 bg-zinc-900 rounded-lg">
                    <span className="font-medium">{card.brand.toUpperCase()} {card.last4}</span>
                    <div className="text-right">
                      <div className="text-xs text-emerald-600">Avail: ₹{(card.limit - card.balance).toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-zinc-500">Used: ₹{card.balance.toLocaleString("en-IN")}</div>
                    </div>
                 </div>
              ))}
               <div className="text-xs text-zinc-500 uppercase tracking-wider mt-4">Cash / Bank</div>
              {cashAssets.map(asset => (
                 <div key={asset.id} className="flex justify-between items-center text-sm p-2 bg-zinc-900 rounded-lg">
                    <span className="font-medium">{asset.name}</span>
                    <span className="text-zinc-500">Avail: ₹{asset.value.toLocaleString("en-IN")}</span>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingId ? "Edit Expense" : "Log Expense"}
      >
        <div className="space-y-4 pt-4">
          <div className="flex rounded-lg bg-zinc-800 p-1">
            <button
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                form.paymentType === "asset"
                  ? "bg-zinc-700 shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => setForm(f => ({ ...f, paymentType: "asset", sourceId: "" }))}
            >
              Cash / Bank
            </button>
            <button
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                form.paymentType === "creditCard"
                  ? "bg-zinc-700 shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => setForm(f => ({ ...f, paymentType: "creditCard", sourceId: "" }))}
            >
              Credit Card
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500">Amount</label>
            <Input
              placeholder="0.00"
              type="number"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              className="text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500">Description</label>
            <Input
              placeholder="What was this for?"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500">Category</label>
            <Select
              value={form.category}
              onChange={(v) => setForm(f => ({ ...f, category: v as Category }))}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-medium text-zinc-500">
               {form.paymentType === 'asset' ? 'Withdraw From' : 'Charge To'}
             </label>
             <Select
                value={form.sourceId}
                onChange={(v) => setForm(f => ({ ...f, sourceId: v }))}
             >
                <option value="" disabled>Select Source</option>
                {form.paymentType === 'asset' ? (
                   cashAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (₹{a.value.toLocaleString()})</option>
                   ))
                ) : (
                   creditCards.map(c => (
                      <option key={c.id} value={c.id}>{c.brand.toUpperCase()} {c.last4} (Due: ₹{c.balance.toLocaleString()})</option>
                   ))
                )}
             </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500">Date</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          <Button className="w-full mt-4" onClick={saveExpense}>
            {editingId ? "Update Expense" : "Save Expense"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
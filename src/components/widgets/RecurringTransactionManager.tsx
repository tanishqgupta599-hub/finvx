"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/state/app-store";
import { Repeat, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useCurrencyFormat } from "@/lib/currency";

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  category: string;
  account: string;
  isActive: boolean;
  lastProcessed?: string;
}

export function RecurringTransactionManager() {
  const [recurringTxns, setRecurringTxns] = useState<RecurringTransaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<RecurringTransaction>>({
    description: '',
    amount: 0,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    category: 'spending',
    account: '',
    isActive: true
  });
  
  const assets = useAppStore((s) => s.assets);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const { format } = useCurrencyFormat();

  const saveRecurring = () => {
    if (!form.description || !form.amount || !form.account) {
      toast.error('Please fill all required fields');
      return;
    }

    const newRecurring: RecurringTransaction = {
      id: `recurring-${Date.now()}`,
      description: form.description!,
      amount: Number(form.amount),
      frequency: form.frequency || 'monthly',
      startDate: form.startDate || new Date().toISOString().split('T')[0],
      endDate: form.endDate,
      category: form.category || 'spending',
      account: form.account!,
      isActive: form.isActive ?? true,
      lastProcessed: undefined
    };

    setRecurringTxns([...recurringTxns, newRecurring]);
    setIsAdding(false);
    setForm({
      description: '',
      amount: 0,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      category: 'spending',
      account: '',
      isActive: true
    });
    toast.success('Recurring transaction created');
  };

  const processRecurring = (recurring: RecurringTransaction) => {
    const now = new Date();
    const start = new Date(recurring.startDate);
    const lastProcessed = recurring.lastProcessed ? new Date(recurring.lastProcessed) : start;
    
    let shouldProcess = false;
    let nextDate = new Date(lastProcessed);

    switch (recurring.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    if (now >= nextDate && (!recurring.endDate || now <= new Date(recurring.endDate))) {
      shouldProcess = true;
    }

    if (shouldProcess) {
      const finalAmount = recurring.category === 'income' 
        ? Math.abs(recurring.amount) 
        : -Math.abs(recurring.amount);

      addTransaction({
        id: `txn-${Date.now()}`,
        date: nextDate.toISOString(),
        description: recurring.description,
        amount: finalAmount,
        category: recurring.category as any,
        account: recurring.account
      });

      setRecurringTxns(prev => 
        prev.map(r => r.id === recurring.id 
          ? { ...r, lastProcessed: nextDate.toISOString() }
          : r
        )
      );

      toast.success(`Processed: ${recurring.description}`);
    }
  };

  const deleteRecurring = (id: string) => {
    setRecurringTxns(prev => prev.filter(r => r.id !== id));
    toast.success('Recurring transaction deleted');
  };

  const toggleActive = (id: string) => {
    setRecurringTxns(prev => 
      prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    );
  };

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <Repeat className="h-4 w-4 text-cyan-400" /> Recurring Transactions
          </CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsAdding(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Recurring
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
            <Input
              placeholder="Description (e.g., Netflix Subscription)"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Amount"
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
              <Select
                value={form.frequency}
                onChange={(v) => setForm({ ...form, frequency: v as any })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
              >
                <option value="spending">Expense</option>
                <option value="income">Income</option>
              </Select>
              <Select
                value={form.account}
                onChange={(v) => setForm({ ...form, account: v })}
              >
                <option value="">Select account...</option>
                {assets.filter(a => a.type === 'cash' || a.type === 'other').map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-xs text-zinc-500">Start Date</div>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-zinc-500">End Date (Optional)</div>
                <Input
                  type="date"
                  value={form.endDate || ''}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value || undefined })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveRecurring} className="flex-1">
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {recurringTxns.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No recurring transactions. Add one to automate your finances.
            </div>
          ) : (
            recurringTxns.map((recurring) => {
              const lastProcessed = recurring.lastProcessed 
                ? new Date(recurring.lastProcessed)
                : new Date(recurring.startDate);
              
              let nextDate = new Date(lastProcessed);
              switch (recurring.frequency) {
                case 'daily':
                  nextDate.setDate(nextDate.getDate() + 1);
                  break;
                case 'weekly':
                  nextDate.setDate(nextDate.getDate() + 7);
                  break;
                case 'monthly':
                  nextDate.setMonth(nextDate.getMonth() + 1);
                  break;
                case 'yearly':
                  nextDate.setFullYear(nextDate.getFullYear() + 1);
                  break;
              }

              return (
                <div
                  key={recurring.id}
                  className={`rounded-xl border p-3 ${
                    recurring.isActive 
                      ? 'border-cyan-500/30 bg-cyan-500/5' 
                      : 'border-zinc-800 bg-zinc-950/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white">{recurring.description}</h4>
                        {!recurring.isActive && (
                          <span className="text-[10px] text-zinc-500 uppercase">Paused</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                        <span>{format(Math.abs(recurring.amount))}</span>
                        <span>•</span>
                        <span className="capitalize">{recurring.frequency}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {nextDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {recurring.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => processRecurring(recurring)}
                          className="text-xs"
                        >
                          Process Now
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(recurring.id)}
                        className="text-xs"
                      >
                        {recurring.isActive ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRecurring(recurring.id)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

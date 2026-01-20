
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ExpenseCircle, SharedExpense } from "@/domain/circles";
import { useAppStore } from "@/state/app-store";
import { Plus, Check } from "lucide-react";

interface AddExpenseModalProps {
  circle: ExpenseCircle;
  currentUserId: string;
}

export function AddExpenseModal({ circle, currentUserId }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(circle.members.map(m => m.id));

  const addSharedExpense = useAppStore((s) => s.addSharedExpense);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || selectedMembers.length === 0) return;

    const numAmount = parseFloat(amount);
    const splitAmount = numAmount / selectedMembers.length;

    const newExpense: SharedExpense = {
      id: `exp_${Date.now()}`,
      circleId: circle.id,
      description,
      amount: numAmount,
      paidBy,
      date: new Date().toISOString(),
      category: "General",
      createdAt: new Date().toISOString(),
      createdBy: currentUserId,
      splits: selectedMembers.map(id => ({
        memberId: id,
        amount: splitAmount,
        percentage: 100 / selectedMembers.length
      }))
    };

    addSharedExpense(circle.id, newExpense);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPaidBy(currentUserId);
    setSelectedMembers(circle.members.map(m => m.id));
  };

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      if (selectedMembers.length > 1) { // Prevent empty selection
        setSelectedMembers(selectedMembers.filter(m => m !== id));
      }
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-cyan-500 text-black hover:bg-cyan-400">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Shared Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Taco Bell"
              className="border-zinc-700 bg-zinc-900"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500">₹</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="border-zinc-700 bg-zinc-900 pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Paid By</Label>
            <div className="flex flex-wrap gap-2">
              {circle.members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setPaidBy(member.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    paidBy === member.id
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Split With</Label>
            <div className="grid grid-cols-2 gap-2">
              {circle.members.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 text-sm transition-colors ${
                      isSelected
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-800 bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    <span>{member.name}</span>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                );
              })}
            </div>
            {amount && (
              <p className="text-right text-xs text-zinc-500">
                ₹{selectedMembers.length > 0 ? (parseFloat(amount) / selectedMembers.length).toFixed(2) : "0"} / person
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
              Save Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

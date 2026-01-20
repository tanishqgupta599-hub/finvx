"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { Plus, X, CreditCard, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CardsManager() {
  const cards = useAppStore((s) => s.creditCards);
  const addCard = useAppStore((s) => s.addCreditCard);
  const removeCard = useAppStore((s) => s.removeCreditCard);
  const profile = useAppStore((s) => s.profile);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({
    name: "",
    limit: "",
    balance: "",
  });

  const handleAdd = () => {
    if (!newCard.name || !newCard.limit) {
      toast.error("Please enter a card name and limit");
      return;
    }

    const limit = Number(newCard.limit);
    const balance = Number(newCard.balance) || 0;

    if (limit <= 0) {
      toast.error("Credit limit must be greater than 0");
      return;
    }

    if (balance < 0) {
      toast.error("Balance cannot be negative");
      return;
    }

    if (balance > limit) {
      toast.error("Balance cannot exceed credit limit");
      return;
    }

    addCard({
      id: crypto.randomUUID(),
      name: newCard.name,
      limit: limit,
      balance: balance,
      brand: "other",
      last4: "0000",
      apr: 0 
    });

    setIsAdding(false);
    setNewCard({ name: "", limit: "", balance: "" });
    toast.success("Credit card added");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-400" />
          Credit Cards
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Plus className="h-3 w-3" /> Add Card
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-purple-400">New Credit Card</div>
                <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 md:col-span-1 space-y-1">
                  <label className="text-[10px] text-zinc-500">Card Name</label>
                  <Input 
                    placeholder="e.g. Amex Platinum" 
                    value={newCard.name}
                    onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                    className="h-8 text-xs bg-slate-950/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Limit</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newCard.limit}
                    onChange={(e) => setNewCard({...newCard, limit: e.target.value})}
                    className="h-8 text-xs bg-slate-950/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Current Due</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newCard.balance}
                    onChange={(e) => setNewCard({...newCard, balance: e.target.value})}
                    className="h-8 text-xs bg-slate-950/50"
                  />
                </div>
              </div>

              <Button onClick={handleAdd} size="sm" className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                <Check className="mr-1 h-3 w-3" /> Add Card
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3">
        {cards.length === 0 ? (
           <div className="col-span-full text-center text-sm text-zinc-500 py-4 border border-dashed border-zinc-800 rounded-lg">
             No credit cards added.
           </div>
        ) : (
          cards.map((card) => {
            const limit = card.limit || 0;
            const utilization = limit > 0 ? (card.balance / limit) * 100 : 0;
            return (
              <div key={card.id} className="group relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/50 p-3 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{card.name}</div>
                      <div className="text-[10px] text-zinc-500">
                         Limit: {profile?.currency} {(card.limit || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-400">Utilization</span>
                    <span className={utilization > 30 ? "text-amber-400" : "text-emerald-400"}>
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${utilization > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { Plus, X, Landmark, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AccountsManager() {
  const assets = useAppStore((s) => s.assets);
  const addAsset = useAppStore((s) => s.addAsset);
  const removeAsset = useAppStore((s) => s.removeAsset);
  const profile = useAppStore((s) => s.profile);
  
  const cashAssets = assets.filter(a => a.type === 'cash');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    value: "",
  });

  const handleAdd = () => {
    if (!newAccount.name || !newAccount.value) {
      toast.error("Please enter a bank name and balance");
      return;
    }

    addAsset({
      id: crypto.randomUUID(),
      name: newAccount.name,
      value: Number(newAccount.value),
      type: "cash",
      institution: newAccount.name
    });

    setIsAdding(false);
    setNewAccount({ name: "", value: "" });
    toast.success("Bank account added");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Landmark className="h-5 w-5 text-blue-400" />
          Bank Accounts
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Plus className="h-3 w-3" /> Add Account
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
            <div className="rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-blue-400">New Bank Account</div>
                <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Bank Name</label>
                  <Input 
                    placeholder="e.g. Chase, HDFC" 
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="h-8 text-xs bg-slate-950/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Balance ({profile?.currency})</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newAccount.value}
                    onChange={(e) => setNewAccount({...newAccount, value: e.target.value})}
                    className="h-8 text-xs bg-slate-950/50"
                  />
                </div>
              </div>

              <Button onClick={handleAdd} size="sm" className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                <Check className="mr-1 h-3 w-3" /> Add Bank
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3">
        {cashAssets.length === 0 ? (
           <div className="col-span-full text-center text-sm text-zinc-500 py-4 border border-dashed border-zinc-800 rounded-lg">
             No bank accounts linked.
           </div>
        ) : (
          cashAssets.map((asset) => (
            <div key={asset.id} className="group flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/50 p-3 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">{asset.name}</div>
                  <div className="text-[10px] text-zinc-500">Liquid Asset</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="font-mono text-sm text-white">
                   {profile?.currency} {asset.value.toLocaleString()}
                 </div>
                 <button 
                   onClick={() => removeAsset(asset.id)}
                   className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                 >
                   <Trash2 className="h-3.5 w-3.5" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/state/app-store";
import { Plus, Wallet, Briefcase, Globe, X, Check, ArrowRight } from "lucide-react";
import { IncomeStream, IncomeType } from "@/domain/models";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function IncomeFlow() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const streams = profile?.incomeStreams || [];

  const [isAdding, setIsAdding] = useState(false);
  const [newStream, setNewStream] = useState<Partial<IncomeStream>>({
    name: "",
    amount: 0,
    type: "salary",
    frequency: "monthly",
    predictability: 90,
  });

  const handleAddStream = () => {
    if (!newStream.name || !newStream.amount) {
      toast.error("Please enter a name and amount");
      return;
    }

    if (!profile) return;

    const stream: IncomeStream = {
      id: crypto.randomUUID(),
      name: newStream.name,
      amount: Number(newStream.amount),
      type: newStream.type as IncomeType,
      frequency: newStream.frequency as any,
      predictability: newStream.predictability || 80,
    };

    updateProfile({
      incomeStreams: [...streams, stream],
    });

    setIsAdding(false);
    setNewStream({ name: "", amount: 0, type: "salary", frequency: "monthly", predictability: 90 });
    toast.success("Income stream added");
  };

  const removeStream = (id: string) => {
    if (!profile) return;
    updateProfile({
      incomeStreams: streams.filter(s => s.id !== id),
    });
    toast.success("Income stream removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Income Engine</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Plus className="h-3 w-3" /> Add Stream
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-emerald-400">New Income Source</div>
                <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Name</label>
                  <Input 
                    placeholder="e.g. Salary, Side Gig" 
                    value={newStream.name}
                    onChange={(e) => setNewStream({...newStream, name: e.target.value})}
                    className="h-8 text-xs bg-slate-950/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Amount ({profile?.currency})</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={newStream.amount || ""}
                    onChange={(e) => setNewStream({...newStream, amount: Number(e.target.value)})}
                    className="h-8 text-xs bg-slate-950/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Type</label>
                  <select 
                    value={newStream.type}
                    onChange={(e) => setNewStream({...newStream, type: e.target.value as IncomeType})}
                    className="w-full h-8 rounded-md border border-zinc-800 bg-slate-950/50 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="salary">Salary</option>
                    <option value="business">Business</option>
                    <option value="freelance">Freelance</option>
                    <option value="passive">Passive</option>
                  </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] text-zinc-500">Frequency</label>
                   <select
                     value={newStream.frequency}
                     onChange={(e) => setNewStream({...newStream, frequency: e.target.value as any})}
                     className="w-full h-8 rounded-md border border-zinc-800 bg-slate-950/50 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                   >
                     <option value="monthly">Monthly</option>
                     <option value="weekly">Weekly</option>
                     <option value="irregular">Irregular</option>
                   </select>
                </div>
              </div>

              <Button onClick={handleAddStream} size="sm" className="w-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                <Check className="mr-1 h-3 w-3" /> Add Source
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col md:flex-row items-center gap-8">
        {/* Streams Column */}
        <div className="flex-1 w-full space-y-3">
          {streams.length === 0 ? (
             <div className="text-center text-sm text-zinc-500 py-4 border border-dashed border-zinc-800 rounded-lg">
               No income streams defined. Add one above.
             </div>
          ) : (
            streams.map((stream, idx) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/50 p-3 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${
                    stream.type === 'salary' ? 'bg-emerald-500/10 text-emerald-400' :
                    stream.type === 'freelance' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {stream.type === 'salary' ? <Briefcase className="h-4 w-4" /> : 
                     stream.type === 'freelance' ? <Globe className="h-4 w-4" /> : 
                     <Wallet className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{stream.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wide">
                      <span>{stream.frequency}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span className={stream.predictability > 80 ? "text-emerald-500" : "text-amber-500"}>
                        {stream.predictability}% Predictable
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="font-medium text-emerald-400 text-sm">
                        {profile?.currency} {stream.amount.toLocaleString()}
                    </div>
                    <button 
                        onClick={() => removeStream(stream.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
                
                {/* Flow Line Animation */}
                <div className="absolute -right-8 top-1/2 h-[2px] w-8 bg-zinc-800 hidden md:block">
                  <motion.div
                    animate={{ x: [0, 32] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className={`h-full w-4 rounded-full ${
                      stream.type === 'salary' ? 'bg-emerald-500' :
                      stream.type === 'freelance' ? 'bg-blue-500' : 'bg-purple-500'
                    } blur-[1px]`}
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Central Hub (Visual Only) */}
        <div className="hidden md:flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
           <div className="text-center">
             <div className="text-[10px] uppercase tracking-widest text-zinc-500">Total Flow</div>
             <div className="text-xl font-bold text-emerald-400">
               {profile?.currency} {streams.reduce((acc, s) => acc + s.amount, 0).toLocaleString()}
             </div>
             <div className="text-[10px] text-zinc-600">/ month</div>
           </div>
        </div>
      </div>
    </div>
  );
}

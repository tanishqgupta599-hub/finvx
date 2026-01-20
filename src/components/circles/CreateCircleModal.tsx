"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ExpenseCircle } from "@/domain/circles";
import { useAppStore } from "@/state/app-store";
import { Plus, Check, UserPlus } from "lucide-react";

interface CreateCircleModalProps {
  currentUserId: string;
}

export function CreateCircleModal({ currentUserId }: CreateCircleModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const addCircle = useAppStore((s) => s.addCircle);
  const friends = useAppStore((s) => s.friends);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Create members list: Current User + Selected Friends
    const members = [
      {
        id: currentUserId,
        name: "You", 
        role: "admin" as const,
        joinedAt: new Date().toISOString(),
        reminderPreferences: { tone: "neutral" as const, mutedCircles: [], blockedUsers: [] }
      },
      ...selectedMembers.map(id => {
        const friend = friends.find(f => f.id === id)!;
        return {
          id: friend.id,
          name: friend.name,
          role: "member" as const,
          joinedAt: new Date().toISOString(),
          reminderPreferences: { tone: "neutral" as const, mutedCircles: [], blockedUsers: [] }
        };
      })
    ];

    const newCircle: ExpenseCircle = {
      id: `c_${Date.now()}`,
      name,
      icon: "👥",
      currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      defaultSplitType: "equal",
      members,
      expenses: []
    };

    addCircle(newCircle);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setSelectedMembers([]);
  };

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-cyan-500 text-black hover:bg-cyan-400">
          <Plus className="h-4 w-4" />
          Create Circle
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Circle Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Goa Trip, Flat 302"
              className="border-zinc-700 bg-zinc-900"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Add Members</Label>
            <div className="grid grid-cols-2 gap-2">
              {friends.map((friend) => {
                const isSelected = selectedMembers.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    onClick={() => toggleMember(friend.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 text-sm transition-colors ${
                      isSelected
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-800 bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    <span>{friend.name}</span>
                    {isSelected ? <Check className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500">
              {selectedMembers.length === 0 ? "Only you" : `You + ${selectedMembers.length} others`}
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
              Create Circle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

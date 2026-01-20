"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAppStore } from "@/state/app-store";
import { UserPlus } from "lucide-react";
import { Friend } from "@/domain/friends";

export function AddFriendModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const addFriend = useAppStore((s) => s.addFriend);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      name,
      email: email || undefined,
      status: "invited", // In a real app, this would trigger an invite
      joinedAt: new Date().toISOString(),
      associatedCircleIds: [],
      avatar: "👤"
    };

    addFriend(newFriend);
    setOpen(false);
    setName("");
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-cyan-500 text-black hover:bg-cyan-400">
          <UserPlus className="h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Friend</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aditi Sharma"
              className="border-zinc-700 bg-zinc-900"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aditi@example.com"
              className="border-zinc-700 bg-zinc-900"
            />
            <p className="text-xs text-zinc-500">
              We'll send them an invite to join Finvx.
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

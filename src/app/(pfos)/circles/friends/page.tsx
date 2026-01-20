"use client";

import { useAppStore } from "@/state/app-store";
import { AddFriendModal } from "@/components/circles/AddFriendModal";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";

export default function FriendsPage() {
  const friends = useAppStore((s) => s.friends);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/circles" className="rounded-full bg-zinc-900 p-2 text-zinc-400 transition-colors hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">My Friends</h1>
          <p className="text-sm text-zinc-400">Manage your circle connections</p>
        </div>
        <AddFriendModal />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend, i) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
                  {friend.avatar || "👤"}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {friend.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span className={`inline-block h-2 w-2 rounded-full ${friend.status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                    <span className="capitalize">{friend.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-zinc-800 pt-3">
              {friend.email && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Mail className="h-3 w-3" />
                  <span>{friend.email}</span>
                </div>
              )}
              {friend.phone && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Phone className="h-3 w-3" />
                  <span>{friend.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Calendar className="h-3 w-3" />
                <span>Joined {new Date(friend.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {friends.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <p>You haven't added any friends yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

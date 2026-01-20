
"use client";

import { useAppStore } from "@/state/app-store";
import { CircleCard } from "@/components/circles/CircleCard";
import { CreateCircleModal } from "@/components/circles/CreateCircleModal";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CirclesPage() {
  const circles = useAppStore((s) => s.circles);
  // Assuming "finos_x7A9KQ" is the logged-in user for MVP (Arjun)
  const currentUserId = "finos_x7A9KQ";

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expense Circles</h1>
          <p className="text-sm text-zinc-400">Shared financial clarity, built on trust.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/circles/friends">
            <Button variant="secondary" className="gap-2">
              <Users className="h-4 w-4" />
              My Friends
            </Button>
          </Link>
          <CreateCircleModal currentUserId={currentUserId} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {circles.map((circle, i) => (
          <motion.div
            key={circle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <CircleCard circle={circle} currentUserId={currentUserId} />
          </motion.div>
        ))}

        {circles.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <p>No active circles. Create one to start sharing expenses securely.</p>
          </div>
        )}
      </div>
    </div>
  );
}

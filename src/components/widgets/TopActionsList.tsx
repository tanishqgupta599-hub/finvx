"use client";
import Link from "next/link";
import { useAppStore } from "@/state/app-store";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

export function TopActionsList() {
  const actions = useAppStore((s) => s.actions);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!actions.length) {
    return (
      <EmptyState
        title="You are all caught up"
        description="No suggested actions right now. As your data grows, Finvx will surface gentle next steps here."
      />
    );
  }

  const filtered = overwhelmMode ? actions.filter((a) => a.safe).slice(0, 1) : actions.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-400">Top actions</div>
        <div className="text-xs text-zinc-500">{overwhelmMode ? "Overwhelm Mode on • 1 gentle step" : "3 focused suggestions"}</div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {filtered.map((action) => (
          <Card key={action.id} className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-white/10">
            <CardContent>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold leading-snug text-zinc-200">{action.title}</div>
                  <div className="mt-1 text-xs text-zinc-400">{action.reason}</div>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-black">
                  {action.impactLabel}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Link
                  href={`/actions/${action.id}`}
                  className="inline-flex h-8 flex-1 items-center justify-center rounded-2xl bg-zinc-100 px-3 text-xs font-medium text-black transition-colors hover:bg-zinc-200"
                >
                  View steps
                </Link>
                <button
                  type="button"
                  onClick={() => setOpenId(action.id)}
                  className="text-xs text-zinc-500 underline-offset-2 hover:underline hover:text-zinc-300"
                >
                  Why?
                </button>
              </div>
              <Sheet
                open={openId === action.id}
                onOpenChange={(open) => setOpenId(open ? action.id : null)}
                title="Why this action?"
              >
                <div className="space-y-3 text-sm text-zinc-400">
                  <div>{action.whyThis}</div>
                  <div className="rounded-xl bg-zinc-900 p-3 text-xs text-zinc-400">
                    If you ignore this now: {action.consequence}
                  </div>
                </div>
              </Sheet>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

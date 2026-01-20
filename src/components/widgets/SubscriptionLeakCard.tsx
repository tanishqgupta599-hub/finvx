"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";

export function SubscriptionLeakCard() {
  const subs = useAppStore((s) => s.subscriptions);
  const demoEnabled = useAppStore((s) => s.demoDataEnabled);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30">
        <CardContent>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!subs.length && !demoEnabled) {
    return (
      <Card className="h-full bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30">
        <CardContent>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!subs.length) {
    return (
      <Card className="h-full bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30">
        <CardContent>
          <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">
            Subscription leak
          </div>
          <div className="mt-2 text-sm text-fuchsia-50/90">No recurring subscriptions detected.</div>
        </CardContent>
      </Card>
    );
  }

  const monthly = subs.reduce((sum, s) => sum + s.amount, 0);
  const top = subs[0];

  return (
    <Card className="h-full bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30">
      <CardContent>
        <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">
          Subscription leak
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
          ₹{monthly.toFixed(0)}/mo
        </div>
        <div className="mt-1 text-xs text-fuchsia-50/90">
          Largest: {top.name} at ₹{top.amount.toFixed(0)}/mo
        </div>
      </CardContent>
    </Card>
  );
}

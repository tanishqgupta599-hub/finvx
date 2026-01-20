"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function AlertsList() {
  const loans = useAppStore((s) => s.loans);
  const subs = useAppStore((s) => s.subscriptions);
  const policies = useAppStore((s) => s.insurancePolicies);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-4 w-32" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const alerts: { id: string; label: string; tone: "info" | "warn" }[] = [];

  if (loans[0]) {
    alerts.push({
      id: "emi",
      label: `EMI for ${loans[0].name} due soon`,
      tone: "warn",
    });
  }

  if (policies[0]) {
    alerts.push({
      id: "policy",
      label: `${policies[0].provider} policy renewal this month`,
      tone: "info",
    });
  }

  if (subs[0]) {
    alerts.push({
      id: "sub",
      label: `Subscription to ${subs[0].name} renews in a few days`,
      tone: "info",
    });
  }

  alerts.push({
    id: "points",
    label: "Credit card reward points nearing expiry next quarter",
    tone: "info",
  });

  if (!alerts.length) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <div className="text-sm font-medium">Upcoming nudges</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {alerts.map((a) => (
            <span
              key={a.id}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                a.tone === "warn"
                  ? "bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {a.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


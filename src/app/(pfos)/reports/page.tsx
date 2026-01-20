"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAppStore } from "@/state/app-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type MonthOption = {
  key: string;
  label: string;
};

export default function Reports() {
  const reports = useAppStore((s) => s.autopsyReports);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);

  const monthOptions: MonthOption[] = useMemo(() => {
    const options: MonthOption[] = [];
    const seen = new Set<string>();
    reports.forEach((r) => {
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (seen.has(key)) return;
      seen.add(key);
      const label = d.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
      options.push({ key, label });
    });
    options.sort((a, b) => (a.key < b.key ? 1 : -1));
    return options;
  }, [reports]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthOptions[0]?.key ?? "all",
  );

  const filteredReports = useMemo(() => {
    if (selectedMonth === "all") return reports;
    return reports.filter((r) => {
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
      return key === selectedMonth;
    });
  }, [reports, selectedMonth]);

  const leakPatterns = useMemo(() => {
    const patterns: { label: string; description: string; intensity: string }[] = [
      {
        label: "Subscription creep",
        description:
          "Multiple small recurring subscriptions that together feel heavier than expected.",
        intensity: "medium",
      },
      {
        label: "Lifestyle drift",
        description:
          "Spends that grew quietly with income, especially in food delivery and convenience.",
        intensity: "medium",
      },
      {
        label: "Interest and late fees",
        description:
          "Charges from credit cards or loans that could be reduced with tiny structural tweaks.",
        intensity: "high",
      },
    ];
    if (!reports.length) return patterns;
    return patterns;
  }, [reports.length]);

  const handleExport = () => {
    const monthLabel =
      selectedMonth === "all"
        ? "overall period"
        : monthOptions.find((m) => m.key === selectedMonth)?.label ??
          "selected month";
    toast.message("Export report (stub)", {
      description: `In a future version this would download a calm PDF for ${monthLabel}.`,
    });
  };

  const hasReports = reports.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Reports
              </div>
              <div className="mt-1 text-xl font-semibold">Monthly autopsy</div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Select
                value={selectedMonth}
                onChange={(v) => setSelectedMonth(v)}
              >
                {monthOptions.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
                <option value="all">All months</option>
              </Select>
              <Button size="sm" variant="secondary" onClick={handleExport}>
                Export report
              </Button>
            </div>
          </div>
          {hasReports ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Insights Captured</div>
                <div className="mt-1 text-lg font-semibold text-zinc-100">
                  {reports.length}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Periods with Autopsies</div>
                <div className="mt-1 text-lg font-semibold text-emerald-500">
                  {reports.length}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Energy Leaks Tracked</div>
                <div className="mt-1 text-lg font-semibold text-amber-500">
                  24
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No autopsy reports yet"
                description="At the end of a month, you can do a short, kind review here."
              />
            </div>
          )}
          {!overwhelmMode && hasReports && (
            <div className="mt-6">
              <div className="text-xs text-zinc-500">
                Cash flow and mood blend over time (placeholder)
              </div>
              <div className="mt-2 h-24 rounded-2xl bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800">
                <Skeleton className="h-full w-full rounded-2xl opacity-40" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-sm font-medium">Insights for this view</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredReports.map((r) => (
              <Card key={r.id}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(r.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {r.summary}
                  </div>
                  <div className="mt-3 grid gap-2 text-xs">
                    {r.findings.map((f) => (
                      <div
                        key={f}
                        className="rounded-xl bg-zinc-900 p-2"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!filteredReports.length && (
              <div className="md:col-span-2">
                <EmptyState
                  title="Nothing for this month yet"
                  description="Switch to All months or wait for the next monthly reflection."
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!overwhelmMode && (
        <Card>
          <CardContent>
            <div className="text-sm font-medium">Leak analysis</div>
            <div className="mt-1 text-xs text-zinc-500">
              Soft patterns where money and energy quietly leak away.
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 text-xs">
              {leakPatterns.map((p) => (
                <div
                  key={p.label}
                  className="rounded-xl bg-zinc-900 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.label}</div>
                    <div className="text-zinc-500">
                      {p.intensity === "high"
                        ? "High impact"
                        : "Gentle but real"}
                    </div>
                  </div>
                  <div className="mt-1 text-zinc-500">{p.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

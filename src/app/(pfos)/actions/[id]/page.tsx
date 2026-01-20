"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore } from "@/state/app-store";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ActionDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const actions = useAppStore((s) => s.actions);
  const toggleStep = useAppStore((s) => s.toggleActionStep);
  const action = actions.find((a) => a.id === id);

  if (!action) {
    return (
      <div className="space-y-4">
        <Link
          href="/home"
          className="inline-flex h-8 items-center justify-center rounded-2xl px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to home
        </Link>
        <Card>
          <CardContent>
            <div className="text-sm">Action not found.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const doneCount = action.steps.filter((s) => s.done).length;
  const total = action.steps.length || 1;
  const progress = (doneCount / total) * 100;

  return (
    <div className="space-y-4">
      <Link
        href="/home"
        className="inline-flex h-8 items-center justify-center rounded-2xl px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Back to home
      </Link>
      <Card className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Action plan</div>
              <div className="mt-1 text-xl font-semibold">{action.title}</div>
            </div>
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-black">
              {action.impactLabel}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                {doneCount} of {total} steps complete
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardContent>
            <div className="text-sm font-medium">Steps</div>
            <div className="mt-3 space-y-2">
              {action.steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900"
                >
                  <div className={step.done ? "text-zinc-400 line-through" : ""}>{step.label}</div>
                  <Button
                    type="button"
                    size="sm"
                    variant={step.done ? "secondary" : "primary"}
                    onClick={() => toggleStep(action.id, step.id)}
                  >
                    {step.done ? "Undo" : "Mark done"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <Card>
            <CardContent>
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Why this matters
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{action.whyThis}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                If you ignore this
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {action.consequence}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

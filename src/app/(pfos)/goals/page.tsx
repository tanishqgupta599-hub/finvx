"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/state/app-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Goal as GoalModel, GOAL_TYPES } from "@/domain/models";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function Goals() {
  const goals = useAppStore((s) => s.goals);
  const assets = useAppStore((s) => s.assets);
  const addGoal = useAppStore((s) => s.addGoal);
  const updateGoal = useAppStore((s) => s.updateGoal);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);

  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState<{
    title: string;
    type: GoalModel["type"];
    targetAmount: string;
    currentAmount: string;
    dueDate: string;
    priority: GoalModel["priority"];
  }>({
    title: "",
    type: "other",
    targetAmount: "",
    currentAmount: "",
    dueDate: "",
    priority: "medium",
  });
  const [scenario, setScenario] = useState<
    "base" | "job_loss" | "child" | "marriage" | "retirement"
  >("base");

  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalProgress = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  
  const monthlySavingsNeeded = useMemo(() => {
    if (!goalForm.targetAmount || !goalForm.dueDate) return null;
    const target = Number(goalForm.targetAmount);
    const current = Number(goalForm.currentAmount || 0);
    const due = new Date(goalForm.dueDate);
    const now = new Date();
    
    // Months difference
    const months = (due.getFullYear() - now.getFullYear()) * 12 + (due.getMonth() - now.getMonth());
    
    if (months <= 0) return null;
    const needed = Math.max(0, target - current);
    return Math.ceil(needed / months);
  }, [goalForm.targetAmount, goalForm.currentAmount, goalForm.dueDate]);

  const selectedTypeInfo = GOAL_TYPES.find(t => t.value === goalForm.type);

  const freedomScore = useMemo(() => {
    const liquidity = assets.reduce((sum, a) => sum + a.value, 0);
    if (!liquidity || !totalGoalTarget) return 55;
    const ratio = Math.min(1.2, liquidity / totalGoalTarget);
    return Math.round(40 + ratio * 50);
  }, [assets, totalGoalTarget]);

  const freedomTrendData = useMemo(() => {
    const base = freedomScore || 55;
    const labels = ["T-4", "T-3", "T-2", "T-1", "Now"];
    const deltas = [-12, -8, -4, -2, 0];
    return labels.map((label, index) => {
      const adjusted = base + deltas[index];
      const value = Math.max(20, Math.min(100, adjusted));
      return { label, value };
    });
  }, [freedomScore]);

  const openNewGoal = () => {
    setEditingGoalId(null);
    setGoalForm({
      title: "",
      type: "other",
      targetAmount: "",
      currentAmount: "",
      dueDate: "",
      priority: "medium",
    });
    setGoalSheetOpen(true);
  };

  const openEditGoal = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    setEditingGoalId(id);
    setGoalForm({
      title: goal.title,
      type: goal.type || "other",
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      dueDate: goal.dueDate ? goal.dueDate.slice(0, 10) : "",
      priority: goal.priority,
    });
    setGoalSheetOpen(true);
  };

  const saveGoal = () => {
    if (!goalForm.title.trim()) {
      toast.error("Goal title is required");
      return;
    }
    const targetAmount = Number(goalForm.targetAmount || 0);
    const currentAmount = Number(goalForm.currentAmount || 0);
    if ([targetAmount, currentAmount].some((n) => Number.isNaN(n) || n < 0)) {
      toast.error("Amounts must be non-negative numbers");
      return;
    }
    const goal: GoalModel = {
      id: editingGoalId ?? `goal-${Date.now()}`,
      title: goalForm.title,
      type: goalForm.type,
      targetAmount,
      currentAmount,
      dueDate: goalForm.dueDate || undefined,
      priority: goalForm.priority,
    };
    if (editingGoalId) {
      updateGoal(goal);
      toast.success("Goal updated");
    } else {
      addGoal(goal);
      toast.success("Goal added");
    }
    setGoalSheetOpen(false);
  };

  const hasGoals = goals.length > 0;

  const scenarioSummary = (() => {
    switch (scenario) {
      case "job_loss":
        return {
          title: "Job loss buffer",
          body: "Imagine a 3–6 month income pause. This view helps you see if your cushions and goals can bend without breaking.",
          adjustments: [
            "Prioritise emergency fund and pause low-priority goals.",
            "Shift high-commitment investments to more liquid options where possible.",
            "Reduce discretionary spends gently instead of abruptly cutting everything.",
          ],
        };
      case "child":
        return {
          title: "Welcoming a child",
          body: "New life, new line items. Healthcare, childcare, education and time buffers become more important.",
          adjustments: [
            "Create a dedicated child fund with small, auto-moving contributions.",
            "Increase health and term coverage where it feels appropriate.",
            "Revisit timelines for optional lifestyle goals and relax them a little.",
          ],
        };
      case "marriage":
        return {
          title: "Marriage / partnership",
          body: "Two money stories meet. The goal is not perfection, but alignment and clarity.",
          adjustments: [
            "Create a shared goals board and keep one or two purely personal goals.",
            "Agree on a calm, guilt-free joint spending allowance.",
            "Align emergency fund and insurance with both of your lives.",
          ],
        };
      case "retirement":
        return {
          title: "Retirement / work-optional",
          body: "Freedom is less about a number and more about predictable, low-stress cash flow.",
          adjustments: [
            "Shift focus from wealth growth to cash flow stability and safety.",
            "Simplify the number of active goals so tracking feels light.",
            "Balance travel / experiences with health buffers and contingencies.",
          ],
        };
      default:
        return {
          title: "Base case",
          body: "A calm snapshot of where you are today, without any shocks.",
          adjustments: [
            "Stay consistent with small, repeatable contributions.",
            "Revisit goals briefly once a quarter, not every single day.",
            "Reward yourself for progress, not perfection.",
          ],
        };
    }
  })();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Goals
              </div>
              <div className="mt-1 text-xl font-semibold">Goals and freedom</div>
            </div>
            <Button size="sm" variant="secondary" onClick={openNewGoal}>
              Add goal
            </Button>
          </div>
          {hasGoals ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Total target</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{totalGoalTarget.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Saved so far</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{totalGoalProgress.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-900 p-4 text-sm">
                <div className="text-xs text-zinc-500">Freedom score</div>
                <div className="mt-1 text-lg font-semibold">
                  {freedomScore}/100
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No goals yet"
                description="Name one calm, realistic goal – even a small one – to get started."
                primaryActionLabel="Add goal"
                onPrimaryAction={openNewGoal}
              />
            </div>
          )}
          {!overwhelmMode && (
            <div className="mt-6">
              <div className="text-xs text-zinc-400">Freedom score trend</div>
              <div className="mt-2 h-32 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 px-3 py-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={freedomTrendData}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ stroke: "rgba(168, 85, 247, 0.5)", strokeWidth: 1 }}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderRadius: 8,
                        border: "1px solid rgba(129, 140, 248, 0.4)",
                      }}
                      formatter={(value: any) =>
                        typeof value === "number" ? `${value}/100` : value
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      fill="url(#freedomGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient
                        id="freedomGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Goals dashboard</div>
              <Button size="sm" variant="ghost" onClick={openNewGoal}>
                Add
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {goals.map((g) => {
                const pct = Math.min(
                  100,
                  g.targetAmount
                    ? Math.round((g.currentAmount / g.targetAmount) * 100)
                    : 0,
                );
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => openEditGoal(g.id)}
                    className="text-left"
                  >
                    <Card>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{g.title}</div>
                            <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                               {GOAL_TYPES.find(t => t.value === g.type)?.label || "Goal"}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500">
                            {g.priority}
                          </div>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-100"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-zinc-500">
                          ₹{g.currentAmount.toLocaleString("en-IN")} / ₹
                          {g.targetAmount.toLocaleString("en-IN")}
                          {g.dueDate
                            ? ` · by ${new Date(
                                g.dueDate,
                              ).toLocaleDateString()}`
                            : ""}
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
              {!hasGoals && (
                <div className="md:col-span-2">
                  <EmptyState
                    title="Goal cards will show up here"
                    description="You can keep this section very small. One or two good goals is enough."
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!overwhelmMode && (
          <Card>
            <CardContent>
              <div className="text-sm font-medium">Freedom score</div>
              <div className="mt-3 flex items-baseline gap-3">
                <div className="text-4xl font-semibold">{freedomScore}</div>
                <div className="text-xs text-zinc-500">out of 100</div>
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                This is a gentle, opinionated blend of your assets and goal
                commitments. It is not a verdict, just a compass.
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="rounded-xl bg-zinc-900 p-3">
                  <div className="font-medium">Buffers</div>
                  <div className="mt-1 text-zinc-500">
                    Emergency fund and low-debt levels move this score more than
                    fancy investments.
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-900 p-3">
                  <div className="font-medium">Goal mix</div>
                  <div className="mt-1 text-zinc-500">
                    A few clear goals beaten slowly are better than many
                    scattered ones.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!overwhelmMode && (
        <Card>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium">Scenario simulator</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Button size="sm" variant={scenario === "base" ? "primary" : "secondary"} onClick={() => setScenario("base")}>
                  Base
                </Button>
                <Button size="sm" variant={scenario === "job_loss" ? "primary" : "secondary"} onClick={() => setScenario("job_loss")}>
                  Job loss
                </Button>
                <Button size="sm" variant={scenario === "child" ? "primary" : "secondary"} onClick={() => setScenario("child")}>
                  Child
                </Button>
                <Button size="sm" variant={scenario === "marriage" ? "primary" : "secondary"} onClick={() => setScenario("marriage")}>
                  Marriage
                </Button>
                <Button size="sm" variant={scenario === "retirement" ? "primary" : "secondary"} onClick={() => setScenario("retirement")}>
                  Retirement
                </Button>
              </div>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Scenario
                </div>
                <div className="mt-1 text-base font-medium">
                  {scenarioSummary.title}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {scenarioSummary.body}
                </div>
              </div>
              <div className="grid gap-2 text-xs">
                {scenarioSummary.adjustments.map((adj) => (
                  <div
                    key={adj}
                    className="rounded-xl bg-zinc-900 p-3"
                  >
                    {adj}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Sheet
        open={goalSheetOpen}
        onOpenChange={setGoalSheetOpen}
        title={editingGoalId ? "Edit goal" : "Add goal"}
      >
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <div className="text-xs text-zinc-500 px-1">Goal Type</div>
            <Select
              value={goalForm.type}
              onChange={(v) =>
                setGoalForm((f) => ({ ...f, type: v as GoalModel["type"] }))
              }
            >
              {GOAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          {selectedTypeInfo && (
            <div className="rounded-xl bg-indigo-500/10 p-3 text-xs border border-indigo-500/20 text-indigo-200">
              <div className="font-medium text-indigo-100">Smart Tip</div>
              <div className="mt-1 opacity-90">{selectedTypeInfo.suggestion}</div>
            </div>
          )}

          <Input
            placeholder="Goal name"
            value={goalForm.title}
            onChange={(e) =>
              setGoalForm((f) => ({ ...f, title: e.target.value }))
            }
          />
          <Input
            placeholder="Target amount"
            inputMode="decimal"
            value={goalForm.targetAmount}
            onChange={(e) =>
              setGoalForm((f) => ({ ...f, targetAmount: e.target.value }))
            }
          />
          <Input
            placeholder="Current saved"
            inputMode="decimal"
            value={goalForm.currentAmount}
            onChange={(e) =>
              setGoalForm((f) => ({ ...f, currentAmount: e.target.value }))
            }
          />
          
          <div className="space-y-1">
            <div className="text-xs text-zinc-500 px-1">Target Date</div>
            <Input
              type="date"
              value={goalForm.dueDate}
              onChange={(e) =>
                setGoalForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </div>

          {monthlySavingsNeeded !== null && monthlySavingsNeeded > 0 && (
            <div className="rounded-xl bg-emerald-500/10 p-3 text-xs border border-emerald-500/20 text-emerald-200">
              <div className="font-medium text-emerald-100">Plan</div>
              <div className="mt-1 opacity-90">
                Save <span className="font-semibold">₹{monthlySavingsNeeded.toLocaleString("en-IN")}</span> per month to reach this goal on time.
              </div>
            </div>
          )}

          <Select
            value={goalForm.priority}
            onChange={(v) =>
              setGoalForm((f) => ({
                ...f,
                priority: v as GoalModel["priority"],
              }))
            }
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium</option>
            <option value="high">High priority</option>
          </Select>
          <Button className="w-full" onClick={saveGoal}>
            Save
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

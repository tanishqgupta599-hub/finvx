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
import type { CreditCard as CreditCardModel } from "@/domain/models";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Cards() {
  const cards = useAppStore((s) => s.creditCards);
  const addCard = useAppStore((s) => s.addCreditCard);
  const updateCard = useAppStore((s) => s.updateCreditCard);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);

  const [selectedCardId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("groceries");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<{
    brand: CreditCardModel["brand"];
    last4: string;
    limit: string;
    balance: string;
    apr: string;
    pointsBalance: string;
    nextBillDate: string;
    annualFee: string;
    rewardProgram: string;
    billAmount?: string;
    billDueDate?: string;
  }>({
    brand: "visa",
    last4: "",
    limit: "",
    balance: "",
    apr: "",
    pointsBalance: "",
    nextBillDate: new Date().toISOString().slice(0, 10),
    annualFee: "",
    rewardProgram: "",
    billAmount: "",
    billDueDate: "",
  });

  const totalLimit = cards.reduce((sum, c) => sum + (c.limit || 0), 0);
  const totalBalance = cards.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalAvailable = totalLimit - totalBalance;
  const totalPoints = cards.reduce((sum, c) => sum + (c.pointsBalance ?? 0), 0);

  const selectedCard =
    cards.find((c) => c.id === selectedCardId) ?? (cards.length ? cards[0] : undefined);

  const utilization = totalLimit ? Math.round((totalBalance / totalLimit) * 100) : 0;

  const bestCardId = useMemo(() => {
    if (!cards.length) return null;
    const withPoints = cards.filter((c) => (c.pointsBalance ?? 0) > 0);
    const source = withPoints.length ? withPoints : cards;
    const best = source.reduce((bestSoFar, c) => {
      if (!bestSoFar) return c;
      const bestScore = (bestSoFar.pointsBalance ?? 0) - bestSoFar.balance * 0.001;
      const score = (c.pointsBalance ?? 0) - c.balance * 0.001;
      return score > bestScore ? c : bestSoFar;
    });
    return best.id;
  }, [cards]);

  const cardsTrendData = useMemo(
    () => {
      const labels = ["T-3", "T-2", "T-1", "Now"];
      return labels.map((label, index) => {
        const factor = 0.7 + index * 0.1;
        const utilValue = Math.max(
          0,
          Math.min(100, Math.round(utilization * factor)),
        );
        const pointsValue = Math.max(
          0,
          Math.round(totalPoints * factor),
        );
        return {
          label,
          utilization: utilValue,
          points: pointsValue,
        };
      });
    },
    [utilization, totalPoints],
  );

  const openNewCard = () => {
    setEditingCardId(null);
    setCardForm({
      brand: "visa",
      last4: "",
      limit: "",
      balance: "",
      apr: "",
      pointsBalance: "",
      nextBillDate: new Date().toISOString().slice(0, 10),
      annualFee: "",
      rewardProgram: "",
      billAmount: "",
      billDueDate: "",
    });
    setCardSheetOpen(true);
  };

  const openEditCard = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setEditingCardId(id);
    setCardForm({
      brand: card.brand,
      last4: card.last4,
      limit: String(card.limit || 0),
      balance: String(card.balance),
      apr: card.apr != null ? String(card.apr) : "",
      pointsBalance: card.pointsBalance != null ? String(card.pointsBalance) : "",
      nextBillDate: card.nextBillDate
        ? card.nextBillDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      annualFee: card.annualFee != null ? String(card.annualFee) : "",
      rewardProgram: card.rewardProgram ?? "",
      billAmount: card.billAmount != null ? String(card.billAmount) : "",
      billDueDate: card.billDueDate ?? "",
    });
    setCardSheetOpen(true);
  };

  const saveCard = () => {
    if (!cardForm.last4.trim() || cardForm.last4.length !== 4) {
      toast.error("Last 4 digits are required");
      return;
    }
    const limit = Number(cardForm.limit || 0);
    const balance = Number(cardForm.balance || 0);
    const apr = cardForm.apr ? Number(cardForm.apr) : undefined;
    const pointsBalance = cardForm.pointsBalance
      ? Number(cardForm.pointsBalance)
      : undefined;
    const annualFee = cardForm.annualFee ? Number(cardForm.annualFee) : undefined;
    const billAmount = cardForm.billAmount ? Number(cardForm.billAmount) : undefined;
    
    if ([limit, balance].some((n) => Number.isNaN(n))) {
      toast.error("Limit and balance must be numbers");
      return;
    }
    if (
      [apr, pointsBalance, annualFee, billAmount].some(
        (n) => n != null && Number.isNaN(Number(n)),
      )
    ) {
      toast.error("Rates, points, fee, and bill amount must be numbers");
      return;
    }
    const card: CreditCardModel = {
      id: editingCardId ?? `card-${Date.now()}`,
      brand: cardForm.brand,
      last4: cardForm.last4,
      limit,
      balance,
      apr,
      pointsBalance,
      nextBillDate: cardForm.nextBillDate,
      rewardProgram: cardForm.rewardProgram || undefined,
      annualFee,
      billAmount,
      billDueDate: cardForm.billDueDate || undefined,
    };
    if (editingCardId) {
      updateCard(card);
      toast.success("Card updated");
    } else {
      addCard(card);
      toast.success("Card added");
    }
    setCardSheetOpen(false);
  };

  const runBestCardTool = () => {
    const amount = Number(amountInput || 0);
    if (!cards.length) {
      toast.error("Add a card first");
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a positive amount");
      return;
    }
    if (!bestCardId) {
      setRecommendation("Any existing card works – focus on timely full payments.");
      return;
    }
    const best = cards.find((c) => c.id === bestCardId);
    if (!best) return;
    setRecommendation(
      `Use your ${best.brand.toUpperCase()} •••• ${best.last4} for ₹${amount.toLocaleString(
        "en-IN",
      )} of ${categoryInput}. It has one of your stronger reward/interest profiles right now.`,
    );
  };

  const hasCards = cards.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Cards
              </div>
              <div className="mt-1 text-xl font-semibold">Cards and rewards</div>
            </div>
            <Button size="sm" variant="secondary" onClick={openNewCard}>
              Add card
            </Button>
          </div>
          {hasCards ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-cyan-500/15 p-4 text-sm border border-indigo-500/30 text-white">
                <div className="text-xs text-indigo-100/80">Available Credit</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{totalAvailable.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-amber-500/15 p-4 text-sm border border-rose-500/30 text-white">
                <div className="text-xs text-rose-100/80">Used (Debt)</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{totalBalance.toLocaleString("en-IN")}
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-rose-950/30">
                  <div
                    className="h-1.5 rounded-full bg-rose-400"
                    style={{ width: `${Math.min(100, utilization)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-green-500/15 p-4 text-sm border border-emerald-500/30 text-white">
                <div className="text-xs text-emerald-100/80">Total Limit</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{totalLimit.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 p-4 text-sm border border-fuchsia-500/30 text-white">
                <div className="text-xs text-fuchsia-100/80">Reward points</div>
                <div className="mt-1 text-lg font-semibold">
                  {totalPoints.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No cards added"
                description="Add your primary credit card to unlock rewards guidance."
                primaryActionLabel="Add card"
                onPrimaryAction={openNewCard}
              />
            </div>
          )}
          {!overwhelmMode && hasCards && (
            <div className="mt-6">
              <div className="text-xs text-zinc-400">
                Points and utilisation trend
              </div>
              <div className="mt-2 h-32 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 border border-indigo-500/20 px-3 py-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cardsTrendData}>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="util"
                      orientation="left"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="points"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        `${Math.round(
                          value as number,
                        ).toLocaleString("en-IN")}`
                      }
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderRadius: 8,
                        border: "1px solid rgba(129, 140, 248, 0.4)",
                      }}
                      formatter={(value: unknown, name: string) => {
                        if (typeof value !== "number") return value;
                        if (name === "utilization") {
                          return [`${value}%`, "Utilisation"];
                        }
                        return [
                          `${Math.round(value).toLocaleString("en-IN")}`,
                          "Points",
                        ];
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={24}
                      iconSize={8}
                      formatter={(value) =>
                        value === "utilization" ? "Utilisation %" : "Points"
                      }
                    />
                    <Area
                      yAxisId="util"
                      type="monotone"
                      dataKey="utilization"
                      stroke="#22c55e"
                      fill="url(#cardsUtilGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="points"
                      type="monotone"
                      dataKey="points"
                      stroke="#a855f7"
                      fill="url(#cardsPointsGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient
                        id="cardsUtilGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient
                        id="cardsPointsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
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
        <div className="grid grid-cols-1 gap-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {cards.map((c) => (
              <div
                key={c.id}
                role="button"
                onClick={() => openEditCard(c.id)}
                className="text-left cursor-pointer"
              >
                <Card className="bg-gradient-to-br from-indigo-500/80 via-purple-500/80 to-fuchsia-500/80 text-white shadow-xl shadow-fuchsia-500/30 transition-transform hover:-translate-y-1">
                  <CardContent>
                    <div className="flex items-center justify-between text-xs">
                      <div className="uppercase tracking-wide opacity-80">
                        {c.brand.toUpperCase()}
                      </div>
                      {c.nextBillDate && (
                        <div className="opacity-80">
                          Bill{" "}
                          {new Date(c.nextBillDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 text-2xl tracking-widest">
                      •••• •••• •••• {c.last4}
                    </div>
                    <div className="mt-4 grid grid-cols-2 text-sm">
                        <div>Limit</div>
                        <div className="text-right">
                          ₹{(c.limit || 0).toLocaleString("en-IN")}
                        </div>
                        <div>Balance</div>
                        <div className="text-right">
                          ₹{(c.balance || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            {!hasCards && (
              <Card>
                <CardContent>
                  <EmptyState
                    title="Cards will appear here"
                    description="Add a card to see utilisation and reward guidance."
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {!overwhelmMode && (
            <Card>
              <CardContent>
                <div className="text-sm font-medium">Rewards redemption</div>
                <div className="mt-2 text-xs text-zinc-500">
                  Light suggestions on how to turn points into calm value.
                </div>
                <div className="mt-3 grid gap-2 text-xs">
                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                      <div>Statement credit</div>
                      <div className="text-emerald-600">Value score 8/10</div>
                    </div>
                    <div className="mt-1 text-zinc-500">
                      Simple, flexible, and easy to understand. Great default if you are unsure.
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                      <div>Travel rewards</div>
                      <div className="text-amber-600">Value score 9/10</div>
                    </div>
                    <div className="mt-1 text-zinc-500">
                      Best when you plan calmly in advance and can be flexible with dates.
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                      <div>Gift cards / catalog</div>
                      <div className="text-zinc-500">Value score 6/10</div>
                    </div>
                    <div className="mt-1 text-zinc-500">
                      Convenient, but often slightly worse value. Still fine for low-stakes treats.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent>
              <div className="text-sm font-medium">Best card for spend</div>
              <div className="mt-2 text-xs text-zinc-500">
                A calm helper to choose a card for a specific purchase.
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <Input
                  placeholder="Amount"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
                <Select
                  value={categoryInput}
                  onChange={(v) => setCategoryInput(v)}
                >
                  <option value="groceries">Groceries</option>
                  <option value="travel">Travel</option>
                  <option value="online">Online shopping</option>
                  <option value="fuel">Fuel</option>
                  <option value="other">Other</option>
                </Select>
                <Button className="w-full" onClick={runBestCardTool}>
                  Get suggestion
                </Button>
                {recommendation && (
                  <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900">
                    {recommendation}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm font-medium">Card detail</div>
              {!selectedCard ? (
                <div className="mt-3">
                  <EmptyState
                    title="No card selected"
                    description="Tap a card above to see simple earn and fee insights."
                  />
                </div>
              ) : (
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Focus card
                    </div>
                    <div className="mt-1 text-base font-medium">
                      {selectedCard.brand.toUpperCase()} •••• {selectedCard.last4}
                    </div>
                    {selectedCard.rewardProgram && (
                      <div className="mt-1 text-xs text-zinc-500">
                        {selectedCard.rewardProgram}
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                    <div className="font-medium">Credit Status</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[10px] uppercase text-zinc-500">Available</div>
                        <div className="font-semibold text-emerald-600">
                          ₹{(selectedCard.limit - selectedCard.balance).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-500">Used</div>
                        <div className="font-semibold text-rose-600">
                          ₹{selectedCard.balance.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-zinc-400">
                      Limit: ₹{selectedCard.limit.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                    <div className="font-medium">Earn rates (placeholder)</div>
                    <div className="mt-1 text-zinc-500">
                      Groceries / essentials: 2x points · Online spends: 1.5x ·
                      Other: 1x. Adjust in the future to match your real card.
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                    <div className="font-medium">Fee vs benefit</div>
                    <div className="mt-1 text-zinc-500">
                      Annual fee{" "}
                      {selectedCard.annualFee
                        ? `₹${selectedCard.annualFee.toLocaleString("en-IN")}`
                        : "not set"}{" "}
                      vs points and perks you actually use. If this card does not
                      feel cosy, it is okay to downshift later.
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                    <div className="font-medium">Close or keep?</div>
                    <div className="mt-1 text-zinc-500">
                      Heavy annual fee with low usage and high utilisation is a
                      clue to slowly step away. Old, no-fee cards gently help
                      your credit history when managed well.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet
        open={cardSheetOpen}
        onOpenChange={setCardSheetOpen}
        title={editingCardId ? "Edit card" : "Add card"}
      >
        <div className="space-y-3 text-sm">
          <Select
            value={cardForm.brand}
            onChange={(v) =>
              setCardForm((f) => ({
                ...f,
                brand: v as CreditCardModel["brand"],
              }))
            }
          >
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="amex">American Express</option>
            <option value="discover">Discover</option>
            <option value="other">Other</option>
          </Select>
          <Input
            placeholder="Last 4 digits"
            maxLength={4}
            value={cardForm.last4}
            onChange={(e) =>
              setCardForm((f) => ({ ...f, last4: e.target.value.replace(/\D/g, "") }))
            }
          />
          <Input
            placeholder="Total Credit Limit"
            inputMode="decimal"
            value={cardForm.limit}
            onChange={(e) =>
              setCardForm((f) => ({ ...f, limit: e.target.value }))
            }
          />
          <Input
            placeholder="Current Used Balance (Debt)"
            inputMode="decimal"
            value={cardForm.balance}
            onChange={(e) =>
              setCardForm((f) => ({ ...f, balance: e.target.value }))
            }
          />
          <Input
            placeholder="APR % (optional)"
            inputMode="decimal"
            value={cardForm.apr}
            onChange={(e) => setCardForm((f) => ({ ...f, apr: e.target.value }))}
          />
          <Input
            placeholder="Points balance (optional)"
            inputMode="decimal"
            value={cardForm.pointsBalance}
            onChange={(e) =>
              setCardForm((f) => ({ ...f, pointsBalance: e.target.value }))
            }
          />
          <div className="space-y-1">
            <div className="text-xs text-zinc-500 px-1">Next statement date</div>
            <Input
              type="date"
              value={cardForm.nextBillDate}
              onChange={(e) =>
                setCardForm((f) => ({ ...f, nextBillDate: e.target.value }))
              }
            />
          </div>
          <Input
            placeholder="Annual fee (optional)"
            inputMode="decimal"
            value={cardForm.annualFee}
            onChange={(e) =>
              setCardForm((f) => ({ ...f, annualFee: e.target.value }))
            }
          />
          <Input
            placeholder="Reward program name (optional)"
            value={cardForm.rewardProgram}
            onChange={(e) =>
              setCardForm((f) => ({ ...f, rewardProgram: e.target.value }))
            }
          />
          <Button className="w-full" onClick={saveCard}>
            Save
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

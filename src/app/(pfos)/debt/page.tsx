"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAppStore } from "@/state/app-store";
import { useState } from "react";
import { toast } from "sonner";

export default function Debt() {
  const loans = useAppStore((s) => s.loans);
  const creditCards = useAppStore((s) => s.creditCards);
  const addLoan = useAppStore((s) => s.addLoan);
  const updateLoan = useAppStore((s) => s.updateLoan);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("snowball");
  const [loanSheetOpen, setLoanSheetOpen] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [loanForm, setLoanForm] = useState<{
    name: string;
    principal: string;
    balance: string;
    apr: string;
    monthlyPayment: string;
  }>({
    name: "",
    principal: "",
    balance: "",
    apr: "",
    monthlyPayment: "",
  });
  const [extraPayment, setExtraPayment] = useState(0);

  const cardDebts = creditCards
    .filter((c) => (c.billAmount || 0) > 0)
    .map((c) => ({
      id: c.id,
      name: `${c.brand.toUpperCase()} ${c.last4}`,
      balance: c.billAmount || 0,
      apr: c.apr || 0,
      monthlyPayment: c.billAmount || 0,
      type: "card" as const,
      dueDate: c.billDueDate,
    }));

  const allDebts = [
    ...loans.map((l) => ({ ...l, type: "loan" as const, dueDate: undefined })),
    ...cardDebts,
  ];

  const sortedDebts = [...allDebts].sort((a, b) => {
    if (strategy === "snowball") {
      return a.balance - b.balance;
    }
    return b.apr - a.apr;
  });

  const totalDebt = allDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalEmi = allDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const averageApr = allDebts.length
    ? allDebts.reduce((sum, d) => sum + d.apr, 0) / allDebts.length
    : 0;
  const interestBleed = totalDebt * (averageApr / 100) * (1 / 12);
  const yearsToDebtFree = totalEmi > 0 ? totalDebt / (totalEmi * 12) : 0;

  const openNewLoan = () => {
    setEditingLoanId(null);
    setLoanForm({
      name: "",
      principal: "",
      balance: "",
      apr: "",
      monthlyPayment: "",
    });
    setLoanSheetOpen(true);
  };

  const openEditLoan = (id: string) => {
    const loan = loans.find((l) => l.id === id);
    if (!loan) return;
    setEditingLoanId(id);
    setLoanForm({
      name: loan.name,
      principal: String(loan.principal),
      balance: String(loan.balance),
      apr: String(loan.apr),
      monthlyPayment: String(loan.monthlyPayment),
    });
    setLoanSheetOpen(true);
  };

  const saveLoan = () => {
    if (!loanForm.name.trim()) {
      toast.error("Loan name is required");
      return;
    }
    const principal = Number(loanForm.principal || 0);
    const balance = Number(loanForm.balance || 0);
    const apr = Number(loanForm.apr || 0);
    const monthlyPayment = Number(loanForm.monthlyPayment || 0);
    if ([principal, balance, apr, monthlyPayment].some((n) => Number.isNaN(n))) {
      toast.error("Amounts and rate must be numbers");
      return;
    }
    const loan = {
      id: editingLoanId ?? `loan-${Date.now()}`,
      name: loanForm.name,
      principal,
      balance,
      apr,
      monthlyPayment,
    };
    if (editingLoanId) {
      updateLoan(loan);
      toast.success("Loan updated");
    } else {
      addLoan(loan);
      toast.success("Loan added");
    }
    setLoanSheetOpen(false);
  };



  const hasLoans = loans.length > 0;

  const selectedLoan =
    loans.find((l) => l.id === selectedLoanId) ?? (loans.length ? loans[0] : undefined);

  const baselineMonths = selectedLoan
    ? Math.ceil(selectedLoan.balance / selectedLoan.monthlyPayment)
    : 0;
  const boostedMonths =
    selectedLoan && extraPayment > 0
      ? Math.ceil(selectedLoan.balance / (selectedLoan.monthlyPayment + extraPayment))
      : baselineMonths;
  const monthsSaved = baselineMonths && boostedMonths ? baselineMonths - boostedMonths : 0;
  const interestSaved =
    selectedLoan && monthsSaved > 0
      ? (selectedLoan.balance * (selectedLoan.apr / 100) * (monthsSaved / 12)) / 10
      : 0;

  const hasDebts = allDebts.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Debt</div>
              <div className="mt-1 text-xl font-semibold">Dashboard</div>
            </div>
            <Button size="sm" variant="secondary" onClick={openNewLoan}>
              Add loan
            </Button>
          </div>
          {hasDebts ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                <div className="text-xs text-zinc-500">Total debt</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{totalDebt.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                <div className="text-xs text-zinc-500">Monthly payments</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{totalEmi.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                <div className="text-xs text-zinc-500">Interest bleed (est.)</div>
                <div className="mt-1 text-lg font-semibold">
                  ₹{Math.round(interestBleed).toLocaleString("en-IN")}/month
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                <div className="text-xs text-zinc-500">Debt-free horizon</div>
                <div className="mt-1 text-lg font-semibold">
                  {yearsToDebtFree ? `~${yearsToDebtFree.toFixed(1)} years` : "Add payments"}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No debts"
                description="Add a loan or credit card bill to see your debt picture."
                primaryActionLabel="Add loan"
                onPrimaryAction={openNewLoan}
              />
            </div>
          )}
          {!overwhelmMode && hasDebts && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Debt trend (placeholder)</span>
                <span>Strategy: {strategy === "snowball" ? "Snowball" : "Avalanche"}</span>
              </div>
              <div className="mt-2 h-24 rounded-2xl bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800">
                <Skeleton className="h-full w-full rounded-2xl opacity-40" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium">Loans & Cards</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500">Strategy</span>
                <Select
                  value={strategy}
                  onChange={(v) => setStrategy(v as "snowball" | "avalanche")}
                >
                  <option value="snowball">Snowball (smallest first)</option>
                  <option value="avalanche">Avalanche (highest rate first)</option>
                </Select>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              {!hasDebts && (
                <EmptyState
                  title="No debts listed"
                  description="You can add your loans here. Card bills appear from Cards page."
                />
              )}
              {sortedDebts.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  disabled={d.type === "card"}
                  onClick={() => {
                    if (d.type === "loan") {
                      setSelectedLoanId(d.id);
                      openEditLoan(d.id);
                    }
                  }}
                  className={`flex items-center justify-between rounded-xl p-3 text-left text-sm ${
                    d.type === "card"
                      ? "bg-indigo-50/50 dark:bg-indigo-900/10 cursor-default"
                      : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {d.name}
                      {d.type === "card" && (
                        <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          Card Bill
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      Balance ₹{d.balance.toLocaleString("en-IN")} · APR {d.apr}%
                      {d.dueDate && ` · Due ${new Date(d.dueDate).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">
                      {d.type === "card" ? "Bill Amount" : "EMI"}
                    </div>
                    <div className="text-sm font-semibold">
                      ₹{d.monthlyPayment.toLocaleString("en-IN")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {!overwhelmMode && (
          <Card>
            <CardContent>
              <div className="text-sm font-medium">Debt plan</div>
              <div className="mt-2 text-xs text-zinc-500">
                We order your debts using the selected strategy and mark gentle milestones.
              </div>
              <div className="mt-3 grid gap-2">
                {sortedDebts.map((d, idx) => (
                  <div
                    key={d.id}
                    className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{d.name}</div>
                      <div className="text-zinc-500">Step {idx + 1}</div>
                    </div>
                    <div className="mt-1 text-zinc-500">
                      {d.type === "card"
                        ? "Pay this bill in full to avoid interest."
                        : "Milestone: clear this loan before moving heavy focus to the next one."}
                    </div>
                  </div>
                ))}
                {!hasDebts && (
                  <div className="text-xs text-zinc-500">
                    Once you add debts, you will see a simple payoff order here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!overwhelmMode && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardContent>
              <div className="text-sm font-medium">Loan detail and prepay simulator</div>
              {!selectedLoan ? (
                <div className="mt-3">
                  <EmptyState
                    title="No loan selected"
                    description="Choose a loan from the list to see a gentle prepay plan."
                  />
                </div>
              ) : (
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Focus loan
                    </div>
                    <div className="mt-1 text-base font-medium">{selectedLoan.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Balance ₹{selectedLoan.balance.toLocaleString("en-IN")} · APR{" "}
                      {selectedLoan.apr}% · EMI ₹
                      {selectedLoan.monthlyPayment.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Extra prepayment per month</span>
                      <span>₹{extraPayment.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(5000, selectedLoan.monthlyPayment * 2)}
                      step={500}
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(Number(e.target.value))}
                      className="mt-2 w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                      <div className="text-zinc-500">Timeline change</div>
                      <div className="mt-1 text-sm font-semibold">
                        {monthsSaved > 0
                          ? `${monthsSaved} months sooner (placeholder estimate)`
                          : "Adjust slider to preview"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                      <div className="text-zinc-500">Interest avoided</div>
                      <div className="mt-1 text-sm font-semibold">
                        {interestSaved > 0
                          ? `~₹${Math.round(interestSaved).toLocaleString("en-IN")}`
                          : "Will appear once slider moves"}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    These are calm, high-level estimates to nudge action, not precise forecasts.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-sm font-medium">If I do nothing</div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Keeping things exactly as they are means your current EMIs and interest continue
                quietly in the background.
              </div>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                  <div className="text-zinc-500">Projected interest over 12 months</div>
                  <div className="mt-1 text-sm font-semibold">
                    {hasLoans
                      ? `~₹${Math.round(interestBleed * 12).toLocaleString("en-IN")}`
                      : "Add loans to see this"}
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                  <div className="text-zinc-500">Emotional load</div>
                  <div className="mt-1 text-sm">
                    Even small, predictable EMIs can feel heavy over time. One gentle step this
                    month is enough.
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                  <div className="text-zinc-500">Next kind step</div>
                  <div className="mt-1 text-sm">
                    Pick one focus loan and round up its EMI slightly. This app will help you track
                    the quiet progress.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Sheet
        open={loanSheetOpen}
        onOpenChange={setLoanSheetOpen}
        title={editingLoanId ? "Edit loan" : "Add loan"}
      >
        <div className="space-y-3 text-sm">
          <Input
            placeholder="Name"
            value={loanForm.name}
            onChange={(e) => setLoanForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Original principal"
            inputMode="decimal"
            value={loanForm.principal}
            onChange={(e) => setLoanForm((f) => ({ ...f, principal: e.target.value }))}
          />
          <Input
            placeholder="Current balance"
            inputMode="decimal"
            value={loanForm.balance}
            onChange={(e) => setLoanForm((f) => ({ ...f, balance: e.target.value }))}
          />
          <Input
            placeholder="Rate %"
            inputMode="decimal"
            value={loanForm.apr}
            onChange={(e) => setLoanForm((f) => ({ ...f, apr: e.target.value }))}
          />
          <Input
            placeholder="Monthly EMI"
            inputMode="decimal"
            value={loanForm.monthlyPayment}
            onChange={(e) => setLoanForm((f) => ({ ...f, monthlyPayment: e.target.value }))}
          />
          <Button className="w-full" onClick={saveLoan}>
            Save
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

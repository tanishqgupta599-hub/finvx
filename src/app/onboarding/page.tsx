"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useAppStore } from "@/state/app-store";
import type { ProfileMode } from "@/domain/models";

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

type LoanDraft = {
  name: string;
  balance: string;
  apr: string;
  emi: string;
};

type Errors = Record<string, string>;

const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;
const employmentTypes = ["student", "salaried", "self-employed", "unemployed", "retired"] as const;

export default function Onboarding() {
  const router = useRouter();
  const enableDemoData = useAppStore((s) => s.enableDemoData);
  const disableDemoData = useAppStore((s) => s.disableDemoData);
  const seedDemoData = useAppStore((s) => s.seedDemoData);
  const clearData = useAppStore((s) => s.clearData);
  const setProfile = useAppStore((s) => s.setProfile);
  const setProfileMode = useAppStore((s) => s.setProfileMode);
  const markOnboardingCompleted = useAppStore((s) => s.markOnboardingCompleted);
  const addLoan = useAppStore((s) => s.addLoan);

  const [step, setStep] = useState<StepId>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ageRange, setAgeRange] = useState<(typeof ageRanges)[number] | "">("25-34");
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("INR");
  const [hasDependents, setHasDependents] = useState(false);
  const [employment, setEmployment] = useState<(typeof employmentTypes)[number] | "">("salaried");
  const [mode, setMode] = useState<ProfileMode>("Balanced");
  const [incomeRange, setIncomeRange] = useState("");
  const [fixedCostRange, setFixedCostRange] = useState("");
  const [loans, setLoans] = useState<LoanDraft[]>([
    { name: "", balance: "", apr: "", emi: "" },
  ]);
  const [insuranceHealth, setInsuranceHealth] = useState(false);
  const [insuranceTerm, setInsuranceTerm] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [demoEnabled, setDemoEnabled] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  const totalSteps: StepId = 6;

  const next = () => {
    const currentErrors = validate(step);
    if (Object.keys(currentErrors).length) {
      setErrors(currentErrors);
      return;
    }
    setErrors({});
    if (step < totalSteps) {
      setStep((s) => ((s + 1) as StepId));
    }
  };

  const prev = () => {
    setErrors({});
    if (step > 1) {
      setStep((s) => ((s - 1) as StepId));
    }
  };

  const finish = () => {
    const allErrors = validate(step);
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      return;
    }
    const profileId = "user_main";
    setProfile({
      id: profileId,
      name: name || "You",
      email: email || "you@example.com",
      avatarUrl: undefined,
      mode,
      ageRange: ageRange || undefined,
      country,
      currency,
      hasDependents,
      employment: employment || undefined,
      monthlyIncomeRange: incomeRange || undefined,
      monthlyFixedCostRange: fixedCostRange || undefined,
      insuranceHealth,
      insuranceTerm,
      emergencyContactName: emergencyName || undefined,
      emergencyContactPhone: emergencyPhone || undefined,
    });
    setProfileMode(mode);

    loans.forEach((loan, index) => {
      if (!loan.name && !loan.balance && !loan.apr && !loan.emi) return;
      if (!loan.name || !loan.balance) return;
      const balanceValue = Number(loan.balance);
      const aprValue = Number(loan.apr || 0);
      const emiValue = Number(loan.emi || 0);
      addLoan({
        id: `onb-loan-${index}`,
        name: loan.name,
        principal: balanceValue,
        balance: balanceValue,
        apr: aprValue,
        monthlyPayment: emiValue,
      });
    });

    if (demoEnabled) {
      enableDemoData();
      seedDemoData();
    } else {
      disableDemoData();
      clearData();
    }
    markOnboardingCompleted();
    router.push("/home");
  };

  const skip = () => {
    enableDemoData();
    seedDemoData();
    router.push("/home");
  };

  const validate = (currentStep: StepId): Errors => {
    const e: Errors = {};
    if (currentStep === 2) {
      if (!name.trim()) e.name = "Name is required.";
      if (!ageRange) e.ageRange = "Select an age range.";
      if (!employment) e.employment = "Select employment type.";
    }
    if (currentStep === 3) {
      if (!incomeRange) e.incomeRange = "Select an income range.";
      if (!fixedCostRange) e.fixedCostRange = "Select a fixed cost range.";
    }
    if (currentStep === 4) {
      loans.forEach((loan, index) => {
        const prefix = `loan-${index}`;
        if (loan.apr && isNaN(Number(loan.apr))) {
          e[`${prefix}-apr`] = "Rate must be a number.";
        }
        if (loan.emi && isNaN(Number(loan.emi))) {
          e[`${prefix}-emi`] = "EMI must be a number.";
        }
      });
    }
    if (currentStep === 5) {
      if (emergencyPhone && !/^[0-9+\-\s]{7,}$/.test(emergencyPhone)) {
        e.emergencyPhone = "Enter a valid phone number.";
      }
    }
    return e;
  };

  const progress = (step / totalSteps) * 100;

  const addLoanRow = () => {
    if (loans.length >= 3) return;
    setLoans((list) => [...list, { name: "", balance: "", apr: "", emi: "" }]);
  };

  const updateLoan = (index: number, patch: Partial<LoanDraft>) => {
    setLoans((list) => list.map((loan, i) => (i === index ? { ...loan, ...patch } : loan)));
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-black to-zinc-950 px-4 py-8">
      <Card className="w-full max-w-2xl border-zinc-800/70 bg-zinc-950/80 backdrop-blur">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Personal Financial OS</div>
              <div className="mt-1 text-lg font-semibold">Calm setup</div>
            </div>
            <button
              type="button"
              onClick={skip}
              className="text-xs text-zinc-500 underline-offset-2 hover:underline"
            >
              Skip for now
            </button>
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-1.5 rounded-full bg-zinc-100 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Step {step} of {totalSteps} • 3–5 minutes
          </div>
          <div className="mt-6 space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-2xl font-semibold tracking-tight">
                  A calm operating system for your money.
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  No bank connections, no judgments. Just a gentle cockpit for net worth, debt, and
                  safety, tuned to how much complexity you can handle today.
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-lg font-semibold">Profile basics</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Input
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && (
                      <div className="mt-1 text-xs text-red-500">{errors.name}</div>
                    )}
                  </div>
                  <Input
                    placeholder="Email (optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Select
                      value={ageRange}
                      onChange={(v) => setAgeRange(v as (typeof ageRanges)[number])}
                    >
                      <option value="">Age range</option>
                      {ageRanges.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </Select>
                    {errors.ageRange && (
                      <div className="mt-1 text-xs text-red-500">{errors.ageRange}</div>
                    )}
                  </div>
                  <Input
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <Input
                    placeholder="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-900 px-3 py-2 text-sm">
                    <span className="text-zinc-500">Dependents</span>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{hasDependents ? "Yes" : "No"}</span>
                      <Switch checked={hasDependents} onCheckedChange={setHasDependents} />
                    </div>
                  </div>
                  <div>
                    <Select
                      value={employment}
                      onChange={(v) => setEmployment(v as (typeof employmentTypes)[number])}
                    >
                      <option value="">Employment</option>
                      {employmentTypes.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </Select>
                    {errors.employment && (
                      <div className="mt-1 text-xs text-red-500">{errors.employment}</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-zinc-500">Preferred mode</div>
                  <div className="flex flex-wrap gap-2">
                    {["Growth", "Balanced", "Peace", "Senior"].map((m) => (
                      <Button
                        key={m}
                        type="button"
                        size="sm"
                        variant={mode === m ? "primary" : "secondary"}
                        onClick={() => setMode(m as ProfileMode)}
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-lg font-semibold">Monthly snapshot</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Select
                      value={incomeRange}
                      onChange={setIncomeRange}
                    >
                      <option value="">Monthly income</option>
                      <option value="&lt;50k">Below ₹50k</option>
                      <option value="50k-1L">₹50k–₹1L</option>
                      <option value="1L-2L">₹1L–₹2L</option>
                      <option value="2L+">Above ₹2L</option>
                    </Select>
                    {errors.incomeRange && (
                      <div className="mt-1 text-xs text-red-500">{errors.incomeRange}</div>
                    )}
                  </div>
                  <div>
                    <Select
                      value={fixedCostRange}
                      onChange={setFixedCostRange}
                    >
                      <option value="">Fixed costs</option>
                      <option value="&lt;25k">Below ₹25k</option>
                      <option value="25k-50k">₹25k–₹50k</option>
                      <option value="50k-1L">₹50k–₹1L</option>
                      <option value="1L+">Above ₹1L</option>
                    </Select>
                    {errors.fixedCostRange && (
                      <div className="mt-1 text-xs text-red-500">{errors.fixedCostRange}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  These ranges stay on your device and are used only for guidance text.
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Debt quick add</div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addLoanRow}
                    disabled={loans.length >= 3}
                  >
                    Add row
                  </Button>
                </div>
                <div className="space-y-3">
                  {loans.map((loan, index) => {
                    const prefix = `loan-${index}`;
                    return (
                      <div
                        key={index}
                        className="grid gap-2 rounded-2xl bg-zinc-900 p-3 text-sm"
                      >
                        <Input
                          placeholder="Loan or EMI name"
                          value={loan.name}
                          onChange={(e) => updateLoan(index, { name: e.target.value })}
                        />
                        <div className="grid gap-2 sm:grid-cols-3">
                          <Input
                            placeholder="Outstanding"
                            inputMode="decimal"
                            value={loan.balance}
                            onChange={(e) => updateLoan(index, { balance: e.target.value })}
                          />
                          <div>
                            <Input
                              placeholder="Rate %"
                              inputMode="decimal"
                              value={loan.apr}
                              onChange={(e) => updateLoan(index, { apr: e.target.value })}
                            />
                            {errors[`${prefix}-apr`] && (
                              <div className="mt-1 text-xs text-red-500">
                                {errors[`${prefix}-apr`]}
                              </div>
                            )}
                          </div>
                          <div>
                            <Input
                              placeholder="EMI"
                              inputMode="decimal"
                              value={loan.emi}
                              onChange={(e) => updateLoan(index, { emi: e.target.value })}
                            />
                            {errors[`${prefix}-emi`] && (
                              <div className="mt-1 text-xs text-red-500">
                                {errors[`${prefix}-emi`]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-zinc-500">
                  You can leave this blank if you prefer to add loans later.
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-4">
                <div className="text-lg font-semibold">Safety basics</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-900 px-3 py-2 text-sm">
                    <span className="text-zinc-500">Health insurance</span>
                    <Switch checked={insuranceHealth} onCheckedChange={setInsuranceHealth} />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-900 px-3 py-2 text-sm">
                    <span className="text-zinc-500">Term cover</span>
                    <Switch checked={insuranceTerm} onCheckedChange={setInsuranceTerm} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Emergency contact name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                  <div>
                    <Input
                      placeholder="Emergency contact phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                    />
                    {errors.emergencyPhone && (
                      <div className="mt-1 text-xs text-red-500">{errors.emergencyPhone}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  Finvx does not call anyone. This is just a reminder anchor for you.
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-4">
                <div className="text-lg font-semibold">Preview & demo data</div>
                <div className="rounded-2xl bg-zinc-900 p-3 text-sm">
                  <div className="font-medium">Use demo data</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Safe, high-quality dummy data lets you explore Finvx without connecting real
                    accounts. You can always clear it later from Settings.
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm">Enable demo data</span>
                    <Switch
                      checked={demoEnabled}
                      onCheckedChange={setDemoEnabled}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={step === 1}
            >
              Back
            </Button>
            <div className="flex gap-2">
              {step < totalSteps && (
                <Button type="button" size="sm" onClick={next}>
                  Next
                </Button>
              )}
              {step === totalSteps && (
                <Button type="button" size="sm" onClick={finish}>
                  Finish and go to home
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

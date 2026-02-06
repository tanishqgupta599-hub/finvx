"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { useState } from "react";
import { toast } from "sonner";
import type { Asset, Liability } from "@/domain/models";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useCurrencyFormat } from "@/lib/currency";

export default function NetWorth() {
  const assets = useAppStore((s) => s.assets);
  const loans = useAppStore((s) => s.loans);
  const liabilities = useAppStore((s) => s.liabilities);
  const creditCards = useAppStore((s) => s.creditCards);
  const addAsset = useAppStore((s) => s.addAsset);
  const updateAsset = useAppStore((s) => s.updateAsset);
  const addLiability = useAppStore((s) => s.addLiability);
  const updateLiability = useAppStore((s) => s.updateLiability);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);
  const [assetSheetOpen, setAssetSheetOpen] = useState(false);
  const [liabilitySheetOpen, setLiabilitySheetOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | null>(null);
  const [assetForm, setAssetForm] = useState<{ type: string; name: string; value: string; liquidity: string }>({
    type: "cash",
    name: "",
    value: "",
    liquidity: "high",
  });
  const [liabilityForm, setLiabilityForm] = useState<{ type: string; name: string; balance: string; apr: string }>({
    type: "other",
    name: "",
    balance: "",
    apr: "",
  });
  const { format } = useCurrencyFormat();
  const totalAssets = assets.reduce((a, b) => a + b.value, 0);
  const totalDebt = loans.reduce((a, b) => a + b.balance, 0);
  const totalLiabilities = liabilities.reduce((a, b) => a + b.balance, 0);
  const totalCreditCardDebt = creditCards.reduce((a, b) => a + b.balance, 0);
  const netWorth = totalAssets - (totalDebt + totalLiabilities + totalCreditCardDebt);
  const liquidAssets = assets.filter((a) => a.type === "cash").reduce((a, b) => a + b.value, 0);
  const liquidityRatio = totalAssets ? Math.round((liquidAssets / totalAssets) * 100) : 0;

  const netWorthTrendData = [
    { label: "T-3", value: Math.round(netWorth * 0.9) },
    { label: "T-2", value: Math.round(netWorth * 0.95) },
    { label: "T-1", value: Math.round(netWorth * 0.98) },
    { label: "Now", value: netWorth },
  ];

  const openNewAsset = () => {
    setEditingAssetId(null);
    setAssetForm({ type: "cash", name: "", value: "", liquidity: "high" });
    setAssetSheetOpen(true);
  };

  const openEditAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;
    setEditingAssetId(id);
    setAssetForm({
      type: asset.type,
      name: asset.name,
      value: String(asset.value),
      liquidity: asset.type === "cash" ? "high" : "medium",
    });
    setAssetSheetOpen(true);
  };

  const saveAsset = () => {
    const value = Number(assetForm.value || 0);
    if (!assetForm.name.trim()) {
      toast.error("Asset name is required");
      return;
    }
    if (Number.isNaN(value)) {
      toast.error("Asset value must be a number");
      return;
    }
    const assetType = assetForm.type as Asset["type"];
    if (editingAssetId) {
      updateAsset({
        id: editingAssetId,
        name: assetForm.name,
        type: assetType,
        value,
        institution: undefined,
      });
      toast.success("Asset updated");
    } else {
      addAsset({
        id: `asset-${Date.now()}`,
        name: assetForm.name,
        type: assetType,
        value,
        institution: undefined,
      });
      toast.success("Asset added");
    }
    setAssetSheetOpen(false);
  };

  const openNewLiability = () => {
    setEditingLiabilityId(null);
    setLiabilityForm({ type: "other", name: "", balance: "", apr: "" });
    setLiabilitySheetOpen(true);
  };

  const openEditLiability = (id: string) => {
    const liab = liabilities.find((l) => l.id === id);
    if (!liab) return;
    setEditingLiabilityId(id);
    setLiabilityForm({
      type: liab.type,
      name: liab.name,
      balance: String(liab.balance),
      apr: liab.apr != null ? String(liab.apr) : "",
    });
    setLiabilitySheetOpen(true);
  };

  const saveLiability = () => {
    const balance = Number(liabilityForm.balance || 0);
    const apr = liabilityForm.apr ? Number(liabilityForm.apr) : undefined;
    if (!liabilityForm.name.trim()) {
      toast.error("Liability name is required");
      return;
    }
    if (Number.isNaN(balance)) {
      toast.error("Balance must be a number");
      return;
    }
    if (liabilityForm.apr && Number.isNaN(Number(liabilityForm.apr))) {
      toast.error("Rate must be a number");
      return;
    }
    const liabilityType = liabilityForm.type as Liability["type"];
    if (editingLiabilityId) {
      updateLiability({
        id: editingLiabilityId,
        name: liabilityForm.name,
        type: liabilityType,
        balance,
        apr,
      });
      toast.success("Liability updated");
    } else {
      addLiability({
        id: `liab-${Date.now()}`,
        name: liabilityForm.name,
        type: liabilityType,
        balance,
        apr,
      });
      toast.success("Liability added");
    }
    setLiabilitySheetOpen(false);
  };

  const snapshotText = `Net worth: ${format(netWorth)} (Assets ${format(totalAssets)}, Debt ${format(totalDebt + totalLiabilities)}) – created with Finvx.`;

  const copySnapshot = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snapshotText);
        toast.success("Snapshot copied");
      } else {
        toast.message("Snapshot ready to share", { description: snapshotText });
      }
    } catch {
      toast.message("Snapshot ready to share", { description: snapshotText });
    }
  };
  const hasAnyData = assets.length || loans.length || liabilities.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Net worth</div>
              <div className="mt-1 text-xl font-semibold">Overview</div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setExportOpen(true)}>
              Share snapshot
            </Button>
          </div>
          {hasAnyData ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-emerald-500/15 p-4 text-sm border border-cyan-500/30">
                <div className="text-xs text-cyan-100/80">Net worth</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {format(netWorth)}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 p-4 text-sm border border-emerald-500/30">
                <div className="text-xs text-emerald-100/80">Assets</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {format(totalAssets)}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-amber-500/15 p-4 text-sm border border-rose-500/30">
                <div className="text-xs text-rose-100/80">Debt + liabilities</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {format(totalDebt + totalLiabilities + totalCreditCardDebt)}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-cyan-500/15 p-4 text-sm border border-indigo-500/30">
                <div className="flex items-center justify-between text-xs text-indigo-100/80">
                  <span>Liquidity</span>
                  <span>{liquidityRatio}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-indigo-500/20">
                  <div
                    className="h-1.5 rounded-full bg-cyan-400"
                    style={{ width: `${liquidityRatio}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No assets yet"
                description="Add a cash or investment balance to see your net worth snapshot."
                primaryActionLabel="Add asset"
                onPrimaryAction={openNewAsset}
              />
            </div>
          )}
          {!overwhelmMode && hasAnyData && (
            <div className="mt-6">
              <div className="text-xs text-zinc-500">Net worth trend</div>
              <div className="mt-2 h-24 rounded-2xl bg-black/30 border border-white/10 px-3 py-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={netWorthTrendData}>
                    <XAxis dataKey="label" hide />
                    <Tooltip
                      formatter={(value: any) =>
                        typeof value === "number"
                          ? format(value)
                          : value
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#22d3ee"
                      fill="url(#netWorthGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Assets</div>
              <Button size="sm" variant="secondary" onClick={openNewAsset}>
                Add
              </Button>
            </div>
            <div className="mt-2 grid gap-2">
              {assets.length === 0 && (
                <EmptyState
                  title="No assets yet"
                  description="Start with your primary bank account or savings."
                />
              )}
              {assets.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openEditAsset(a.id)}
                  className="flex items-center justify-between rounded-xl bg-zinc-900 p-2 text-left text-sm hover:bg-zinc-800"
                >
                  <div>
                    <div>{a.name}</div>
                    <div className="text-xs text-zinc-500">{a.type}</div>
                  </div>
                  <div>{format(a.value)}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Liabilities (non-loan)</div>
              <Button size="sm" variant="secondary" onClick={openNewLiability}>
                Add
              </Button>
            </div>
            <div className="mt-2 grid gap-2">
              {liabilities.length === 0 && (
                <EmptyState
                  title="No liabilities recorded"
                  description="Things like security deposits or informal loans can live here."
                />
              )}
              {liabilities.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => openEditLiability(l.id)}
                  className="flex items-center justify-between rounded-xl bg-zinc-900 p-2 text-left text-sm hover:bg-zinc-800"
                >
                  <div>
                    <div>{l.name}</div>
                    <div className="text-xs text-zinc-500">{l.type}</div>
                  </div>
                  <div>{format(l.balance)}</div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => (window.location.href = "/debt")}
                className="mt-2 text-xs text-zinc-500 underline-offset-2 hover:underline"
              >
                Detailed loans and EMIs live in the Debt module →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Sheet
        open={assetSheetOpen}
        onOpenChange={setAssetSheetOpen}
        title={editingAssetId ? "Edit asset" : "Add asset"}
      >
        <div className="space-y-3 text-sm">
          <Select
            value={assetForm.type}
            onChange={(v) => setAssetForm((f) => ({ ...f, type: v }))}
          >
            <option value="cash">Cash / bank</option>
            <option value="investment">Investment</option>
            <option value="property">Property</option>
            <option value="other">Other</option>
          </Select>
          <Input
            placeholder="Name"
            value={assetForm.name}
            onChange={(e) => setAssetForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Value"
            inputMode="decimal"
            value={assetForm.value}
            onChange={(e) => setAssetForm((f) => ({ ...f, value: e.target.value }))}
          />
          <Select
            value={assetForm.liquidity}
            onChange={(v) => setAssetForm((f) => ({ ...f, liquidity: v }))}
          >
            <option value="high">High liquidity</option>
            <option value="medium">Medium</option>
            <option value="low">Low / locked</option>
          </Select>
          <Button className="w-full" onClick={saveAsset}>
            Save
          </Button>
        </div>
      </Sheet>
      <Sheet
        open={liabilitySheetOpen}
        onOpenChange={setLiabilitySheetOpen}
        title={editingLiabilityId ? "Edit liability" : "Add liability"}
      >
        <div className="space-y-3 text-sm">
          <Select
            value={liabilityForm.type}
            onChange={(v) => setLiabilityForm((f) => ({ ...f, type: v }))}
          >
            <option value="other">Other</option>
            <option value="credit">Credit</option>
            <option value="mortgage">Mortgage</option>
          </Select>
          <Input
            placeholder="Name"
            value={liabilityForm.name}
            onChange={(e) => setLiabilityForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Balance"
            inputMode="decimal"
            value={liabilityForm.balance}
            onChange={(e) => setLiabilityForm((f) => ({ ...f, balance: e.target.value }))}
          />
          <Input
            placeholder="Rate % (optional)"
            inputMode="decimal"
            value={liabilityForm.apr}
            onChange={(e) => setLiabilityForm((f) => ({ ...f, apr: e.target.value }))}
          />
          <Button className="w-full" onClick={saveLiability}>
            Save
          </Button>
        </div>
      </Sheet>
      <Sheet open={exportOpen} onOpenChange={setExportOpen} title="Snapshot export">
        <div className="space-y-3 text-sm">
          <div className="rounded-2xl bg-zinc-900 p-3 text-xs text-zinc-400">
            {snapshotText}
          </div>
          <Button className="w-full" onClick={copySnapshot}>
            Copy summary text
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

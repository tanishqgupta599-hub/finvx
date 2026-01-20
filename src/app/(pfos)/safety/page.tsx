"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAppStore } from "@/state/app-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { InsurancePolicy, EmergencyContact, VaultDocument } from "@/domain/models";

export default function Safety() {
  const policies = useAppStore((s) => s.insurancePolicies);
  const addPolicy = useAppStore((s) => s.addInsurancePolicy);
  const updatePolicy = useAppStore((s) => s.updateInsurancePolicy);
  const contacts = useAppStore((s) => s.emergencyContacts);
  const addContact = useAppStore((s) => s.addEmergencyContact);
  const vaultDocs = useAppStore((s) => s.vaultDocuments);
  const addVaultDoc = useAppStore((s) => s.addVaultDocument);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);

  const [policySheetOpen, setPolicySheetOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState<{
    type: InsurancePolicy["type"];
    provider: string;
    premium: string;
    coverageAmount: string;
    renewalDate: string;
  }>({
    type: "health",
    provider: "",
    premium: "",
    coverageAmount: "",
    renewalDate: "",
  });

  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [contactForm, setContactForm] = useState<{
    name: string;
    phone: string;
    relationship: string;
  }>({
    name: "",
    phone: "",
    relationship: "",
  });

  const [vaultSheetOpen, setVaultSheetOpen] = useState(false);
  const [vaultForm, setVaultForm] = useState<{
    name: string;
    category: string;
    tags: string;
  }>({
    name: "",
    category: "",
    tags: "",
  });
  const [vaultSearch, setVaultSearch] = useState("");

  const totalCoverage = policies.reduce(
    (sum, p) => sum + (p.coverageAmount ?? 0),
    0,
  );
  const healthCoverage = policies
    .filter((p) => p.type === "health")
    .reduce((sum, p) => sum + (p.coverageAmount ?? 0), 0);

  const lifeCoverage = policies
    .filter((p) => p.type === "life")
    .reduce((sum, p) => sum + (p.coverageAmount ?? 0), 0);

  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);
  const hasHealth = policies.some((p) => p.type === "health");
  const hasLife = policies.some((p) => p.type === "life");
  const safetyScore = useMemo(() => {
    let score = 40;
    if (hasHealth) score += 15;
    if (hasLife) score += 15;
    if (contacts.length > 0) score += 10;
    if (vaultDocs.length > 0) score += 10;
    if (totalCoverage > 0) score += 10;
    return Math.min(100, score);
  }, [hasHealth, hasLife, contacts.length, vaultDocs.length, totalCoverage]);

  const openNewPolicy = () => {
    setEditingPolicyId(null);
    setPolicyForm({
      type: "health",
      provider: "",
      premium: "",
      coverageAmount: "",
      renewalDate: "",
    });
    setPolicySheetOpen(true);
  };

  const openEditPolicy = (id: string) => {
    const p = policies.find((pol) => pol.id === id);
    if (!p) return;
    setEditingPolicyId(id);
    setPolicyForm({
      type: p.type,
      provider: p.provider,
      premium: String(p.premium),
      coverageAmount: p.coverageAmount != null ? String(p.coverageAmount) : "",
      renewalDate: p.renewalDate ? p.renewalDate.slice(0, 10) : "",
    });
    setPolicySheetOpen(true);
  };

  const savePolicy = () => {
    if (!policyForm.provider.trim()) {
      toast.error("Provider is required");
      return;
    }
    const premium = Number(policyForm.premium || 0);
    const coverageAmount = policyForm.coverageAmount
      ? Number(policyForm.coverageAmount)
      : undefined;
    if (Number.isNaN(premium) || premium <= 0) {
      toast.error("Premium must be a positive number");
      return;
    }
    if (
      coverageAmount != null &&
      (Number.isNaN(coverageAmount) || coverageAmount <= 0)
    ) {
      toast.error("Coverage must be a positive number");
      return;
    }
    const policy: InsurancePolicy = {
      id: editingPolicyId ?? `policy-${Date.now()}`,
      type: policyForm.type,
      provider: policyForm.provider,
      premium,
      coverageAmount,
      renewalDate: policyForm.renewalDate || undefined,
    };
    if (editingPolicyId) {
      updatePolicy(policy);
      toast.success("Policy updated");
    } else {
      addPolicy(policy);
      toast.success("Policy added");
    }
    setPolicySheetOpen(false);
  };

  const openNewContact = () => {
    setContactForm({
      name: "",
      phone: "",
      relationship: "",
    });
    setContactSheetOpen(true);
  };

  const saveContact = () => {
    if (!contactForm.name.trim()) {
      toast.error("Contact name is required");
      return;
    }
    if (!contactForm.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    const contact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: contactForm.name,
      phone: contactForm.phone,
      relationship: contactForm.relationship || undefined,
    };
    addContact(contact);
    toast.success("Contact added");
    setContactSheetOpen(false);
  };

  const openNewVaultDoc = () => {
    setVaultForm({
      name: "",
      category: "",
      tags: "",
    });
    setVaultSheetOpen(true);
  };

  const saveVaultDoc = () => {
    if (!vaultForm.name.trim()) {
      toast.error("Document name is required");
      return;
    }
    const tags = vaultForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const doc: VaultDocument = {
      id: `doc-${Date.now()}`,
      name: vaultForm.name,
      category: vaultForm.category || "General",
      tags,
    };
    addVaultDoc(doc);
    toast.success("Document added stub");
    setVaultSheetOpen(false);
  };

  const filteredVaultDocs = vaultDocs.filter((d) => {
    if (!vaultSearch.trim()) return true;
    const q = vaultSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const hasPolicies = policies.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Safety
              </div>
              <div className="mt-1 text-xl font-semibold">Safety dashboard</div>
            </div>
            <Button size="sm" variant="secondary" onClick={openNewPolicy}>
              Add policy
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-sky-500/15 p-4 text-sm border border-emerald-500/30">
              <div className="text-xs text-emerald-100/80">Safety score</div>
              <div className="mt-1 text-lg font-semibold text-white">{safetyScore}/100</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-emerald-500/15 p-4 text-sm border border-cyan-500/30">
              <div className="text-xs text-cyan-100/80">Coverage (approx.)</div>
              <div className="mt-1 text-lg font-semibold text-white">
                ₹{totalCoverage.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 p-4 text-sm border border-amber-500/30">
              <div className="text-xs text-amber-100/80">Premiums per month</div>
              <div className="mt-1 text-lg font-semibold text-white">
                ₹{totalPremium.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-cyan-500/15 p-4 text-sm border border-indigo-500/30">
              <div className="text-xs text-indigo-100/80">Emergency contacts</div>
              <div className="mt-1 text-lg font-semibold text-white">{contacts.length}</div>
            </div>
          </div>
          {!overwhelmMode && (
            <div className="mt-6">
              <div className="text-xs text-zinc-500">Checklist (frontend only)</div>
              <div className="mt-2 h-20 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800">
                <Skeleton className="h-full w-full rounded-2xl opacity-40" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Policies</div>
              <Button size="sm" variant="ghost" onClick={openNewPolicy}>
                Add
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {policies.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openEditPolicy(p.id)}
                  className="text-left"
                >
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {p.type.toUpperCase()}
                        </div>
                        <div className="text-xs text-zinc-500">{p.provider}</div>
                      </div>
                      <div className="mt-2 text-lg font-semibold">
                        ₹{p.premium.toLocaleString("en-IN")}/mo
                      </div>
                      {p.coverageAmount && (
                        <div className="mt-1 text-xs text-zinc-500">
                          Coverage ₹{p.coverageAmount.toLocaleString("en-IN")}
                        </div>
                      )}
                      {p.renewalDate && (
                        <div className="mt-1 text-xs text-zinc-500">
                          Renewal{" "}
                          {new Date(p.renewalDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </button>
              ))}
              {!hasPolicies && (
                <div className="md:col-span-2">
                  <EmptyState
                    title="No safety cover captured"
                    description="Health and term cover are often the foundation of this module."
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!overwhelmMode && (
          <Card>
            <CardContent>
              <div className="text-sm font-medium">Medical readiness checklist</div>
              <div className="mt-2 text-xs text-zinc-500">
                A light, human checklist for when life throws a health curveball.
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="rounded-xl bg-zinc-900 p-3">
                  Insurance card, ID proofs, and hospital preferences are easy to find.
                </div>
                <div className="rounded-xl bg-zinc-900 p-3">
                  Emergency contact knows which policy, TPA, and network hospital to use.
                </div>
                <div className="rounded-xl bg-zinc-900 p-3">
                  Basic medical history is written somewhere that loved ones can access.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!overwhelmMode && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/15 via-emerald-600/10 to-cyan-500/10 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <CardContent className="relative">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                Legacy calm
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                If something happens to me
              </div>
              <div className="mt-2 text-xs text-emerald-100/80">
                This space is meant to give you and your people a sense of calm, not fear.
                We gently show how covered things feel today.
              </div>
              <div className="mt-4 grid gap-3 text-xs text-emerald-50/90">
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-200/80">
                    Legacy safety pool
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">
                    ₹{lifeCoverage.toLocaleString("en-IN")} in life cover
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-100/80">
                    Plus your assets net of debt as captured in other modules.
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-cyan-200/80">
                    Hospitalization Shield
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">
                    ₹{healthCoverage.toLocaleString("en-IN")} bill coverage
                  </div>
                  <div className="mt-1 text-[11px] text-cyan-100/80">
                    Direct cashless or reimbursement for hospital stays.
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-200/80">
                    Household runway reflection
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-50/90">
                    Imagine your people running the household for 12–24 months. Would this feel
                    like a soft landing? If not, we simply mark the gap and work towards it over
                    time.
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-200/80">
                    One kind action this week
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-50/90">
                    Tell a trusted person where this app, your policies, and key documents live,
                    and how to reach your advisor or insurer.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  Emergency contacts and trusted access
                </div>
                <Button size="sm" variant="secondary" onClick={openNewContact}>
                  Add contact
                </Button>
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl bg-zinc-900 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.name}</div>
                      {c.relationship && (
                        <div className="text-zinc-500">{c.relationship}</div>
                      )}
                    </div>
                    <div className="mt-1 text-zinc-500">{c.phone}</div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <EmptyState
                    title="No trusted contacts set"
                    description="Add one or two people you would want to be contacted in an emergency."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Document vault</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Input
                placeholder="Search"
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
              />
              <Button size="sm" variant="secondary" onClick={openNewVaultDoc}>
                Add document stub
              </Button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 text-xs">
            {filteredVaultDocs.map((d) => (
              <div
                key={d.id}
                className="rounded-xl bg-zinc-900 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-zinc-500">{d.category}</div>
                </div>
                {d.tags.length > 0 && (
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
                    {d.tags.join(" · ")}
                  </div>
                )}
                <div className="mt-2 text-[11px] text-zinc-500">
                  Upload is just a stub here. Store files in your secure system, and let this app
                  act as the calm index.
                </div>
              </div>
            ))}
            {filteredVaultDocs.length === 0 && (
              <div className="md:col-span-2">
                <EmptyState
                  title="No documents in the vault"
                  description="You can log policy PDFs, wills, ID copies and more as an index."
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={policySheetOpen}
        onOpenChange={setPolicySheetOpen}
        title={editingPolicyId ? "Edit policy" : "Add policy"}
      >
        <div className="space-y-3 text-sm">
          <Select
            value={policyForm.type}
            onChange={(v) =>
              setPolicyForm((f) => ({
                ...f,
                type: v as InsurancePolicy["type"],
              }))
            }
          >
            <option value="health">Health</option>
            <option value="life">Term / life</option>
            <option value="home">Home</option>
            <option value="auto">Auto</option>
            <option value="other">Other</option>
          </Select>
          <Input
            placeholder="Provider"
            value={policyForm.provider}
            onChange={(e) =>
              setPolicyForm((f) => ({ ...f, provider: e.target.value }))
            }
          />
          <Input
            placeholder="Premium per month"
            inputMode="decimal"
            value={policyForm.premium}
            onChange={(e) =>
              setPolicyForm((f) => ({ ...f, premium: e.target.value }))
            }
          />
          <Input
            placeholder="Coverage amount (optional)"
            inputMode="decimal"
            value={policyForm.coverageAmount}
            onChange={(e) =>
              setPolicyForm((f) => ({
                ...f,
                coverageAmount: e.target.value,
              }))
            }
          />
          <Input
            type="date"
            value={policyForm.renewalDate}
            onChange={(e) =>
              setPolicyForm((f) => ({ ...f, renewalDate: e.target.value }))
            }
          />
          <Button className="w-full" onClick={savePolicy}>
            Save
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={contactSheetOpen}
        onOpenChange={setContactSheetOpen}
        title="Add emergency contact"
      >
        <div className="space-y-3 text-sm">
          <Input
            placeholder="Name"
            value={contactForm.name}
            onChange={(e) =>
              setContactForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Input
            placeholder="Phone number"
            value={contactForm.phone}
            onChange={(e) =>
              setContactForm((f) => ({ ...f, phone: e.target.value }))
            }
          />
          <Input
            placeholder="Relationship (optional)"
            value={contactForm.relationship}
            onChange={(e) =>
              setContactForm((f) => ({
                ...f,
                relationship: e.target.value,
              }))
            }
          />
          <Button className="w-full" onClick={saveContact}>
            Save
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={vaultSheetOpen}
        onOpenChange={setVaultSheetOpen}
        title="Add document stub"
      >
        <div className="space-y-3 text-sm">
          <Input
            placeholder="Display name"
            value={vaultForm.name}
            onChange={(e) =>
              setVaultForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Input
            placeholder="Category (e.g. Policies, ID, Estate)"
            value={vaultForm.category}
            onChange={(e) =>
              setVaultForm((f) => ({ ...f, category: e.target.value }))
            }
          />
          <Input
            placeholder="Tags (comma separated)"
            value={vaultForm.tags}
            onChange={(e) =>
              setVaultForm((f) => ({ ...f, tags: e.target.value }))
            }
          />
          <div className="rounded-xl bg-zinc-900 p-3 text-xs text-zinc-500">
            File upload is intentionally a stub. Store documents in your own secure storage and
            treat this vault as the calm index for where things live.
          </div>
          <Button className="w-full" onClick={saveVaultDoc}>
            Save
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

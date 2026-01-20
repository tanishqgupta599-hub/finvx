 "use client";
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, MessageCircle, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Input } from "../ui/Input";
import { useAppStore } from "@/state/app-store";
import { toast } from "sonner";

type Command = {
  id: string;
  title: string;
  subtitle?: string;
  onSelect: () => void;
};

export function TopBar() {
  const profile = useAppStore((s) => s.profile);
  const featureFlags = useAppStore((s) => s.featureFlags);
  const transactions = useAppStore((s) => s.transactions);
  const creditCards = useAppStore((s) => s.creditCards);
  const policies = useAppStore((s) => s.insurancePolicies);
  const addFeedback = useAppStore((s) => s.addFeedback);

  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const q = query.toLowerCase().trim();

    const navItems: { id: string; title: string; href: string }[] = [
      featureFlags.home && { id: "nav-home", title: "Go to Home", href: "/home" },
      featureFlags.oracle && { id: "nav-oracle", title: "Ask Oracle AI", href: "/oracle" },
      featureFlags.spending && { id: "nav-spending", title: "Go to Spending", href: "/spending" },
      featureFlags.calendar && { id: "nav-calendar", title: "Go to Calendar", href: "/calendar" },
      featureFlags.cards && { id: "nav-cards", title: "Go to Cards", href: "/cards" },
      featureFlags.subscriptions && { id: "nav-subscriptions", title: "Go to Subscriptions", href: "/subscriptions" },
      featureFlags.expenses && { id: "nav-expenses", title: "Go to Expenses", href: "/expenses" },
      featureFlags.investments && { id: "nav-investments", title: "Go to Investments", href: "/investments" },
      featureFlags.netWorth && { id: "nav-net-worth", title: "Go to Net worth", href: "/net-worth" },
      featureFlags.debt && { id: "nav-debt", title: "Go to Debt", href: "/debt" },
      featureFlags.goals && { id: "nav-goals", title: "Go to Goals", href: "/goals" },
      featureFlags.circles && { id: "nav-circles", title: "Go to Circles", href: "/circles" },
      featureFlags.tax && { id: "nav-tax", title: "Go to Tax", href: "/tax" },
      featureFlags.safety && { id: "nav-safety", title: "Go to Safety", href: "/safety" },
      featureFlags.scam && { id: "nav-scam", title: "Go to Scam shield", href: "/scam" },
      featureFlags.reports && { id: "nav-reports", title: "Go to Reports", href: "/reports" },
      featureFlags.profile && { id: "nav-profile", title: "Go to Identity", href: "/profile" },
      featureFlags.settings && { id: "nav-settings", title: "Go to Settings", href: "/settings" },
    ].filter(Boolean) as { id: string; title: string; href: string }[];

    const navCommands: Command[] = navItems
      .filter((item) => !q || item.title.toLowerCase().includes(q) || item.href.toLowerCase().includes(q))
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.href,
        onSelect: () => router.push(item.href),
      }));

    if (!q) return navCommands;

    const txnMatches: Command[] = transactions
      .filter((t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || (t.account ?? "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({
        id: `txn-${t.id}`,
        title: t.description,
        subtitle: `Transaction · ₹${Math.abs(t.amount).toLocaleString("en-IN")} · ${new Date(t.date).toLocaleDateString()}`,
        onSelect: () => router.push("/spending"),
      }));

    const cardMatches: Command[] = creditCards
      .filter((c) => c.brand.toLowerCase().includes(q) || c.last4.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({
        id: `card-${c.id}`,
        title: `${c.brand} •••• ${c.last4}`,
        subtitle: "Card · tap to review rewards and usage",
        onSelect: () => router.push("/cards"),
      }));

    const policyMatches: Command[] = policies
      .filter((p) => p.provider.toLowerCase().includes(q) || p.type.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        id: `policy-${p.id}`,
        title: `${p.provider} · ${p.type}`,
        subtitle: "Policy · lives in Safety & insurance",
        onSelect: () => router.push("/safety"),
      }));

    return [...navCommands, ...txnMatches, ...cardMatches, ...policyMatches];
  }, [creditCards, featureFlags, policies, query, router, transactions]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 md:px-6">
        <div className="text-lg font-bold tracking-tight bg-gradient-to-br from-cyan-400 to-purple-600 bg-clip-text text-transparent">Finvx</div>
        <div className="ml-auto flex items-center gap-2">
          {/* Mobile Search Trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex md:hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 mr-1"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>

          <button
            type="button"
            aria-label="Open command palette"
            onClick={() => setOpen(true)}
            className="hidden md:block rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Share feedback"
            onClick={() => {
              setFeedbackOpen(true);
              setFeedbackError("");
            }}
            className="hidden rounded-full px-3 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <MessageCircle className="mr-1 h-4 w-4" />
            Feedback
          </button>
          <ThemeToggle />
          <Link href="/profile">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full px-2 py-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block text-sm">{profile?.name ?? "Profile"}</span>
            </button>
          </Link>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
          <Dialog.Content className="fixed left-1/2 top-20 z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/90 p-3 shadow-2xl shadow-cyan-500/10 outline-none backdrop-blur-xl">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-zinc-500" />
              <Input
                autoFocus
                placeholder="Jump to a module or search transactions, cards, policies…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-8 border-none bg-transparent px-0 text-base md:text-sm text-white placeholder:text-zinc-600 focus-visible:ring-0"
              />
              <span className="ml-auto hidden text-[10px] text-zinc-500 sm:inline-flex">Ctrl + K</span>
            </div>
            <div className="mt-3 max-h-72 overflow-y-auto rounded-xl bg-black/20 p-2 text-sm">
              {commands.length === 0 ? (
                <div className="px-2 py-3 text-xs text-zinc-500">
                  No matches yet. Try a module name, card brand, or policy provider.
                </div>
              ) : (
                <ul className="grid gap-1">
                  {commands.map((command) => (
                    <li key={command.id}>
                      <button
                        type="button"
                        onClick={() => {
                          command.onSelect();
                          setOpen(false);
                        }}
                        className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 text-zinc-300 hover:text-white"
                      >
                        <span className="font-medium text-cyan-400">{command.title}</span>
                        {command.subtitle && (
                          <span className="mt-0.5 text-xs text-zinc-500">{command.subtitle}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" />
          <Dialog.Content className="fixed left-1/2 top-24 z-50 w-full max-w-md -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-xl outline-none text-zinc-200">
            <div className="text-sm font-medium text-white">Send quick feedback</div>
            <div className="mt-1 text-xs text-zinc-500">
              This stays on your device only. It helps you note what feels helpful or confusing.
            </div>
            <textarea
              value={feedbackMessage}
              onChange={(event) => {
                setFeedbackMessage(event.target.value);
                if (feedbackError && event.target.value.trim()) setFeedbackError("");
              }}
              rows={4}
              className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-base md:text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-700"
              placeholder="Share a small note about what feels smooth, confusing, or missing."
            />
            {feedbackError && (
              <div className="mt-1 text-xs text-red-500">{feedbackError}</div>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackOpen(false);
                  setFeedbackMessage("");
                  setFeedbackError("");
                }}
                className="rounded-2xl px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = feedbackMessage.trim();
                  if (!trimmed) {
                    setFeedbackError("A short message helps make this useful.");
                    return;
                  }
                  addFeedback({
                    id: `fb-${Date.now()}`,
                    message: trimmed,
                    createdAt: new Date().toISOString(),
                    path: pathname ?? undefined,
                  });
                  toast.success("Feedback noted gently.");
                  setFeedbackMessage("");
                  setFeedbackError("");
                  setFeedbackOpen(false);
                }}
                className="inline-flex items-center rounded-2xl bg-zinc-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
              >
                Send
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}

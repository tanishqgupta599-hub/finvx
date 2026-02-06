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
import { NotificationCenter } from "@/components/widgets/NotificationCenter";
import { GlobalSearch } from "@/components/widgets/GlobalSearch";
import { HelpCenter } from "@/components/widgets/HelpCenter";
import { useCurrencyFormat } from "@/lib/currency";

// Check if Clerk is configured
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here';

// Safe UserButton component
function SafeUserButton() {
  const [UserButtonComponent, setUserButtonComponent] = useState<any>(null);

  useEffect(() => {
    if (!hasClerkKeys) return;

    import("@clerk/nextjs")
      .then((clerk) => {
        setUserButtonComponent(() => clerk.UserButton);
      })
      .catch(() => {
        // Clerk not available
      });
  }, []);

  if (UserButtonComponent) {
    return <UserButtonComponent afterSignOutUrl="/sign-in" />;
  }

  return (
    <Link
      href="/sign-in"
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
    >
      <User className="h-4 w-4" />
      <span>Sign In</span>
    </Link>
  );
}

type Command = {
  id: string;
  title: string;
  subtitle?: string;
  onSelect: () => void;
};

export function TopBar() {
  const featureFlags = useAppStore((s) => s.featureFlags);
  const transactions = useAppStore((s) => s.transactions);
  const creditCards = useAppStore((s) => s.creditCards);
  const policies = useAppStore((s) => s.insurancePolicies);
  const addFeedback = useAppStore((s) => s.addFeedback);

  const router = useRouter();
  const pathname = usePathname();
  const { format } = useCurrencyFormat();
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
        subtitle: `Transaction · ${format(Math.abs(t.amount))} · ${new Date(t.date).toLocaleDateString()}`,
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
        <Link 
          href="/home" 
          className="text-lg font-bold tracking-tight bg-gradient-to-br from-cyan-400 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Finvx
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <GlobalSearch />
          <NotificationCenter />
          <HelpCenter />
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
          <SafeUserButton />
        </div>
      </div>


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

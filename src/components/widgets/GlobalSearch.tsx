"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, CreditCard, TrendingUp, Wallet, Calendar } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/Input";
import { useCurrencyFormat } from "@/lib/currency";

interface SearchResult {
  id: string;
  type: 'transaction' | 'card' | 'investment' | 'goal' | 'subscription' | 'calendar' | 'page';
  title: string;
  subtitle?: string;
  url: string;
  icon: any;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { format } = useCurrencyFormat();

  const transactions = useAppStore((s) => s.transactions);
  const creditCards = useAppStore((s) => s.creditCards);
  const assets = useAppStore((s) => s.assets);
  const goals = useAppStore((s) => s.goals);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const calendarEvents = useAppStore((s) => s.calendarEvents);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    // Search transactions
    transactions
      .filter(t => 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.account?.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .forEach(t => {
        searchResults.push({
          id: `txn-${t.id}`,
          type: 'transaction',
          title: t.description,
          subtitle: `${format(Math.abs(t.amount))} • ${new Date(t.date).toLocaleDateString()}`,
          url: '/spending',
          icon: FileText
        });
      });

    // Search credit cards
    creditCards
      .filter(c => 
        c.brand.toLowerCase().includes(q) ||
        c.last4.includes(q) ||
        c.name?.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach(c => {
        searchResults.push({
          id: `card-${c.id}`,
          type: 'card',
          title: `${c.brand} •••• ${c.last4}`,
          subtitle: `${format(c.balance)} / ${format(c.limit)}`,
          url: '/cards',
          icon: CreditCard
        });
      });

    // Search investments
    assets
      .filter(a => ['stock', 'mutual_fund', 'etf', 'bond', 'gold', 'fd'].includes(a.type))
      .filter(a => 
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        (a.institution?.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .forEach(a => {
        searchResults.push({
          id: `inv-${a.id}`,
          type: 'investment',
          title: a.name,
          subtitle: `${format(a.value)} • ${a.type}`,
          url: '/investments',
          icon: TrendingUp
        });
      });

    // Search goals
    goals
      .filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach(g => {
        searchResults.push({
          id: `goal-${g.id}`,
          type: 'goal',
          title: g.title,
          subtitle: `${format(g.currentAmount)} / ${format(g.targetAmount)}`,
          url: '/goals',
          icon: Wallet
        });
      });

    // Search subscriptions
    subscriptions
      .filter(s => s.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(s => {
        searchResults.push({
          id: `sub-${s.id}`,
          type: 'subscription',
          title: s.name,
          subtitle: `${format(s.amount)} / ${s.cadence}`,
          url: '/subscriptions',
          icon: Calendar
        });
      });

    // Search calendar events
    calendarEvents
      .filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach(e => {
        searchResults.push({
          id: `cal-${e.id}`,
          type: 'calendar',
          title: e.title,
          subtitle: new Date(e.date).toLocaleDateString(),
          url: '/calendar',
          icon: Calendar
        });
      });

    // Search pages
    const pages = [
      { title: 'Home', url: '/home', keywords: ['home', 'dashboard', 'main'] },
      { title: 'Spending', url: '/spending', keywords: ['spending', 'expenses', 'transactions'] },
      { title: 'Investments', url: '/investments', keywords: ['investments', 'portfolio', 'stocks'] },
      { title: 'Credit Cards', url: '/cards', keywords: ['cards', 'credit', 'card'] },
      { title: 'Goals', url: '/goals', keywords: ['goals', 'target', 'savings'] },
      { title: 'Tax', url: '/tax', keywords: ['tax', 'taxes', 'deduction'] },
      { title: 'Net Worth', url: '/net-worth', keywords: ['net worth', 'wealth', 'assets'] },
      { title: 'Debt', url: '/debt', keywords: ['debt', 'loans', 'emi'] },
    ];

    pages
      .filter(p => p.keywords.some(k => k.includes(q)) || p.title.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(p => {
        searchResults.push({
          id: `page-${p.url}`,
          type: 'page',
          title: p.title,
          subtitle: 'Navigate to page',
          url: p.url,
          icon: Search
        });
      });

    return searchResults;
  }, [query, transactions, creditCards, assets, goals, subscriptions, calendarEvents]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" />
          <Dialog.Content className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl outline-none backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <Search className="h-5 w-5 text-zinc-400" />
              <Input
                autoFocus
                placeholder="Search transactions, cards, investments, goals, or navigate to pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 border-none bg-transparent text-base text-white placeholder:text-zinc-500 focus-visible:ring-0"
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-400 sm:inline-block">
                  ESC
                </kbd>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {query.trim() && results.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-400">No results found</p>
                  <p className="mt-1 text-xs text-zinc-500">Try a different search term</p>
                </div>
              ) : query.trim() ? (
                <div className="space-y-1">
                  {results.map((result) => {
                    const Icon = result.icon;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                          <Icon className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{result.title}</div>
                          {result.subtitle && (
                            <div className="mt-0.5 text-xs text-zinc-400">{result.subtitle}</div>
                          )}
                        </div>
                        <div className="text-[10px] uppercase text-zinc-500">
                          {result.type}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-400">Start typing to search...</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs text-zinc-500">
                    <div>• Transactions</div>
                    <div>• Credit Cards</div>
                    <div>• Investments</div>
                    <div>• Goals</div>
                    <div>• Subscriptions</div>
                    <div>• Calendar Events</div>
                  </div>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Wallet, Layers, CreditCard, MoreHorizontal, Receipt, Calendar, Bot } from "lucide-react";
import { useState } from "react";
import { Sheet } from "../ui/Sheet";
import { useAppStore } from "@/state/app-store";

const tabs = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/spending", label: "Spending", icon: Layers },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/oracle", label: "Oracle", icon: Bot },
];

export function BottomTabs() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const flags = useAppStore((s) => s.featureFlags);
  return (
    <div className="grid grid-cols-6 text-xs">
      {tabs.filter((t) => {
        if (t.href === "/home") return flags.home;
        if (t.href === "/spending") return flags.spending;
        if (t.href === "/calendar") return flags.calendar;
        if (t.href === "/cards") return flags.cards;
        if (t.href === "/oracle") return flags.oracle;
        return true;
      }).map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active
                  ? "text-cyan-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[0] transition-all ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-cyan-500/30"
                    : "bg-transparent text-zinc-500"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={`text-[10px] font-medium ${active ? "text-cyan-400" : ""}`}>{label}</span>
            </Link>
          );
        })}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-0.5 py-2 text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <MoreHorizontal className="h-5 w-5" />
        <span className="text-[10px] font-medium">More</span>
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="All modules">
        <div className="grid grid-cols-2 gap-3 p-1 text-sm">
          {flags.profile && (
            <Link href="/profile" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Identity
            </Link>
          )}
          {flags.subscriptions && (
            <Link href="/subscriptions" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Subscriptions
            </Link>
          )}
          {flags.expenses && (
            <Link href="/expenses" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Expenses
            </Link>
          )}
          {flags.investments && (
            <Link href="/investments" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Investments
            </Link>
          )}
          {flags.netWorth && (
            <Link href="/net-worth" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Net Worth
            </Link>
          )}
          {flags.debt && (
            <Link href="/debt" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Debt
            </Link>
          )}
          {flags.goals && (
            <Link href="/goals" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Goals
            </Link>
          )}
          {flags.circles && (
            <Link href="/circles" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Circles
            </Link>
          )}
          {flags.tax && (
            <Link href="/tax" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Tax
            </Link>
          )}
          {flags.safety && (
            <Link href="/safety" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Safety
            </Link>
          )}
          {flags.scam && (
            <Link href="/scam" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Scam shield
            </Link>
          )}
          {flags.reports && (
            <Link href="/reports" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Reports
            </Link>
          )}
          {flags.settings && (
            <Link href="/settings" className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-cyan-500/30 transition-all backdrop-blur-md">
              Settings
            </Link>
          )}
        </div>
      </Sheet>
    </div>
  );
}

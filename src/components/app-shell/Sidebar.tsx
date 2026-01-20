"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, CreditCard, Home, LineChart, Shield, Target, Wallet, AlertTriangle, ChartBar, Settings, Receipt, Fingerprint, Landmark, Bot, Users, RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { useAppStore } from "@/state/app-store";

const items = [
  { href: "/home", label: "Home", icon: Home, flag: "home" as const },
  { href: "/oracle", label: "Oracle AI", icon: Bot, flag: "oracle" as const },
  { href: "/spending", label: "Spending", icon: Layers, flag: "spending" as const },
  { href: "/calendar", label: "Calendar", icon: Calendar, flag: "calendar" as const },
  { href: "/cards", label: "Cards", icon: CreditCard, flag: "cards" as const },
  { href: "/subscriptions", label: "Subscriptions", icon: RefreshCw, flag: "subscriptions" as const },
  { href: "/expenses", label: "Expenses", icon: Receipt, flag: "expenses" as const },
  { href: "/investments", label: "Investments", icon: TrendingUp, flag: "investments" as const },
  { href: "/net-worth", label: "Net Worth", icon: LineChart, flag: "netWorth" as const },
  { href: "/debt", label: "Debt", icon: Wallet, flag: "debt" as const },
  { href: "/goals", label: "Goals", icon: Target, flag: "goals" as const },
  { href: "/circles", label: "Circles", icon: Users, flag: "circles" as const },
  { href: "/tax", label: "Tax", icon: Landmark, flag: "tax" as const },
  { href: "/safety", label: "Safety", icon: Shield, flag: "safety" as const },
  { href: "/scam", label: "Scam", icon: AlertTriangle, flag: "scam" as const },
  { href: "/reports", label: "Reports", icon: ChartBar, flag: "reports" as const },
  { href: "/profile", label: "Identity", icon: Fingerprint, flag: "profile" as const },
  { href: "/settings", label: "Settings", icon: Settings, flag: "settings" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const flags = useAppStore((s) => s.featureFlags);
  return (
    <nav className="mt-2">
      <div className="flex flex-col gap-1">
        {items.filter((i) => flags[i.flag]).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
              }`}
            >
              <Icon className={`h-5 w-5 transition-colors ${active ? "text-cyan-400" : "text-zinc-500 group-hover:text-white"}`} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

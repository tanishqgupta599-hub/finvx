"use client";

import { Button } from "./Button";
import { motion } from "framer-motion";
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Calendar,
  Receipt,
  HelpCircle,
  ArrowRight
} from "lucide-react";

interface EnhancedEmptyStateProps {
  type: 'transactions' | 'cards' | 'investments' | 'goals' | 'subscriptions' | 'calendar' | 'expenses' | 'general';
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

const typeConfig = {
  transactions: {
    icon: Receipt,
    defaultTitle: "No transactions yet",
    defaultDescription: "Start tracking your spending and income to get insights into your financial habits.",
    defaultTips: [
      "Add your first expense or income",
      "Transactions help build your financial picture",
      "You can categorize and analyze them later"
    ]
  },
  cards: {
    icon: CreditCard,
    defaultTitle: "No credit cards added",
    defaultDescription: "Add your credit cards to track spending, optimize rewards, and manage payments.",
    defaultTips: [
      "Track multiple cards in one place",
      "Get recommendations on which card to use",
      "Never miss a payment deadline"
    ]
  },
  investments: {
    icon: TrendingUp,
    defaultTitle: "No investments tracked",
    defaultDescription: "Start tracking your investments to see portfolio performance and allocation.",
    defaultTips: [
      "Track stocks, mutual funds, and more",
      "Calculate XIRR and returns",
      "Monitor portfolio allocation"
    ]
  },
  goals: {
    icon: Target,
    defaultTitle: "No financial goals set",
    defaultDescription: "Set goals to stay motivated and track your progress toward financial milestones.",
    defaultTips: [
      "Set specific, measurable goals",
      "Track progress over time",
      "Celebrate milestones along the way"
    ]
  },
  subscriptions: {
    icon: Calendar,
    defaultTitle: "No subscriptions tracked",
    defaultDescription: "Track your recurring subscriptions to identify leaks and optimize spending.",
    defaultTips: [
      "Find forgotten subscriptions",
      "Calculate monthly/annual costs",
      "Cancel what you don't use"
    ]
  },
  calendar: {
    icon: Calendar,
    defaultTitle: "No calendar events",
    defaultDescription: "Add bills and important dates to never miss a payment.",
    defaultTips: [
      "Set reminders for bills",
      "Track due dates",
      "Plan your cash flow"
    ]
  },
  expenses: {
    icon: Wallet,
    defaultTitle: "No expenses logged",
    defaultDescription: "Start logging expenses to understand where your money goes.",
    defaultTips: [
      "Log expenses as they happen",
      "Categorize for better insights",
      "Review patterns monthly"
    ]
  },
  general: {
    icon: HelpCircle,
    defaultTitle: "Nothing here yet",
    defaultDescription: "Get started by adding your first item.",
    defaultTips: []
  }
};

export function EnhancedEmptyState({
  type,
  title,
  description,
  primaryAction,
  secondaryAction,
  tips
}: EnhancedEmptyStateProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const displayTips = tips || config.defaultTips;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
        <Icon className="h-10 w-10 text-cyan-400" />
      </div>
      
      <h3 className="mb-2 text-lg font-semibold text-white">
        {displayTitle}
      </h3>
      
      <p className="mb-6 max-w-md text-sm text-zinc-400">
        {displayDescription}
      </p>

      {displayTips.length > 0 && (
        <div className="mb-6 w-full max-w-md space-y-2 text-left">
          {displayTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 rounded-xl bg-zinc-900/50 p-3 text-xs text-zinc-400 border border-white/5"
            >
              <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
              <span>{tip}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            className="gap-2"
          >
            {primaryAction.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant="secondary"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

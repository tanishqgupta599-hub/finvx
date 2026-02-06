"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HelpCircle, BookOpen, Video, MessageCircle, X, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Finvx',
    content: 'Welcome to Finvx! Start by adding your first transaction, credit card, or asset. Use the Quick Add bar at the bottom of the home page for quick entry. Complete your onboarding to personalize your experience.',
    category: 'Basics',
    tags: ['onboarding', 'first steps', 'setup']
  },
  {
    id: 'credit-cards',
    title: 'Managing Credit Cards',
    content: 'Add all your credit cards to track spending, utilization, and rewards. Use the Credit Card Advisor to get recommendations on which card to use for different purchases. Track due dates and never miss a payment.',
    category: 'Credit Cards',
    tags: ['cards', 'rewards', 'payments']
  },
  {
    id: 'transactions',
    title: 'Tracking Transactions',
    content: 'Add transactions manually or set up recurring transactions for subscriptions and bills. Categorize expenses to get insights into your spending patterns. Use filters to view specific time periods or categories.',
    category: 'Transactions',
    tags: ['expenses', 'income', 'categorization']
  },
  {
    id: 'investments',
    title: 'Investment Tracking',
    content: 'Track stocks, mutual funds, ETFs, bonds, and more. View portfolio allocation and calculate XIRR returns. Monitor capital gains for tax purposes. Add investments manually or import from statements.',
    category: 'Investments',
    tags: ['portfolio', 'stocks', 'returns', 'xirr']
  },
  {
    id: 'goals',
    title: 'Financial Goals',
    content: 'Set financial goals like buying a house, retirement, or vacation. Track progress over time. Get personalized recommendations on how to achieve your goals faster.',
    category: 'Goals',
    tags: ['savings', 'planning', 'targets']
  },
  {
    id: 'tax',
    title: 'Tax Management',
    content: 'Calculate your tax liability using the India tax calculator. Compare old vs new regime. Track capital gains and deductions. Get tax-saving suggestions based on your investments and expenses.',
    category: 'Tax',
    tags: ['tax', 'deductions', 'capital gains']
  },
  {
    id: 'expense-splitting',
    title: 'Splitting Expenses',
    content: 'Create expense circles with friends or family. Split bills equally or unequally. Track who owes what. Settle balances with one click. Perfect for trips, shared subscriptions, or group expenses.',
    category: 'Expenses',
    tags: ['friends', 'splitting', 'groups']
  },
  {
    id: 'ai-copilot',
    title: 'AI Finance Copilot',
    content: 'Ask Oracle AI questions about your finances. Get insights on spending patterns, affordability checks, and savings tips. Use what-if simulations to plan for the future.',
    category: 'AI',
    tags: ['ai', 'insights', 'advice']
  }
];

export function HelpCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = Array.from(new Set(helpArticles.map(a => a.category)));

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl outline-none">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Help Center</h2>
                  <p className="text-xs text-zinc-400">Find answers and learn how to use Finvx</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/10"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {selectedArticle ? (
              <div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="mb-4 text-sm text-cyan-400 hover:text-cyan-300"
                >
                  ← Back to articles
                </button>
                <h3 className="text-xl font-semibold text-white mb-2">{selectedArticle.title}</h3>
                <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                  {selectedArticle.content}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedArticle.tags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {filteredArticles.length === 0 ? (
                    <div className="py-12 text-center text-sm text-zinc-400">
                      No articles found. Try a different search term.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map(category => {
                        const categoryArticles = filteredArticles.filter(a => a.category === category);
                        if (categoryArticles.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              {category}
                            </h3>
                            <div className="space-y-2">
                              {categoryArticles.map(article => (
                                <button
                                  key={article.id}
                                  onClick={() => setSelectedArticle(article)}
                                  className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-4 text-left transition-colors hover:bg-white/5"
                                >
                                  <h4 className="text-sm font-medium text-white">{article.title}</h4>
                                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                                    {article.content}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-white/5 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-white mb-1">Quick Links</div>
                      <div className="space-y-1 text-xs text-zinc-400">
                        <div>• Getting Started Guide</div>
                        <div>• Video Tutorials</div>
                        <div>• FAQ</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-white mb-1">Support</div>
                      <div className="space-y-1 text-xs text-zinc-400">
                        <div>• Contact Support</div>
                        <div>• Feature Requests</div>
                        <div>• Report a Bug</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      slug: "financial-freedom-roadmap",
      title: "The Roadmap to Financial Freedom",
      excerpt: "Why tracking your net worth is more important than tracking your budget.",
      date: "Jan 15, 2024",
      author: "Tanishq",
      category: "Guide"
    },
    {
      slug: "local-first-software",
      title: "Why Local-First Software Matters",
      excerpt: "In an age of data breaches, keeping your financial data on your device is the ultimate security feature.",
      date: "Jan 02, 2024",
      author: "Engineering Team",
      category: "Technology"
    },
    {
      slug: "debt-snowball-vs-avalanche",
      title: "Debt Snowball vs. Avalanche",
      excerpt: "Which debt payoff strategy is right for your psychology? A mathematical breakdown.",
      date: "Dec 20, 2023",
      author: "Finance Team",
      category: "Analysis"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020410] text-white selection:bg-cyan-500/30">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white mb-12"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <header className="mb-16 border-b border-white/5 pb-16">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            The Ledger
          </h1>
          <p className="text-xl text-zinc-400">
            Thoughts on money, code, and building a calmer financial life.
          </p>
        </header>

        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug} className="group relative">
              <div className="absolute -inset-4 rounded-2xl bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                  <span className="text-cyan-400 font-medium">{post.category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {post.date}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {post.author}
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">
                  <Link href="#">{post.title}</Link>
                </h2>
                <p className="text-zinc-400 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-4">
                  <span className="text-sm font-medium text-white group-hover:underline">Read more &rarr;</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

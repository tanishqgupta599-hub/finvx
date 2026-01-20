"use client";

import Link from "next/link";
import { ArrowLeft, Zap, Shield, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020410] text-white selection:bg-cyan-500/30">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white mb-12"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <header className="mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mb-6">
            About Finverse
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-6">
            Reclaiming financial privacy.
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            We believe your financial life belongs to you, not to ad networks or data brokers. 
            Finverse was built to provide clarity without compromise.
          </p>
        </header>

        <div className="grid gap-12 md:grid-cols-3 mb-24">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Lightning Fast</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No server roundtrips. Everything happens instantly on your device using local-first architecture.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Private by Default</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We don't track your spending. We don't sell your data. We don't even see your data.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Open Future</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Building towards a standard where financial data portability is a right, not a privilege.
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Join the movement</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            We are a small team of developers and finance nerds building the tool we always wanted.
          </p>
          <Link 
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
          >
            Start using Finverse
          </Link>
        </section>
      </div>
    </div>
  );
}

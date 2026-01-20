"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020410] text-white selection:bg-cyan-500/30">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white mb-12"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-400">
            Last updated: January 19, 2026
          </p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="lead text-lg text-zinc-300">
            At Finvx, privacy is not an afterthought; it is our core product. We have architected our application to ensure that your financial data remains yours and yours alone.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Data Collection & Storage</h2>
          <p>
            <strong>Local First:</strong> All your financial data (transactions, account balances, net worth history) is stored locally on your device using browser storage (IndexedDB/LocalStorage).
          </p>
          <p>
            <strong>No Cloud Sync (Default):</strong> By default, your financial data never leaves your device. We do not have servers that store your bank credentials or transaction history.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Usage of Data</h2>
          <p>
            Since we do not have access to your data, we cannot use it for:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Advertising targeting</li>
            <li>Credit scoring models</li>
            <li>Selling to third parties</li>
            <li>Market analysis</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Third-Party Services</h2>
          <p>
            We strictly limit third-party integrations. If you choose to enable optional features (like future cloud backup), data will be end-to-end encrypted before leaving your device.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have questions about our privacy model, please reach out to us at privacy@finvx.app (stub).
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-6">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Terms of Service
          </h1>
          <p className="text-zinc-400">
            Last updated: January 19, 2026
          </p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="lead text-lg text-zinc-300">
            By accessing or using Finvx, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            Finvx provides financial tracking and visualization software. By creating a local workspace, you acknowledge that the software is provided "as is" and "as available".
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your device and any access methods (like biometrics) used to secure the Finvx app. Since data is stored locally, you are responsible for your own data backups.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Disclaimer of Warranties</h2>
          <p>
            Finvx is a tool for informational purposes only. It does not provide financial advice. We are not responsible for any financial decisions made based on the data presented in the application.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Finvx shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any significant changes via the application.
          </p>
        </div>
      </div>
    </div>
  );
}

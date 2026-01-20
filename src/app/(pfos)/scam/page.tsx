"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/state/app-store";
import { useState } from "react";

type ScamResult = {
  riskLabel: string;
  riskScore: number;
  redFlags: string[];
  steps: string[];
};

export default function Scam() {
  const items = useAppStore((s) => s.scamChecks);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScamResult | null>(null);

  const runCheck = () => {
    const content = text.toLowerCase();
    if (!content.trim()) {
      setResult(null);
      return;
    }
    const flags: string[] = [];
    if (content.includes("otp") || content.includes("one time password")) {
      flags.push("Asking for OTP or passwords is a strong red flag.");
    }
    if (content.includes("urgent") || content.includes("immediately")) {
      flags.push("Creates artificial urgency to stop you from thinking clearly.");
    }
    if (content.includes("lottery") || content.includes("prize")) {
      flags.push("Unexpected prizes or winnings with fees upfront are often scams.");
    }
    if (content.includes("upi") || content.includes("qr code")) {
      flags.push("QR codes and UPI collect requests can silently pull money from your account.");
    }
    if (content.includes("kbc") || content.includes("income tax")) {
      flags.push("Using famous brands or authorities to feel legitimate is common in scams.");
    }
    if (flags.length === 0) {
      flags.push(
        "No obvious keywords, but this is not a guarantee. Stay cautious and trust your intuition.",
      );
    }
    const score = Math.min(100, 20 + flags.length * 15);
    let label: string;
    if (score >= 70) label = "High risk";
    else if (score >= 40) label = "Medium risk";
    else label = "Low but be careful";
    const steps: string[] = [
      "Pause. Do not click any links or share any codes until you feel calm.",
      "If money or sensitive information is involved, verify using an official app or phone number you trust, not the one in the message.",
      "When in doubt, it is okay to ignore and delete. A legitimate party will usually find a calmer way to reach you.",
    ];
    setResult({
      riskLabel: label,
      riskScore: score,
      redFlags: flags,
      steps,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="text-sm font-medium">Scam check</div>
          <div className="mt-1 text-xs text-zinc-500">
            Paste a message, SMS, email, or script. This engine is intentionally simple and does
            not send anything to a server.
          </div>
          <div className="mt-3 space-y-3 text-sm">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the suspicious text here..."
              rows={6}
              className="w-full rounded-xl border border-zinc-200 bg-white p-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
            />
            <Button size="sm" onClick={runCheck}>
              Run quick check
            </Button>
            {result && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-xs">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                  <div className="text-zinc-500">Risk score</div>
                  <div className="mt-1 text-lg font-semibold">
                    {result.riskScore}/100
                  </div>
                  <div className="mt-1 text-zinc-500">{result.riskLabel}</div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 md:col-span-2">
                  <div className="text-zinc-500">Red flags spotted</div>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {result.redFlags.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                {!overwhelmMode && (
                  <div className="md:col-span-3 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900">
                    <div className="font-medium">Suggested next steps</div>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {result.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-sm font-medium">Scam library</div>
          <div className="mt-1 text-xs text-zinc-500">
            A calm, growing list of patterns so you can recognise trouble earlier.
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
            {items.map((i) => (
              <Card key={i.id}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{i.title}</div>
                    <div className="text-xs text-zinc-500">
                      Risk {i.riskLevel}
                    </div>
                  </div>
                  <div className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Status: {i.status === "safe" ? "known pattern" : i.status}
                  </div>
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <div className="md:col-span-2">
                <EmptyState
                  title="No examples yet"
                  description="Demo data can include common scam patterns like fake KYC, income tax, and courier calls."
                />
              </div>
            )}
            <Card>
              <CardContent>
                <div className="text-sm font-medium">
                  Classic patterns to watch for
                </div>
                <ul className="mt-2 list-disc space-y-1 text-xs text-zinc-600 dark:text-zinc-400 pl-4">
                  <li>Fake KYC or bank verification asking for OTP or UPI PIN.</li>
                  <li>Courier or customs scams demanding small “release” payments.</li>
                  <li>
                    Screensharing apps asking you to install and “help with a refund”.
                  </li>
                  <li>Lottery, job, or investment plans that feel too smooth.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

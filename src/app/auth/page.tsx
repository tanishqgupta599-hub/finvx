"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Shield, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/state/auth-store";

type Mode = "login" | "signup";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signup = useAuthStore((s) => s.signup);
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);

  const initialMode = (searchParams.get("mode") as Mode) || "signup";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (user && redirect) {
      router.replace(redirect);
    }
  }, [user, router, searchParams]);

  const hashPassword = async (raw: string) => {
    if (typeof window !== "undefined" && (!window.crypto || !window.crypto.subtle)) {
      throw new Error("Secure encryption is not available in this browser environment.");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const bytes = new Uint8Array(digest);
    let hex = "";
    for (const byte of bytes) {
      hex += byte.toString(16).padStart(2, "0");
    }
    return hex;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError("");

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Enter a valid email address");
      return;
    }
    if (mode === "signup" && !trimmedName) {
      setError("Name is required");
      return;
    }
    if (!trimmedPassword) {
      setError("Password is required");
      return;
    }
    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (mode === "signup" && trimmedPassword !== confirmPassword.trim()) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const passwordHash = await hashPassword(trimmedPassword);
      if (mode === "signup") {
        const result = signup({
          email: trimmedEmail,
          name: trimmedName || undefined,
          passwordHash,
        });
        if (!result.ok) {
          setError(result.error || "Could not create account");
          return;
        }
      } else {
        const result = loginWithPassword(trimmedEmail, passwordHash);
        if (!result.ok) {
          setError(result.error || "Could not log in");
          return;
        }
      }
      const redirect = searchParams.get("redirect") || "/home";
      router.replace(redirect);
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "An unexpected error occurred during authentication");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "signup" ? "Create your space" : "Unlock your cockpit";
  const badge = mode === "signup" ? "New session" : "Returning pilot";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -left-32 top-[-10%] h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.1 }}
          className="absolute right-[-10%] top-1/3 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="absolute bottom-[-15%] left-1/3 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08)_0,_transparent_55%),radial-gradient(circle_at_bottom,_rgba(244,114,182,0.08)_0,_transparent_55%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col gap-10 py-10 md:flex-row md:items-center md:gap-12">
        <div className="relative hidden flex-1 items-center justify-center md:flex">
          <motion.div
            initial={{ rotate: -8, opacity: 0, y: 40 }}
            animate={{ rotate: -2, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
            className="relative h-72 w-72 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 p-4 shadow-[0_0_80px_rgba(56,189,248,0.35)]"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 shadow-lg shadow-cyan-500/40">
                  <Zap className="h-4 w-4 text-slate-950" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-200">
                    Finverse
                  </div>
                  <div className="text-[11px] text-zinc-400">Command center</div>
                </div>
              </div>
              <div className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-zinc-300">
                Online
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/25 via-emerald-500/5 to-slate-950 px-3 py-3 text-emerald-50 ring-1 ring-emerald-400/40">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-[0.18em] text-emerald-200">
                    Net worth
                  </span>
                  <span className="text-emerald-100/80">↑</span>
                </div>
                <div className="mt-3 text-lg font-semibold">₹1.24Cr</div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-emerald-500/25">
                  <div className="h-1.5 w-2/3 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/25 via-purple-500/10 to-slate-950 px-3 py-3 text-fuchsia-50 ring-1 ring-fuchsia-400/40">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-[0.18em] text-fuchsia-200">
                    Cards
                  </span>
                  <span className="text-fuchsia-100/80">●</span>
                </div>
                <div className="mt-3 text-lg font-semibold">36% used</div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-fuchsia-500/25">
                  <div className="h-1.5 w-1/3 rounded-full bg-fuchsia-400" />
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-cyan-500/25 via-sky-500/10 to-slate-950 px-3 py-3 text-cyan-50 ring-1 ring-cyan-400/40">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-[0.18em] text-cyan-200">
                    Flow
                  </span>
                  <span className="text-cyan-100/80">+</span>
                </div>
                <div className="mt-3 text-lg font-semibold">₹24,800</div>
                <div className="mt-1 text-[10px] text-cyan-100/80">Monthly surplus</div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-violet-500/25 via-indigo-500/10 to-slate-950 px-3 py-3 text-violet-50 ring-1 ring-violet-400/40">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-[0.18em] text-violet-200">
                    Goals
                  </span>
                  <span className="text-violet-100/80">72%</span>
                </div>
                <div className="mt-3 h-12 w-full rounded-xl bg-gradient-to-tr from-violet-500/40 via-fuchsia-500/40 to-cyan-400/40" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center justify-between text-[11px] text-zinc-400"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1">
                <Shield className="h-3.5 w-3.5 text-emerald-300" />
                <span>Private local vault</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span>Futuristic mode</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex-1"
        >
          <Card className="border-white/10 bg-slate-950/80 shadow-[0_0_60px_rgba(56,189,248,0.45)] backdrop-blur-xl">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 shadow-lg shadow-cyan-500/40">
                    <Zap className="h-4 w-4 text-slate-950" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                      Finverse
                    </div>
                    <div className="text-xs text-zinc-300">Access panel</div>
                  </div>
                </div>
                <div className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-200">
                  {badge}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-2xl font-semibold tracking-tight">{title}</div>
                  <div className="flex w-full rounded-full bg-slate-900 px-1 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError("");
                      }}
                      className={`flex-1 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap ${
                        mode === "signup"
                          ? "bg-gradient-to-r from-cyan-400 via-emerald-400 to-fuchsia-400 text-slate-950"
                          : "text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      Sign up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                      className={`flex-1 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap ${
                        mode === "login"
                          ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 text-slate-950"
                          : "text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      Log in
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-zinc-400">Name</div>
                      <Input
                        placeholder="Who&apos;s piloting?"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="h-10 border-zinc-800 bg-slate-950 text-sm text-white placeholder:text-zinc-500"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <div className="text-xs text-zinc-400">Email</div>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-10 border-zinc-800 bg-slate-950 text-sm text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-zinc-400">Password</div>
                    <Input
                      type="password"
                      placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-10 border-zinc-800 bg-slate-950 text-sm text-white placeholder:text-zinc-500"
                    />
                  </div>
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-zinc-400">Confirm password</div>
                      <Input
                        type="password"
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="h-10 border-zinc-800 bg-slate-950 text-sm text-white placeholder:text-zinc-500"
                      />
                    </div>
                  )}
                  {error && <div className="text-[11px] text-red-500">{error}</div>}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="group relative mt-2 w-full justify-center overflow-hidden bg-gradient-to-r from-cyan-400 via-emerald-400 to-fuchsia-400 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.55)] transition-transform hover:scale-[1.02]"
                  >
                    <span className="relative z-10 whitespace-nowrap">
                      {mode === "signup" ? "Enter Finverse" : "Continue"}
                    </span>
                    <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80 group-hover:animate-[shimmer_1.2s_ease-in-out]" />
                  </Button>
                </form>

                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Local-only account in this browser.
                  </span>
                  <span className="hidden text-zinc-500 sm:inline">
                    No passwords, no bank links.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

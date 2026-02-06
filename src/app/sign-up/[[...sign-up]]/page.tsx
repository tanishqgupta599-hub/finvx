"use client";

import { Sparkles, TrendingUp, PieChart, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

// Check if Clerk is configured (only check public key in client component)
const hasClerkKeys = 
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
       process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here' &&
       process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20)
    : (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
       process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here' &&
       process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20);

export default function Page() {
  const [SignUpComponent, setSignUpComponent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasClerkKeys) {
      // Dynamically import Clerk SignUp component
      import("@clerk/nextjs").then(({ SignUp }) => {
        setSignUpComponent(() => SignUp);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fallback UI when Clerk is not configured
  if (!hasClerkKeys || !SignUpComponent) {
    return (
      <div className="flex min-h-screen w-full bg-zinc-950 text-white">
        <div className="flex w-full flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full space-y-6"
          >
            <div className="flex items-center gap-2 text-2xl font-bold text-emerald-500 mb-8">
              <Sparkles className="h-6 w-6" />
              Finvx
            </div>
            
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 backdrop-blur">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-400 mb-2">Authentication Not Configured</h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Clerk authentication is not set up. To enable sign-up functionality, please configure your Clerk API keys in the <code className="text-xs bg-zinc-900 px-2 py-1 rounded">.env.local</code> file.
                  </p>
                  <div className="space-y-2 text-xs text-zinc-500">
                    <p>1. Get keys from <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline">dashboard.clerk.com</a></p>
                    <p>2. Add them to your <code className="bg-zinc-900 px-1 py-0.5 rounded">.env.local</code> file</p>
                    <p>3. Restart the development server</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/home"
                className="flex-1 rounded-xl bg-emerald-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Continue to App (Demo)
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-zinc-950 text-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render Clerk SignUp when configured
  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-white">
      {/* Left Panel - Branding & Creative */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute -left-[20%] -top-[20%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute -bottom-[20%] -right-[20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 text-2xl font-bold text-emerald-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            Finvx
          </div>
        </motion.div>

        <div className="relative z-10 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl"
          >
            Join the Future of <br />
            <span className="text-emerald-500">Personal Finance.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-zinc-400"
          >
            Create an account today and start your journey towards financial freedom.
          </motion.p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 backdrop-blur"
            >
              <TrendingUp className="mb-3 h-6 w-6 text-purple-500" />
              <div className="font-semibold">Growth Tools</div>
              <div className="text-xs text-zinc-500">Advanced analytics for your investments.</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 backdrop-blur"
            >
              <PieChart className="mb-3 h-6 w-6 text-emerald-500" />
              <div className="font-semibold">Visual Budgeting</div>
              <div className="text-xs text-zinc-500">See where your money goes.</div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative z-10 text-xs text-zinc-500"
        >
          © {new Date().getFullYear()} Finvx. All rights reserved.
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex items-center gap-2 text-2xl font-bold text-emerald-500 lg:hidden"
        >
          <Sparkles className="h-6 w-6" />
          Finvx
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SignUpComponent 
            routing="path" 
            path="/sign-up" 
            fallbackRedirectUrl="/onboarding"
            signInUrl="/sign-in"
          />
        </motion.div>
      </div>
    </div>
  );
}

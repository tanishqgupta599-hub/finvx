"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Shield, Target, Wallet2, CreditCard, LineChart, 
  TrendingUp, Zap, Lock, EyeOff, Fingerprint, Server, 
  Sparkles, Calendar, MessageCircle, Cloud, Globe, Check, Users, Database, Key
} from "lucide-react";

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#020410] text-white selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 fixed">
        <div className="absolute -left-40 top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[128px]" />
        <div className="absolute right-[-10%] top-1/3 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[128px]" />
        <div className="absolute bottom-[-10%] left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[128px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6">
        {/* Navigation */}
        <header className="flex items-center justify-between py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Zap className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Finverse</span>
          </motion.div>
          
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400"
          >
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#security" className="hover:text-white transition-colors">Security</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/auth?mode=login" className="hidden text-sm font-medium text-zinc-400 hover:text-white md:block">
              Sign in
            </Link>
            <Link
              href="/auth?mode=signup"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-50"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        </header>

        {/* Hero Section */}
        <main className="mt-16 flex flex-col items-center text-center lg:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-md mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Introducing Oracle AI & TaxOS
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Financial clarity, <br />
            <span className="bg-gradient-to-b from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              reimagined.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed"
          >
            The world's most advanced personal finance OS. <br className="hidden md:block" />
            Local-first security. AI-powered strategy. Zero compromise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/auth?mode=signup"
              className="h-12 w-full sm:w-auto px-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="h-12 w-full sm:w-auto px-8 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 font-medium flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              View Pricing
            </Link>
          </motion.div>

          {/* Feature Highlights (Sequential Layout) */}
          <div id="features" className="mt-40 w-full flex flex-col gap-32">
            
            {/* Feature 1: Oracle AI */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-12 md:gap-24"
            >
              <div className="flex-1 text-left space-y-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-400">
                  <Sparkles className="h-4 w-4" /> Oracle AI
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Your Personal <br />
                  <span className="text-cyan-400">Financial Strategist.</span>
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Stop guessing. Oracle AI analyzes your entire financial life—spending, investments, and goals—to provide actionable, real-time advice. It's like having a CFO in your pocket.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400"><Check className="h-3 w-3" /></div>
                    <span>Smart budget adjustments based on spending habits</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400"><Check className="h-3 w-3" /></div>
                    <span>Investment opportunity alerts</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-md overflow-hidden p-8 shadow-2xl shadow-cyan-900/20 group">
                   <div className="absolute inset-0 bg-cyan-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   {/* Abstract AI Visualization */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse" />
                        <div className="h-32 w-32 rounded-full border-2 border-cyan-500/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                          <div className="h-24 w-24 rounded-full border border-cyan-400/50 flex items-center justify-center animate-[spin_8s_linear_infinite_reverse]">
                             <Sparkles className="h-12 w-12 text-cyan-400 animate-pulse" />
                          </div>
                        </div>
                      </div>
                   </div>
                   
                   {/* Floating UI Elements */}
                   <div className="absolute bottom-8 left-8 right-8 bg-zinc-900/90 border border-white/10 rounded-xl p-4 backdrop-blur-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Optimization Found</div>
                          <div className="text-xs text-zinc-400">Save ₹4,200 by switching to liquid funds</div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: TaxOS (Reversed Layout) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24"
            >
              <div className="flex-1 text-left space-y-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
                  <Shield className="h-4 w-4" /> TaxOS
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Automated <br />
                  <span className="text-emerald-400">Wealth Protection.</span>
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Don't let taxes erode your wealth. TaxOS handles everything from harvesting losses to selecting the perfect regime, ensuring you keep more of what you earn.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Check className="h-3 w-3" /></div>
                    <span>Automated Tax Loss Harvesting</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Check className="h-3 w-3" /></div>
                    <span>Smart Regime Selection (New vs Old)</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl border border-white/10 bg-gradient-to-bl from-zinc-900/80 to-black/80 backdrop-blur-md overflow-hidden p-8 shadow-2xl shadow-emerald-900/20 group">
                   <div className="absolute inset-0 bg-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="h-48 w-48 text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors duration-500" />
                   </div>

                   {/* Mock UI Card */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-xl">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-zinc-400">Potential Savings</div>
                        <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">FY 2024-25</div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">₹45,000</div>
                      <div className="text-xs text-zinc-500">via 80C & Tax Harvesting</div>
                      <div className="mt-4 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[75%]" />
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Smart Calendar */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-12 md:gap-24"
            >
              <div className="flex-1 text-left space-y-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-400">
                  <Calendar className="h-4 w-4" /> Smart Calendar
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Future-Proof <br />
                  <span className="text-purple-400">Your Cashflow.</span>
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  A visual timeline of your financial life. Predict gaps, manage subscriptions, and never miss a bill payment again. It's time travel for your money.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Check className="h-3 w-3" /></div>
                    <span>Subscription tracking & alerts</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Check className="h-3 w-3" /></div>
                    <span>Visual cashflow forecasting</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-md overflow-hidden p-8 shadow-2xl shadow-purple-900/20 group">
                   <div className="absolute inset-0 bg-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   {/* Calendar Grid Visual */}
                   <div className="grid grid-cols-7 gap-2 opacity-50">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className={`aspect-square rounded-md border border-white/5 ${i === 14 ? 'bg-purple-500/50 border-purple-500' : 'bg-zinc-900/5'}`} />
                      ))}
                   </div>

                   {/* Floating Events */}
                   <div className="absolute top-1/4 right-12 bg-zinc-800/90 border-l-4 border-red-500 p-3 rounded shadow-lg backdrop-blur transform rotate-3 group-hover:rotate-6 transition-transform">
                      <div className="text-xs font-bold text-white">Netflix Renewal</div>
                      <div className="text-[10px] text-zinc-400">Tomorrow</div>
                   </div>
                   
                   <div className="absolute bottom-1/3 left-12 bg-zinc-800/90 border-l-4 border-green-500 p-3 rounded shadow-lg backdrop-blur transform -rotate-2 group-hover:-rotate-3 transition-transform">
                      <div className="text-xs font-bold text-white">Salary Credit</div>
                      <div className="text-[10px] text-zinc-400">In 3 days</div>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 4: Circles (Reversed) - NEW */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24"
            >
              <div className="flex-1 text-left space-y-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400">
                  <Users className="h-4 w-4" /> Circles
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Split Bills, <br />
                  <span className="text-orange-400">Not Friendships.</span>
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Track shared expenses, manage group trips, and settle up with friends instantly. Keep your relationships free of financial friction.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400"><Check className="h-3 w-3" /></div>
                    <span>Group expense tracking</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400"><Check className="h-3 w-3" /></div>
                    <span>Instant settlement calculations</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl border border-white/10 bg-gradient-to-bl from-zinc-900/80 to-black/80 backdrop-blur-md overflow-hidden p-8 shadow-2xl shadow-orange-900/20 group">
                   <div className="absolute inset-0 bg-orange-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   {/* Circles Visualization */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Center User */}
                        <div className="relative z-10 h-20 w-20 rounded-full border-2 border-orange-500 bg-zinc-900 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                           <Users className="h-10 w-10 text-orange-500" />
                        </div>
                        
                        {/* Orbiting Friends */}
                        <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                           <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                           </div>
                           <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
                           </div>
                           <div className="absolute top-1/2 -left-16 -translate-y-1/2 h-12 w-12 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
                           </div>
                           <div className="absolute top-1/2 -right-16 -translate-y-1/2 h-12 w-12 rounded-full border border-white/20 bg-zinc-800 flex items-center justify-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600" />
                           </div>
                        </div>
                        
                        {/* Connecting Lines (Static SVG overlay) */}
                        <svg className="absolute inset-0 h-full w-full -z-10 overflow-visible opacity-30">
                           <circle cx="50%" cy="50%" r="64" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-orange-500/50" />
                        </svg>
                      </div>
                   </div>

                   {/* Floating Expense Bubble */}
                   <div className="absolute bottom-8 right-8 bg-zinc-900/90 border border-white/10 rounded-xl p-3 backdrop-blur-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-400">₹</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Dinner Split</div>
                          <div className="text-xs text-zinc-400">You owe ₹850</div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 5: Cards & Privacy (Original Orientation) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-12 md:gap-24"
            >
              <div className="flex-1 text-left space-y-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-pink-500/10 px-3 py-1 text-sm font-medium text-pink-400">
                  <CreditCard className="h-4 w-4" /> Cards & Privacy
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Master Your Credit. <br />
                  <span className="text-pink-400">Own Your Data.</span>
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  Track utilization across all your cards to maximize credit scores. All your data is encrypted and stored locally on your device—we can't see it even if we wanted to.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400"><Check className="h-3 w-3" /></div>
                    <span>Real-time credit utilization tracking</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400"><Check className="h-3 w-3" /></div>
                    <span>Local-first architecture (Zero Knowledge)</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-md overflow-hidden p-8 shadow-2xl shadow-pink-900/20 group">
                   <div className="absolute inset-0 bg-pink-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   {/* Floating Cards */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-48 w-72">
                        <div className="absolute top-0 left-0 h-full w-full rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 shadow-2xl transform -rotate-12 group-hover:-rotate-[15deg] transition-transform duration-500 z-10 flex flex-col justify-end p-6">
                           <div className="text-sm text-zinc-500 font-mono">**** **** **** 4242</div>
                           <div className="flex justify-between items-end mt-2">
                             <div className="text-xs text-zinc-400">PLATINUM</div>
                             <div className="h-8 w-12 bg-white/20 rounded-md" />
                           </div>
                        </div>
                        <div className="absolute top-0 left-0 h-full w-full rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 shadow-2xl transform rotate-6 group-hover:rotate-[10deg] transition-transform duration-500 z-0 flex flex-col justify-end p-6 opacity-80">
                           <div className="text-sm text-white/80 font-mono">**** **** **** 8888</div>
                        </div>
                      </div>
                   </div>

                   <div className="absolute top-8 right-8">
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                       <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-xs font-bold text-green-400">Encrypted</span>
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Security Section */}
          <div id="security" className="mt-32 w-full max-w-7xl mx-auto">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black/50 p-8 md:p-16 text-center"
             >
               <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
               <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
               
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400 mb-8">
                   <Lock className="h-4 w-4" /> Bank-Grade Security
                 </div>
                 
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                   Your data is <span className="text-cyan-400">yours alone.</span>
                 </h2>
                 <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12">
                   We built Finverse on a local-first architecture. Your financial data is encrypted on your device and only syncs when you say so. We couldn't sell your data even if we wanted to.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                   <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                     <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                       <Database className="h-5 w-5" />
                     </div>
                     <h3 className="text-lg font-semibold text-white mb-2">Local-First DB</h3>
                     <p className="text-sm text-zinc-400">
                       Your data lives on your device, not our servers. Instant load times, offline access, and complete ownership.
                     </p>
                   </div>

                   <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                     <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                       <Key className="h-5 w-5" />
                     </div>
                     <h3 className="text-lg font-semibold text-white mb-2">End-to-End Encrypted</h3>
                     <p className="text-sm text-zinc-400">
                       Syncing is protected by military-grade AES-256 encryption. Only you hold the decryption keys.
                     </p>
                   </div>

                   <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                     <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                       <EyeOff className="h-5 w-5" />
                     </div>
                     <h3 className="text-lg font-semibold text-white mb-2">Zero Tracking</h3>
                     <p className="text-sm text-zinc-400">
                       No ads, no trackers, no third-party analytics. Your financial habits are your business, not our product.
                     </p>
                   </div>
                 </div>
               </div>
             </motion.div>
          </div>

          {/* Pricing Preview Section */}
          <div className="mt-40 w-full mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-white md:text-5xl">
                Simple, transparent <span className="text-cyan-400">pricing.</span>
              </h2>
              <p className="mt-4 text-zinc-400">No hidden fees. No surprises.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Legacy Plan */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="relative rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-md"
               >
                 <div className="mb-4 text-lg font-medium text-zinc-400">Legacy</div>
                 <div className="mb-6 flex items-baseline gap-1">
                   <span className="text-4xl font-bold text-white">Free</span>
                 </div>
                 <ul className="mb-8 space-y-4 text-left">
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-zinc-500" /> <span>Basic Expense Tracking</span>
                   </li>
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-zinc-500" /> <span>Manual Imports</span>
                   </li>
                 </ul>
                 <Link href="/auth?mode=signup" className="block w-full rounded-xl bg-white/5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10">
                   Get Started
                 </Link>
               </motion.div>

               {/* Citizen Plan */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="relative rounded-3xl border border-cyan-500/30 bg-zinc-900/80 p-8 backdrop-blur-md shadow-2xl shadow-cyan-900/20"
               >
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 text-xs font-bold text-white">
                   MOST POPULAR
                 </div>
                 <div className="mb-4 text-lg font-medium text-cyan-400">Citizen</div>
                 <div className="mb-6 flex items-baseline gap-1">
                   <span className="text-4xl font-bold text-white">₹999</span>
                   <span className="text-sm text-zinc-400">/year</span>
                 </div>
                 <ul className="mb-8 space-y-4 text-left">
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-cyan-400" /> <span>Oracle AI Financial Strategist</span>
                   </li>
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-cyan-400" /> <span>TaxOS Optimization</span>
                   </li>
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-cyan-400" /> <span>Smart Calendar</span>
                   </li>
                 </ul>
                 <Link href="/auth?mode=signup" className="block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-105">
                   Start Free Trial
                 </Link>
               </motion.div>

               {/* Sovereign Plan */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
                 className="relative rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-md"
               >
                 <div className="mb-4 text-lg font-medium text-purple-400">Sovereign</div>
                 <div className="mb-6 flex items-baseline gap-1">
                   <span className="text-4xl font-bold text-white">₹4,999</span>
                   <span className="text-sm text-zinc-400">/lifetime</span>
                 </div>
                 <ul className="mb-8 space-y-4 text-left">
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-purple-400" /> <span>Everything in Citizen</span>
                   </li>
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-purple-400" /> <span>Priority Support</span>
                   </li>
                   <li className="flex items-center gap-3 text-zinc-300">
                     <Check className="h-4 w-4 text-purple-400" /> <span>Early Access Features</span>
                   </li>
                 </ul>
                 <Link href="/auth?mode=signup" className="block w-full rounded-xl bg-white/5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10">
                   Get Lifetime Access
                 </Link>
               </motion.div>
            </div>

            {/* Feature Comparison Table */}
            <div className="mt-24 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-12">Compare Plans</h2>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/30">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-900/50">
                      <th className="p-4 font-medium text-zinc-400">Feature</th>
                      <th className="p-4 font-medium text-white">Legacy (Free)</th>
                      <th className="p-4 font-medium text-cyan-400">Citizen (Paid)</th>
                      <th className="p-4 font-medium text-purple-400">Sovereign (Lifetime)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { name: "Manual Expense Tracking", legacy: true, citizen: true, sovereign: true },
                      { name: "Unlimited Accounts", legacy: true, citizen: true, sovereign: true },
                      { name: "Net Worth History", legacy: true, citizen: true, sovereign: true },
                      { name: "Local Data Backup", legacy: true, citizen: true, sovereign: true },
                      { name: "Ad-free Experience", legacy: true, citizen: true, sovereign: true },
                      { name: "Oracle AI Strategist", legacy: false, citizen: true, sovereign: true },
                      { name: "TaxOS Advanced Planning", legacy: false, citizen: true, sovereign: true },
                      { name: "Smart Calendar (Recurring)", legacy: false, citizen: true, sovereign: true },
                      { name: "Credit Card Maximizer", legacy: false, citizen: true, sovereign: true },
                      { name: "WhatsApp/Telegram Bot", legacy: false, citizen: true, sovereign: true },
                      { name: "Cross-Device Sync", legacy: false, citizen: true, sovereign: true },
                      { name: "Document Vault (Encrypted)", legacy: false, citizen: true, sovereign: true },
                      { name: "Priority Support", legacy: false, citizen: false, sovereign: true },
                      { name: "Early Access Beta", legacy: false, citizen: false, sovereign: true },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4 text-zinc-300">{row.name}</td>
                        <td className="p-4">
                          {row.legacy ? <Check className="h-4 w-4 text-zinc-500" /> : <span className="text-zinc-700">-</span>}
                        </td>
                        <td className="p-4">
                          {row.citizen ? <Check className="h-4 w-4 text-cyan-400" /> : <span className="text-zinc-700">-</span>}
                        </td>
                        <td className="p-4">
                          {row.sovereign ? <Check className="h-4 w-4 text-purple-400" /> : <span className="text-zinc-700">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>

        <footer className="mt-20 border-t border-white/10 py-12 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Finverse. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

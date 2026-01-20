"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, User, RefreshCw, Terminal } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

const SUGGESTIONS = [
  "What is my current net worth?",
  "How much debt do I have?",
  "Analyze my spending habits",
  "Suggest a tax saving strategy",
  "Can I afford a ₹50,000 vacation?",
];

export default function OraclePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Greetings. I am Oracle, your financial intelligence unit. I have full access to your financial metrics. I can now calculate affordability for major purchases. What would you like to analyze today?",
      timestamp: new Date(),
    },
  ]);

  // Access app state for "AI" context
  const { assets, loans, creditCards, transactions, profile, subscriptions } = useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateResponse = async (query: string) => {
    setIsTyping(true);
    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerQuery = query.toLowerCase();
    let response = "I'm processing that request, but my neural pathways are unsure. Could you rephrase?";

    // Basic heuristic "AI" logic
    if (lowerQuery.includes("net worth")) {
      const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
      const totalDebt = loans.reduce((sum, l) => sum + l.balance, 0) + creditCards.reduce((sum, c) => sum + c.balance, 0);
      const netWorth = totalAssets - totalDebt;
      response = `Based on your current data, your calculated Net Worth is ₹${netWorth.toLocaleString("en-IN")}. \n\nTotal Assets: ₹${totalAssets.toLocaleString("en-IN")}\nTotal Liabilities: ₹${totalDebt.toLocaleString("en-IN")}`;
    } else if (lowerQuery.includes("debt") || lowerQuery.includes("loan")) {
      const totalLoan = loans.reduce((sum, l) => sum + l.balance, 0);
      const cardDebt = creditCards.reduce((sum, c) => sum + c.balance, 0);
      response = `You currently hold a total debt of ₹${(totalLoan + cardDebt).toLocaleString("en-IN")}. \n\nLoans: ₹${totalLoan.toLocaleString("en-IN")}\nCredit Cards: ₹${cardDebt.toLocaleString("en-IN")}. \n\nI recommend prioritizing the highest interest debt first.`;
    } else if (lowerQuery.includes("spend") || lowerQuery.includes("expense")) {
      const recentTxns = transactions.slice(0, 5);
      response = `I've analyzed your recent transactions. Your last few expenses include:\n${recentTxns.map(t => `• ${t.description}: ₹${Math.abs(t.amount)}`).join("\n")}\n\nYour spending patterns suggest a focus on ${transactions[0]?.category || "general"} items recently.`;
    } else if (lowerQuery.includes("tax")) {
      response = "Tax optimization is critical. I recommend maximizing your Section 80C limits (₹1.5L) through ELSS or EPF. Have you checked the new 'Tax' module I recently enabled for you?";
    } else if (lowerQuery.includes("afford") || lowerQuery.includes("buy")) {
      // Extract amount
      const amountMatch = query.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
      const amountStr = amountMatch ? amountMatch[0].replace(/,/g, "") : null;
      
      if (amountStr) {
        const cost = parseFloat(amountStr);
        const liquidAssets = assets.filter(a => a.type === "cash" || a.type === "investment").reduce((s, a) => s + a.value, 0);
        const monthlySubs = subscriptions.reduce((s, sub) => s + sub.amount, 0); // rough monthly
        const buffer = monthlySubs * 6; // 6 month emergency fund logic
        
        const freeCash = liquidAssets - buffer;
        
        if (cost > liquidAssets) {
           response = `ANALYSIS: CRITICAL. \n\nYou cannot afford this purchase of ₹${cost.toLocaleString("en-IN")}. It exceeds your total liquid assets (₹${liquidAssets.toLocaleString("en-IN")}). Advise against purchase.`;
        } else if (cost > freeCash) {
           response = `ANALYSIS: CAUTION. \n\nYou have the funds (₹${liquidAssets.toLocaleString("en-IN")}), but buying this for ₹${cost.toLocaleString("en-IN")} would dip into your 6-month safety buffer (estimated need: ₹${buffer.toLocaleString("en-IN")}). \n\nProceed only if necessary.`;
        } else {
           response = `ANALYSIS: GREEN. \n\nYou can comfortably afford this purchase of ₹${cost.toLocaleString("en-IN")}. \n\nYou would still have ₹${(liquidAssets - cost).toLocaleString("en-IN")} in liquid assets, maintaining your safety net.`;
        }
      } else {
        response = "I can analyze affordability, but I need a price. Try asking 'Can I afford a ₹50,000 laptop?'";
      }
    } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      response = `Hello, ${profile?.name || "User"}. Ready to optimize your wealth?`;
    } else if (lowerQuery.includes("thank")) {
      response = "You are welcome. My protocols are designed to serve your financial growth.";
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "ai",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    generateResponse(currentInput);
  };

  const handleSuggestion = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    generateResponse(text);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 overflow-hidden rounded-3xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 bg-black/20 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Bot className="h-6 w-6 text-cyan-400" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white">ORACLE <span className="text-cyan-400">AI</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/70">Financial Intelligence Unit</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300"
          onClick={() => setMessages([messages[0]])}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-900/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[80%] items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  msg.role === "ai" 
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                    : "border-zinc-700 bg-zinc-800 text-zinc-400"
                }`}>
                  {msg.role === "ai" ? <Terminal className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`relative rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                  msg.role === "user"
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-sm border border-zinc-700"
                    : "bg-cyan-950/30 text-cyan-100 rounded-tl-sm border border-cyan-500/20"
                }`}>
                  <div className="whitespace-pre-wrap font-mono">{msg.content}</div>
                  <div className={`mt-1 text-[10px] opacity-40 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-500/50 bg-cyan-950/30 text-cyan-400">
               <Terminal className="h-4 w-4" />
             </div>
             <div className="flex items-center gap-1 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3">
               <motion.span 
                 animate={{ opacity: [0.4, 1, 0.4] }} 
                 transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                 className="h-1.5 w-1.5 rounded-full bg-cyan-400" 
               />
               <motion.span 
                 animate={{ opacity: [0.4, 1, 0.4] }} 
                 transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                 className="h-1.5 w-1.5 rounded-full bg-cyan-400" 
               />
               <motion.span 
                 animate={{ opacity: [0.4, 1, 0.4] }} 
                 transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                 className="h-1.5 w-1.5 rounded-full bg-cyan-400" 
               />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2">
        {messages.length === 1 && (
           <div className="mb-4 flex flex-wrap gap-2 justify-center">
             {SUGGESTIONS.map((s) => (
               <button
                 key={s}
                 onClick={() => handleSuggestion(s)}
                 className="rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-105"
               >
                 {s}
               </button>
             ))}
           </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-black/40 p-2 shadow-[0_0_20px_rgba(6,182,212,0.05)] transition-all focus-within:border-cyan-500/60 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="pl-3 text-cyan-500/50">
            <Sparkles className="h-5 w-5" />
          </div>
          <Input 
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Oracle about your finances..." 
            className="flex-1 border-none bg-transparent text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-10 w-10 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-2 text-center text-[10px] text-zinc-600">
          Oracle AI Protocol v2.1 • Encrypted & Secure
        </div>
      </div>
    </div>
  );
}
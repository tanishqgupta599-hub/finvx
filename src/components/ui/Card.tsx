"use client";

import { motion, HTMLMotionProps } from "framer-motion";

export function Card({ children, className, ...props }: { children: React.ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md shadow-lg transition-colors hover:border-cyan-500/30 ${className ?? ""}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className ?? ""}`}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-semibold leading-none tracking-tight ${className ?? ""}`}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 pt-0 ${className ?? ""}`}>{children}</div>;
}

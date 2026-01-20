import { twMerge } from "tailwind-merge";

export function Select({ value, onChange, children, className }: { value?: string; onChange?: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={twMerge("h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none ring-0 placeholder:text-zinc-600 transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50", className)}
    >
      {children}
    </select>
  );
}


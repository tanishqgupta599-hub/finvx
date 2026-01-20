import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={twMerge(
        "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none ring-0 placeholder:text-zinc-600 transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50",
        className
      )}
      {...props}
    />
  );
});


import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
    const base =
      "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-background";
    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-2",
    }[size];
    const variants = {
      primary: "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-400/50",
      secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
      ghost: "bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white",
    }[variant];
    return (
      <button
        ref={ref}
        className={twMerge(base, sizes, variants, className)}
        {...props}
      />
    );
  });

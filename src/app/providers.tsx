"use client";
import { ThemeProvider } from "next-themes";
import { AppToaster } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <AppToaster />
    </ThemeProvider>
  );
}

"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { useAppStore } from "@/state/app-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function FinvxLayout({ children }: { children: React.ReactNode }) {
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const demoDataEnabled = useAppStore((s) => s.demoDataEnabled);
  const profile = useAppStore((s) => s.profile);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Onboarding redirection disabled as per user request
  }, [onboardingCompleted, profile?.name, pathname, router, demoDataEnabled]);

  return <AppShell>{children}</AppShell>;
}

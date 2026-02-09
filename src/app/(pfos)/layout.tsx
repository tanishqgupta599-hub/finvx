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
    // Check if user needs onboarding
    // Skip if already on onboarding page or if profile has a name
    // Also skip if we are in demo mode (DB disconnected)
    if (pathname === "/onboarding" || demoDataEnabled) return;
    
    // If onboarding not completed and no name set, redirect to onboarding
    if (!onboardingCompleted && (!profile?.name || profile.name === "You" || profile.name === "User")) {
      router.push("/onboarding");
    }
  }, [onboardingCompleted, profile?.name, pathname, router, demoDataEnabled]);

  return <AppShell>{children}</AppShell>;
}

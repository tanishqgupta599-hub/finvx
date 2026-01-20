"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { useAuthStore } from "@/state/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FinverseLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      const target = pathname && pathname.startsWith("/") ? pathname : "/home";
      const search = new URLSearchParams({ redirect: target }).toString();
      router.replace(`/auth?${search}`);
    }
  }, [user, router, pathname]);

  if (!user) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}

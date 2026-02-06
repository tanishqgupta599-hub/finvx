"use client";

import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/state/app-store";
import { useEffect } from "react";

export function AuthenticatedDataFetcher() {
  const { user, isLoaded } = useUser();
  const syncUser = useAppStore((s) => s.syncUser);
  const fetchUserData = useAppStore((s) => s.fetchUserData);

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user with DB (ensure record exists)
      syncUser().then(() => {
        // Fetch full data
        fetchUserData();
      });
    }
  }, [isLoaded, user, syncUser, fetchUserData]);

  return null;
}

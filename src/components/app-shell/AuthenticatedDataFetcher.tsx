"use client";

import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/state/app-store";
import { useEffect } from "react";

export function AuthenticatedDataFetcher() {
  const { user, isLoaded } = useUser();
  const syncUser = useAppStore((s) => s.syncUser);
  const fetchUserData = useAppStore((s) => s.fetchUserData);
  const clearData = useAppStore((s) => s.clearData);

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      // 1. Security Check: If store has data from another user, wipe it immediately
      // accessing getState() directly to avoid dependency loops
      const currentStore = useAppStore.getState();
      const storedClerkId = currentStore.profile?.clerkId;
      
      if (storedClerkId && storedClerkId !== user.id) {
        console.log(`User switch detected (Store: ${storedClerkId} vs Auth: ${user.id}). Clearing data.`);
        clearData();
      }

      // 2. Sync and Fetch
      syncUser().then(() => {
        fetchUserData();
      });
    } else {
      // 3. User logged out: Clear data
      const currentStore = useAppStore.getState();
      // Only clear if we actually have data to avoid unnecessary renders
      if (currentStore.profile || currentStore.assets.length > 0) {
         console.log("User logged out. Clearing data.");
         clearData();
      }
    }
    // We only want to run this when the user ID changes (or login/logout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id, syncUser, fetchUserData, clearData]);

  return null;
}

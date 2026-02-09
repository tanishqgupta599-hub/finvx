"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

const STORAGE_KEY = "finverse-app-storage";

export function SessionGuard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    // Only run this logic in the browser
    if (typeof window === 'undefined') return;

    const rawStorage = localStorage.getItem(STORAGE_KEY);
    
    if (rawStorage) {
      try {
        const parsed = JSON.parse(rawStorage);
        const storedState = parsed.state;
        
        // If we have stored state but no user is loaded yet (and we are not sure if they are logged out)
        // We wait.
        if (!isLoaded) return;

        // If user is logged out, but we have sensitive data (like a profile with a clerkId)
        if (!user) {
           if (storedState?.profile?.clerkId && storedState.profile.clerkId !== "demo_user_clerk_id") {
             console.warn("SessionGuard: Found orphaned user data. Clearing storage.");
             localStorage.removeItem(STORAGE_KEY);
             // We can also reload to ensure memory is clean
             window.location.reload();
           }
           return;
        }

        // If user IS logged in
        if (user) {
          const storedClerkId = storedState?.profile?.clerkId;
          
          // If stored data belongs to a different user (and it's not the demo user)
          if (storedClerkId && storedClerkId !== user.id && storedClerkId !== "demo_user_clerk_id") {
            console.error(`SessionGuard: Data mismatch! Stored: ${storedClerkId}, Current: ${user.id}. Wiping data.`);
            
            // 1. Clear Storage
            localStorage.removeItem(STORAGE_KEY);
            
            // 2. Force Reload to re-initialize app with clean state
            window.location.reload();
          }
        }
      } catch (e) {
        // If storage is corrupted, clear it
        console.error("SessionGuard: Storage corrupted", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [user, isLoaded]);

  return null;
}

"use client";

import { useUser } from "@clerk/nextjs";

// This component only works if ClerkProvider is present
// Use this inside ClerkProvider, or use useSafeClerkUser instead
export function useClerkUserHook() {
  try {
    return useUser();
  } catch (error) {
    // If ClerkProvider is not present, return defaults
    return { user: null, isLoaded: true };
  }
}

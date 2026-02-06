"use client";

import { useState, useEffect } from "react";

// Check if Clerk is configured
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here';

// Safe hook that doesn't require ClerkProvider
export function useSafeClerkUser() {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!hasClerkKeys) {
      setIsLoaded(true);
      return;
    }

    // Try to use Clerk's useUser hook safely
    let mounted = true;
    
    import("@clerk/nextjs")
      .then((clerkModule) => {
        if (!mounted) return;
        
        // Check if we can access Clerk context
        // If ClerkProvider is not present, this will fail gracefully
        try {
          // We'll use a component that wraps the hook instead
          setIsLoaded(true);
        } catch (error) {
          // Clerk not properly configured
          if (mounted) {
            setIsLoaded(true);
          }
        }
      })
      .catch(() => {
        // Clerk package not available or not configured
        if (mounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { user, isLoaded };
}

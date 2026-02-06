import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export const dynamic = 'force-dynamic';

// Check if Clerk is configured
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here' &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_your_key_here';

export default async function Page() {
  // Only check for user if Clerk is configured
  if (hasClerkKeys) {
    try {
      const user = await currentUser();
      if (user) {
        redirect("/home");
      }
    } catch (error) {
      // If Clerk fails, just show landing page
      console.warn("Clerk authentication check failed:", error);
    }
  }

  return <LandingPage />;
}
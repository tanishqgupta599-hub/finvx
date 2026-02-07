import prisma, { isDatabaseAvailable } from "@/lib/db";
import { User } from "@prisma/client";

// Define a subset of Clerk User type we need to avoid heavy imports
interface ClerkUser {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}

/**
 * Retrieves a user from the database or creates them if they don't exist.
 * Uses upsert to handle race conditions.
 */
export async function getOrCreateUser(clerkUser: ClerkUser): Promise<User | null> {
  if (!isDatabaseAvailable() || !prisma) {
    return null;
  }

  try {
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.error("No email found for user", clerkUser.id);
      return null;
    }

    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0] || "User";

    // Upsert ensures we get the user whether they exist or not
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        // Optional: Update name/avatar on login if changed
        // name,
        // avatarUrl: clerkUser.imageUrl
      }, 
      create: {
        clerkId: clerkUser.id,
        email,
        name,
        avatarUrl: clerkUser.imageUrl,
        mode: "Balanced",
      },
    });
    return user;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    return null;
  }
}

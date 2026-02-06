import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function POST() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const email = user.emailAddresses[0]?.emailAddress;
    // Get name from Clerk - prefer firstName + lastName, fallback to email username
    const clerkName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const fallbackName = email?.split("@")[0] || "User";
    const name = clerkName || fallbackName;
    const avatarUrl = user.imageUrl;

    // Upsert user in database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email,
        name,
        avatarUrl,
        // Update other fields if necessary
      },
      create: {
        clerkId: user.id,
        email,
        name,
        avatarUrl,
        mode: "Balanced", // Default
      },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

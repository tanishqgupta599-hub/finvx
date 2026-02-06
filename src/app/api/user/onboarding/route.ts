import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.update({
        where: { clerkId: user.id },
        data: { onboardingCompleted: true }
    });
    
    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error updating onboarding status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

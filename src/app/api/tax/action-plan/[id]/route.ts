import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { isCompleted } = body;

    // 1. Get user ID from Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Find step and verify ownership
    const step = await prisma.taxActionStep.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    if (step.plan.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Update
    const updatedStep = await prisma.taxActionStep.update({
      where: { id },
      data: { isCompleted },
    });

    return NextResponse.json(updatedStep);
  } catch (error) {
    console.error("Failed to update tax step:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

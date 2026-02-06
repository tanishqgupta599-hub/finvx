import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { done } = await request.json();

    // Verify ownership via ActionItem -> User
    // We need to find the step and ensure its action item belongs to the user
    const step = await prisma.actionStep.findUnique({
      where: { id: params.id },
      include: {
        actionItem: true,
      },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    // Check if the action item belongs to the current user
    const actionItem = await prisma.actionItem.findUnique({
      where: { id: step.actionItemId },
    });

    if (!actionItem) {
       return NextResponse.json({ error: "Action Item not found" }, { status: 404 });
    }

    // Verify user ownership
    // We need to fetch the user from DB to compare IDs, or rely on Clerk ID mapping
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser || actionItem.userId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedStep = await prisma.actionStep.update({
      where: { id: params.id },
      data: {
        done: done,
      },
    });

    // Also update the parent ActionItem status if needed
    // Logic: if all steps done -> done, if some -> in_progress, else new
    const allSteps = await prisma.actionStep.findMany({
      where: { actionItemId: actionItem.id },
    });
    
    const allDone = allSteps.every((s) => s.done);
    const anyDone = allSteps.some((s) => s.done);
    const newStatus = allDone ? "done" : anyDone ? "in_progress" : "new";

    if (actionItem.status !== newStatus) {
        await prisma.actionItem.update({
            where: { id: actionItem.id },
            data: { status: newStatus }
        });
    }

    return NextResponse.json(updatedStep);
  } catch (error) {
    console.error("Error updating action step:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

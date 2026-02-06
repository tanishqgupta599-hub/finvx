import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get a single expense circle
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const circle = await prisma.expenseCircle.findFirst({
      where: {
        id,
        OR: [
          { ownerId: dbUser.id },
          { members: { some: { id: dbUser.id } } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        expenses: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Calculate balances for each member
    const balances: Record<string, number> = {};
    circle.members.forEach((member) => {
      balances[member.id] = 0;
    });
    balances[circle.owner.id] = 0;

    circle.expenses.forEach((expense) => {
      const paidBy = expense.paidById;
      const amount = Number(expense.amount);
      const splitType = expense.splitType;

      if (splitType === "equal") {
        const totalMembers = circle.members.length + 1; // +1 for owner
        const perPerson = amount / totalMembers;
        
        // Person who paid gets credited
        balances[paidBy] = (balances[paidBy] || 0) + amount;
        
        // Everyone else owes their share
        circle.members.forEach((member) => {
          if (member.id !== paidBy) {
            balances[member.id] = (balances[member.id] || 0) - perPerson;
          }
        });
        if (circle.owner.id !== paidBy) {
          balances[circle.owner.id] = (balances[circle.owner.id] || 0) - perPerson;
        }
      }
    });

    return NextResponse.json({
      ...circle,
      balances,
    });
  } catch (error) {
    console.error("Error fetching expense circle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH - Update an expense circle
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
    const { name, description, emoji, memberIds } = body;

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const circle = await prisma.expenseCircle.findFirst({
      where: {
        id,
        ownerId: dbUser.id, // Only owner can update
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found or unauthorized" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (emoji !== undefined) updateData.emoji = emoji;

    const updatedCircle = await prisma.expenseCircle.update({
      where: { id },
      data: {
        ...updateData,
        ...(memberIds !== undefined && {
          members: {
            set: memberIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCircle);
  } catch (error) {
    console.error("Error updating expense circle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an expense circle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const circle = await prisma.expenseCircle.findFirst({
      where: {
        id,
        ownerId: dbUser.id, // Only owner can delete
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found or unauthorized" }, { status: 404 });
    }

    await prisma.expenseCircle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Circle deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense circle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

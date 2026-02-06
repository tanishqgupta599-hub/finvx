import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { GoalType, GoalPriority } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Fetch all goals
export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: dbUser.id },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
      ],
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new goal
export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, type, targetAmount, currentAmount, dueDate, priority } = body;

    if (!title || !type || targetAmount === undefined || currentAmount === undefined || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: dbUser.id,
        title,
        type: type as GoalType,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority as GoalPriority,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

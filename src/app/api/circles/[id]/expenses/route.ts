import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get all expenses in a circle
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
        id: id,
        OR: [
          { ownerId: dbUser.id },
          { members: { some: { id: dbUser.id } } },
        ],
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const expenses = await prisma.sharedExpense.findMany({
      where: { circleId: id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Add an expense to a circle
export async function POST(
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
    const { amount, description, paidById, splitType, date } = body;

    if (!amount || !description || !paidById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
        id: id,
        OR: [
          { ownerId: dbUser.id },
          { members: { some: { id: dbUser.id } } },
        ],
      },
      include: {
        members: true,
        owner: true,
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Verify paidById is either owner or member
    const allMembers = [circle.owner.id, ...circle.members.map((m) => m.id)];
    if (!allMembers.includes(paidById)) {
      return NextResponse.json(
        { error: "Payer must be a member of the circle" },
        { status: 400 }
      );
    }

    const expense = await prisma.sharedExpense.create({
      data: {
        circleId: id,
        paidById,
        amount: Number(amount),
        description,
        splitType: splitType || "equal",
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable, toObjectId } from "@/lib/mongo";

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
    if (isMongoAvailable()) {
      const circlesCol = await getCollection<any>("circles");
      const expensesCol = await getCollection<any>("sharedExpenses");
      if (!circlesCol || !expensesCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const circleDoc = await circlesCol.findOne(
        oid
          ? { _id: oid, $or: [{ ownerClerkId: user.id }, { memberClerkIds: user.id }] }
          : { _id: id as any, $or: [{ ownerClerkId: user.id }, { memberClerkIds: user.id }] }
      );
      if (!circleDoc) {
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
      }
      const expenses = await expensesCol.find({ circleId: (circleDoc._id as any).toString() }).sort({ date: -1 }).toArray();
      return NextResponse.json(expenses);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const circle = await prisma.expenseCircle.findFirst({
      where: { id: id, OR: [{ ownerId: dbUser.id }, { members: { some: { id: dbUser.id } } }] },
    });
    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }
    const expenses = await prisma.sharedExpense.findMany({ where: { circleId: id }, orderBy: { date: "desc" } });

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

    if (isMongoAvailable()) {
      const circlesCol = await getCollection<any>("circles");
      const expensesCol = await getCollection<any>("sharedExpenses");
      if (!circlesCol || !expensesCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const circleDoc = await circlesCol.findOne(
        oid
          ? { _id: oid, $or: [{ ownerClerkId: user.id }, { memberClerkIds: user.id }] }
          : { _id: id as any, $or: [{ ownerClerkId: user.id }, { memberClerkIds: user.id }] }
      );
      if (!circleDoc) {
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
      }
      const allMembers = [circleDoc.ownerClerkId, ...(circleDoc.memberClerkIds || [])];
      if (!allMembers.includes(paidById)) {
        return NextResponse.json({ error: "Payer must be a member of the circle" }, { status: 400 });
      }
      const doc = {
        circleId: (circleDoc._id as any).toString(),
        paidById,
        amount: Number(amount),
        description,
        splitType: splitType || "equal",
        date: date ? new Date(date) : new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await expensesCol.insertOne(doc);
      const expense = await expensesCol.findOne({ _id: res.insertedId });
      return NextResponse.json(expense);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const circle = await prisma.expenseCircle.findFirst({
      where: { id: id, OR: [{ ownerId: dbUser.id }, { members: { some: { id: dbUser.id } } }] },
      include: { members: true, owner: true },
    });
    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }
    const allMembers = [circle.owner.id, ...circle.members.map((m) => m.id)];
    if (!allMembers.includes(paidById)) {
      return NextResponse.json({ error: "Payer must be a member of the circle" }, { status: 400 });
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

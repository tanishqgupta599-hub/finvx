import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";

export const dynamic = "force-dynamic";

// GET - Fetch all expense circles
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isMongoAvailable()) {
      const circlesCol = await getCollection<any>("circles");
      const expensesCol = await getCollection<any>("sharedExpenses");
      if (!circlesCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const circles = await circlesCol
        .find({ $or: [{ ownerClerkId: user.id }, { memberClerkIds: user.id }] })
        .sort({ updatedAt: -1 })
        .toArray();
      const withDetails = await Promise.all(
        circles.map(async (c: any) => {
          const expenses = expensesCol
            ? await expensesCol.find({ circleId: c._id.toString() }).sort({ date: -1 }).toArray()
            : [];
          return {
            id: c._id,
            name: c.name,
            description: c.description || null,
            emoji: c.emoji || null,
            owner: { id: c.ownerClerkId, name: null, email: null },
            members: (c.memberClerkIds || []).map((cid: string) => ({ id: cid, name: null, email: null })),
            expenses,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          };
        })
      );
      return NextResponse.json(withDetails);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const circles = await prisma.expenseCircle.findMany({
      where: { OR: [{ ownerId: dbUser.id }, { members: { some: { id: dbUser.id } } }] },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
        expenses: {
          include: { circle: { select: { name: true } } },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(circles);
  } catch (error) {
    console.error("Error fetching expense circles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create a new expense circle
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, emoji, memberIds } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (isMongoAvailable()) {
      const circlesCol = await getCollection<any>("circles");
      if (!circlesCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const doc = {
        ownerClerkId: user.id,
        name,
        description: description || null,
        emoji: emoji || null,
        memberClerkIds: Array.isArray(memberIds) ? memberIds : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await circlesCol.insertOne(doc);
      const circle = await circlesCol.findOne({ _id: res.insertedId });
      return NextResponse.json({
        id: circle!._id,
        name: circle!.name,
        description: circle!.description,
        emoji: circle!.emoji,
        owner: { id: circle!.ownerClerkId, name: null, email: null },
        members: (circle!.memberClerkIds || []).map((cid: string) => ({ id: cid, name: null, email: null })),
        createdAt: circle!.createdAt,
        updatedAt: circle!.updatedAt,
      });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const circle = await prisma.expenseCircle.create({
      data: {
        ownerId: dbUser.id,
        name,
        description: description || null,
        emoji: emoji || null,
        members: { connect: memberIds ? memberIds.map((id: string) => ({ id })) : [] },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(circle);
  } catch (error) {
    console.error("Error creating expense circle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

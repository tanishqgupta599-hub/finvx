import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";

export const dynamic = "force-dynamic";

// GET - Fetch all friends
export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isMongoAvailable()) {
      const friendsCol = await getCollection<any>("friends");
      if (!friendsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const friends = await friendsCol.find({ clerkId: user.id }).sort({ name: 1 }).toArray();
      const totalOwed = friends.filter((f: any) => Number(f.balance || 0) > 0).reduce((sum: number, f: any) => sum + Number(f.balance || 0), 0);
      const totalOwing = friends.filter((f: any) => Number(f.balance || 0) < 0).reduce((sum: number, f: any) => sum + Math.abs(Number(f.balance || 0)), 0);
      return NextResponse.json({
        friends,
        summary: { total: friends.length, totalOwed, totalOwing, netBalance: totalOwed - totalOwing },
      });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const friends = await prisma.friend.findMany({ where: { userId: dbUser.id }, orderBy: { name: "asc" } });

    // Calculate total owed/owing
    const totalOwed = friends.filter((f) => Number(f.balance) > 0).reduce((sum, f) => sum + Number(f.balance), 0);
    const totalOwing = friends.filter((f) => Number(f.balance) < 0).reduce((sum, f) => sum + Math.abs(Number(f.balance)), 0);

    return NextResponse.json({
      friends,
      summary: {
        total: friends.length,
        totalOwed,
        totalOwing,
        netBalance: totalOwed - totalOwing,
      },
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new friend
export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, relationType, balance } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isMongoAvailable()) {
      try {
        const friendsCol = await getCollection<any>("friends");
        if (!friendsCol) {
          // fall through to Prisma below
          throw new Error("Mongo collection unavailable");
        }
        const doc = {
          clerkId: user.id,
          name,
          email,
          phone,
          relationType: relationType || "friend",
          balance: balance ? Number(balance) : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const res = await friendsCol.insertOne(doc);
        const friend = await friendsCol.findOne({ _id: res.insertedId });
        return NextResponse.json(friend);
      } catch {
        // Fallback to Prisma
      }
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const friend = await prisma.friend.create({
      data: {
        userId: dbUser.id,
        name,
        email,
        phone,
        relationType: relationType || "friend",
        balance: balance ? Number(balance) : 0,
      },
    });

    return NextResponse.json(friend);
  } catch (error) {
    console.error("Error creating friend:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

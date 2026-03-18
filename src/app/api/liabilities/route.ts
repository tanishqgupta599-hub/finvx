import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";
import { LiabilityType } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Fetch all liabilities
export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isMongoAvailable()) {
      const liabsCol = await getCollection<any>("liabilities");
      if (!liabsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const liabilities = await liabsCol.find({ clerkId: user.id }).sort({ balance: -1 }).toArray();
      const totalBalance = liabilities.reduce((sum: number, liab: any) => sum + Number(liab.balance || 0), 0);
      return NextResponse.json({ liabilities, summary: { total: liabilities.length, totalBalance } });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const liabilities = await prisma.liability.findMany({ where: { userId: dbUser.id }, orderBy: { balance: "desc" } });

    const totalBalance = liabilities.reduce((sum, liab) => sum + Number(liab.balance), 0);

    return NextResponse.json({
      liabilities,
      summary: {
        total: liabilities.length,
        totalBalance,
      },
    });
  } catch (error) {
    console.error("Error fetching liabilities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new liability
export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, balance, apr } = body;

    if (!name || balance === undefined || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isMongoAvailable()) {
      const liabsCol = await getCollection<any>("liabilities");
      if (!liabsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const doc = {
        clerkId: user.id,
        name,
        type,
        balance: Number(balance),
        apr: apr ? Number(apr) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await liabsCol.insertOne(doc);
      const liability = await liabsCol.findOne({ _id: res.insertedId });
      return NextResponse.json(liability);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const liability = await prisma.liability.create({
      data: {
        userId: dbUser.id,
        name,
        type: type as LiabilityType,
        balance: Number(balance),
        apr: apr ? Number(apr) : null,
      },
    });

    return NextResponse.json(liability);
  } catch (error) {
    console.error("Error creating liability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

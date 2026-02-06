import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch all investments with portfolio summary
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
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // For now, we'll use Asset model with type=investment
    // In production, you'd use the Investment model from schema extensions
    const investments = await prisma.asset.findMany({
      where: {
        userId: dbUser.id,
        type: "investment",
      },
      orderBy: { value: "desc" },
    });

    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.value), 0);

    return NextResponse.json({
      investments,
      portfolio: {
        totalInvested,
        count: investments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create a new investment
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, value, institution, symbol, quantity, purchasePrice, purchaseDate, isSIP, sipAmount } = body;

    if (!name || !type || value === undefined) {
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

    const investment = await prisma.asset.create({
      data: {
        userId: dbUser.id,
        name,
        type: "investment", // Using Asset model for now
        value: Number(value),
        institution: institution || null,
      },
    });

    return NextResponse.json(investment);
  } catch (error) {
    console.error("Error creating investment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

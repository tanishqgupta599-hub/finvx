import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch all business expenses
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Using Transaction model with category filter for business expenses
    // In production, use BusinessExpense model from schema extensions
    const where: any = {
      userId: dbUser.id,
      category: "other", // Business expenses can be marked
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (category) {
      where.description = { contains: category };
    }

    const expenses = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const total = expenses.reduce((sum, exp) => sum + Math.abs(Number(exp.amount)), 0);
    const taxDeductible = expenses
      .filter((exp) => exp.description.toLowerCase().includes("business") || exp.description.toLowerCase().includes("office"))
      .reduce((sum, exp) => sum + Math.abs(Number(exp.amount)), 0);

    return NextResponse.json({
      expenses,
      summary: {
        total,
        taxDeductible,
        count: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching business expenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create a business expense
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { description, amount, category, vendor, date, isTaxDeductible } = body;

    if (!description || amount === undefined) {
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

    // Create as transaction with business marker
    const expense = await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        description: `[BUSINESS] ${description}${vendor ? ` - ${vendor}` : ""}`,
        amount: -Math.abs(Number(amount)), // Negative for expense
        category: "other",
        date: date ? new Date(date) : new Date(),
        account: category || "Business",
      },
    });

    return NextResponse.json({
      ...expense,
      isTaxDeductible: isTaxDeductible || false,
      vendor: vendor || null,
    });
  } catch (error) {
    console.error("Error creating business expense:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

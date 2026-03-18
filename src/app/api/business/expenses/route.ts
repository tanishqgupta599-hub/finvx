import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";

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

    if (isMongoAvailable()) {
      const txCol = await getCollection<any>("transactions");
      if (!txCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const query: any = { clerkId: user.id, category: "other" };
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      if (category) {
        query.description = { $regex: category, $options: "i" };
      }
      const expenses = await txCol.find(query).sort({ date: -1 }).toArray();
      const total = expenses.reduce((sum: number, exp: any) => sum + Math.abs(Number(exp.amount || 0)), 0);
      const taxDeductible = expenses
        .filter((exp: any) => String(exp.description || "").toLowerCase().includes("business") || String(exp.description || "").toLowerCase().includes("office"))
        .reduce((sum: number, exp: any) => sum + Math.abs(Number(exp.amount || 0)), 0);
      return NextResponse.json({
        expenses,
        summary: { total, taxDeductible, count: expenses.length },
      });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const where: any = { userId: dbUser.id, category: "other" };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (category) {
      where.description = { contains: category };
    }
    const expenses = await prisma.transaction.findMany({ where, orderBy: { date: "desc" } });

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

    if (isMongoAvailable()) {
      try {
        const txCol = await getCollection<any>("transactions");
        if (!txCol) {
          throw new Error("Mongo collection unavailable");
        }
        const doc = {
          clerkId: user.id,
          description: `[BUSINESS] ${description}${vendor ? ` - ${vendor}` : ""}`,
          amount: -Math.abs(Number(amount)),
          category: "other",
          date: date ? new Date(date) : new Date(),
          account: category || "Business",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isTaxDeductible: isTaxDeductible || false,
          vendor: vendor || null,
        };
        const res = await txCol.insertOne(doc);
        const expense = await txCol.findOne({ _id: res.insertedId });
        return NextResponse.json(expense);
      } catch {
        // fallback to Prisma below
      }
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const expense = await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        description: `[BUSINESS] ${description}${vendor ? ` - ${vendor}` : ""}`,
        amount: -Math.abs(Number(amount)),
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

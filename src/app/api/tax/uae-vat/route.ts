import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Calculate UAE VAT
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    const quarter = searchParams.get("quarter");

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get transactions for the period
    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year), 11, 31);
    
    if (quarter) {
      const q = parseInt(quarter);
      startDate.setMonth((q - 1) * 3);
      endDate.setMonth(q * 3 - 1);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
        category: "spending",
      },
    });

    // UAE VAT is 5% on most goods and services
    const vatRate = 0.05;
    const totalSpending = transactions.reduce(
      (sum, tx) => sum + Math.abs(Number(tx.amount)),
      0
    );

    // Assume all spending is VAT-eligible (in production, categorize)
    const vatIncluded = totalSpending;
    const vatAmount = vatIncluded * (vatRate / (1 + vatRate)); // VAT included in price
    const baseAmount = vatIncluded - vatAmount;

    return NextResponse.json({
      period: {
        year: parseInt(year),
        quarter: quarter ? parseInt(quarter) : null,
      },
      vat: {
        rate: (vatRate * 100).toFixed(0) + "%",
        totalSpending: totalSpending.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        baseAmount: baseAmount.toFixed(2),
      },
      breakdown: {
        totalTransactions: transactions.length,
        averageTransaction: (totalSpending / transactions.length).toFixed(2),
      },
      filing: {
        dueDate: calculateVATDueDate(parseInt(year), quarter ? parseInt(quarter) : null),
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error calculating UAE VAT:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function calculateVATDueDate(year: number, quarter: number | null): string {
  // UAE VAT returns are due 28 days after quarter end
  if (quarter) {
    const quarterEnd = new Date(year, quarter * 3, 0);
    const dueDate = new Date(quarterEnd);
    dueDate.setDate(dueDate.getDate() + 28);
    return dueDate.toISOString().split("T")[0];
  }
  // Annual return
  const yearEnd = new Date(year, 11, 31);
  const dueDate = new Date(yearEnd);
  dueDate.setDate(dueDate.getDate() + 28);
  return dueDate.toISOString().split("T")[0];
}

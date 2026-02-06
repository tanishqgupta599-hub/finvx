import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get merchant-level analytics
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit") || "10";

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const where: any = {
      userId: dbUser.id,
      category: "spending",
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    // Extract merchants from descriptions
    const merchantSpending: Record<string, { amount: number; count: number; lastTransaction: Date }> = {};
    
    transactions.forEach((tx) => {
      // Simple merchant extraction (in production, use better parsing)
      const merchant = extractMerchant(tx.description);
      if (merchant) {
        if (!merchantSpending[merchant]) {
          merchantSpending[merchant] = {
            amount: 0,
            count: 0,
            lastTransaction: new Date(tx.date),
          };
        }
        merchantSpending[merchant].amount += Math.abs(Number(tx.amount));
        merchantSpending[merchant].count += 1;
        if (new Date(tx.date) > merchantSpending[merchant].lastTransaction) {
          merchantSpending[merchant].lastTransaction = new Date(tx.date);
        }
      }
    });

    // Sort by amount and get top merchants
    const topMerchants = Object.entries(merchantSpending)
      .map(([merchant, data]) => ({
        merchant,
        totalSpent: data.amount.toFixed(2),
        transactionCount: data.count,
        averageTransaction: (data.amount / data.count).toFixed(2),
        lastTransaction: data.lastTransaction.toISOString(),
      }))
      .sort((a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent))
      .slice(0, parseInt(limit));

    const totalSpending = topMerchants.reduce(
      (sum, m) => sum + parseFloat(m.totalSpent),
      0
    );

    return NextResponse.json({
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      topMerchants,
      summary: {
        totalMerchants: Object.keys(merchantSpending).length,
        totalSpending: totalSpending.toFixed(2),
        averagePerMerchant: (totalSpending / topMerchants.length).toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching merchant analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function extractMerchant(description: string): string | null {
  // Simple merchant extraction
  // In production, use better NLP or merchant database
  const commonPatterns = [
    /^([A-Z\s]+)\s/, // Uppercase merchant names
    /at\s+([A-Z\s]+)/i, // "at MERCHANT"
    /([A-Z][a-z]+\s+[A-Z][a-z]+)/, // Title Case names
  ];

  for (const pattern of commonPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback: use first few words
  const words = description.split(/\s+/).slice(0, 3);
  return words.length > 0 ? words.join(" ") : null;
}

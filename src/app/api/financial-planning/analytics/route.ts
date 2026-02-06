import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get financial analytics and trends
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "6months"; // 1month, 3months, 6months, 1year

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case "1month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Group by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((tx) => {
      const monthKey = new Date(tx.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      if (tx.category === "income") {
        monthlyData[monthKey].income += Number(tx.amount);
      } else if (tx.category === "spending") {
        monthlyData[monthKey].expenses += Math.abs(Number(tx.amount));
      }
    });

    // Calculate trends
    const months = Object.keys(monthlyData).sort();
    const incomeTrend = months.length > 1
      ? ((monthlyData[months[months.length - 1]].income - monthlyData[months[0]].income) / monthlyData[months[0]].income) * 100
      : 0;
    const expenseTrend = months.length > 1
      ? ((monthlyData[months[months.length - 1]].expenses - monthlyData[months[0]].expenses) / monthlyData[months[0]].expenses) * 100
      : 0;

    // Spending by category
    const spendingByCategory: Record<string, number> = {};
    transactions
      .filter((tx) => tx.category === "spending")
      .forEach((tx) => {
        const category = tx.category;
        spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(Number(tx.amount));
      });

    // Top spending categories
    const topCategories = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Average monthly income and expenses
    const avgMonthlyIncome = months.length > 0
      ? months.reduce((sum, month) => sum + monthlyData[month].income, 0) / months.length
      : 0;
    const avgMonthlyExpenses = months.length > 0
      ? months.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / months.length
      : 0;

    // Predictions (simple linear projection)
    const lastMonthIncome = monthlyData[months[months.length - 1]]?.income || 0;
    const lastMonthExpenses = monthlyData[months[months.length - 1]]?.expenses || 0;
    const projectedSavings = lastMonthIncome - lastMonthExpenses;

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      monthlyBreakdown: months.map((month) => ({
        month,
        ...monthlyData[month],
        savings: monthlyData[month].income - monthlyData[month].expenses,
      })),
      trends: {
        income: {
          value: incomeTrend.toFixed(2) + "%",
          direction: incomeTrend > 0 ? "up" : incomeTrend < 0 ? "down" : "stable",
        },
        expenses: {
          value: expenseTrend.toFixed(2) + "%",
          direction: expenseTrend > 0 ? "up" : expenseTrend < 0 ? "down" : "stable",
        },
      },
      averages: {
        monthlyIncome: avgMonthlyIncome,
        monthlyExpenses: avgMonthlyExpenses,
        monthlySavings: avgMonthlyIncome - avgMonthlyExpenses,
      },
      spending: {
        byCategory: spendingByCategory,
        topCategories,
        total: transactions
          .filter((tx) => tx.category === "spending")
          .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0),
      },
      projections: {
        nextMonthSavings: projectedSavings,
        annualSavings: projectedSavings * 12,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

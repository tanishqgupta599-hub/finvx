import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get comprehensive financial overview
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

    // Fetch all financial data in parallel
    const [
      assets,
      liabilities,
      loans,
      creditCards,
      transactions,
      goals,
      subscriptions,
      incomeStreams,
    ] = await Promise.all([
      prisma.asset.findMany({ where: { userId: dbUser.id } }),
      prisma.liability.findMany({ where: { userId: dbUser.id } }),
      prisma.loan.findMany({ where: { userId: dbUser.id } }),
      prisma.creditCard.findMany({ where: { userId: dbUser.id } }),
      prisma.transaction.findMany({
        where: { userId: dbUser.id },
        take: 100,
        orderBy: { date: "desc" },
      }),
      prisma.goal.findMany({ where: { userId: dbUser.id } }),
      prisma.subscription.findMany({ where: { userId: dbUser.id } }),
      prisma.incomeStream.findMany({ where: { userId: dbUser.id } }),
    ]);

    // Calculate net worth
    const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
    const totalLiabilities = liabilities.reduce((sum, liab) => sum + Number(liab.balance), 0);
    const totalLoanBalance = loans.reduce((sum, loan) => sum + Number(loan.balance), 0);
    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + Number(card.balance), 0);
    const totalDebt = totalLiabilities + totalLoanBalance + totalCreditCardDebt;
    const netWorth = totalAssets - totalDebt;

    // Calculate monthly income
    const monthlyIncome = incomeStreams.reduce((sum, stream) => {
      let monthly = Number(stream.amount);
      if (stream.frequency === "yearly") monthly = monthly / 12;
      else if (stream.frequency === "weekly") monthly = monthly * 4.33;
      return sum + monthly;
    }, 0);

    // Calculate monthly expenses from transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = transactions.filter(
      (tx) => new Date(tx.date) >= thirtyDaysAgo && tx.category === "spending"
    );
    const monthlyExpenses = recentTransactions.reduce(
      (sum, tx) => sum + Math.abs(Number(tx.amount)),
      0
    );

    // Calculate monthly subscription costs
    const monthlySubscriptions = subscriptions.reduce((sum, sub) => {
      let monthly = Number(sub.amount);
      if (sub.cadence === "yearly") monthly = monthly / 12;
      else if (sub.cadence === "weekly") monthly = monthly * 4.33;
      return sum + monthly;
    }, 0);

    // Calculate savings rate
    const totalMonthlyExpenses = monthlyExpenses + monthlySubscriptions;
    const monthlySavings = monthlyIncome - totalMonthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    // Goal progress
    const goalsProgress = goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      progress: (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      remaining: Number(goal.targetAmount) - Number(goal.currentAmount),
      dueDate: goal.dueDate,
      priority: goal.priority,
    }));

    // Spending by category (last 30 days)
    const spendingByCategory: Record<string, number> = {};
    recentTransactions.forEach((tx) => {
      const category = tx.category;
      spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(Number(tx.amount));
    });

    // Debt-to-income ratio
    const annualIncome = monthlyIncome * 12;
    const debtToIncomeRatio = annualIncome > 0 ? (totalDebt / annualIncome) * 100 : 0;

    // Emergency fund calculation (3-6 months expenses)
    const recommendedEmergencyFund = totalMonthlyExpenses * 6;
    const currentEmergencyFund = assets
      .filter((a) => a.type === "cash")
      .reduce((sum, asset) => sum + Number(asset.value), 0);
    const emergencyFundStatus = (currentEmergencyFund / recommendedEmergencyFund) * 100;

    return NextResponse.json({
      netWorth: {
        total: netWorth,
        assets: totalAssets,
        debt: totalDebt,
        breakdown: {
          assets: totalAssets,
          liabilities: totalLiabilities,
          loans: totalLoanBalance,
          creditCards: totalCreditCardDebt,
        },
      },
      cashFlow: {
        monthlyIncome,
        monthlyExpenses: totalMonthlyExpenses,
        monthlySavings,
        savingsRate: savingsRate.toFixed(2) + "%",
        breakdown: {
          transactions: monthlyExpenses,
          subscriptions: monthlySubscriptions,
        },
      },
      debt: {
        total: totalDebt,
        breakdown: {
          liabilities: totalLiabilities,
          loans: totalLoanBalance,
          creditCards: totalCreditCardDebt,
        },
        debtToIncomeRatio: debtToIncomeRatio.toFixed(2) + "%",
      },
      goals: {
        total: goals.length,
        progress: goalsProgress,
        onTrack: goalsProgress.filter((g) => g.progress >= 50).length,
      },
      emergencyFund: {
        current: currentEmergencyFund,
        recommended: recommendedEmergencyFund,
        status: emergencyFundStatus.toFixed(2) + "%",
        monthsCovered: totalMonthlyExpenses > 0 ? (currentEmergencyFund / totalMonthlyExpenses).toFixed(1) : "0",
      },
      spending: {
        byCategory: spendingByCategory,
        total: monthlyExpenses,
      },
      insights: generateInsights({
        savingsRate,
        debtToIncomeRatio,
        emergencyFundStatus,
        goalsProgress,
        totalDebt,
      }),
    });
  } catch (error) {
    console.error("Error fetching financial overview:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function generateInsights(data: {
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundStatus: number;
  goalsProgress: any[];
  totalDebt: number;
}) {
  const insights = [];

  if (data.savingsRate < 0) {
    insights.push({
      type: "warning",
      title: "Negative Savings Rate",
      message: "You're spending more than you earn. Consider reviewing your expenses.",
      priority: "high",
    });
  } else if (data.savingsRate < 20) {
    insights.push({
      type: "info",
      title: "Low Savings Rate",
      message: `Your savings rate is ${data.savingsRate.toFixed(1)}%. Aim for at least 20% for better financial health.`,
      priority: "medium",
    });
  }

  if (data.debtToIncomeRatio > 36) {
    insights.push({
      type: "warning",
      title: "High Debt-to-Income Ratio",
      message: `Your debt-to-income ratio is ${data.debtToIncomeRatio.toFixed(1)}%. Lenders typically prefer ratios below 36%.`,
      priority: "high",
    });
  }

  if (data.emergencyFundStatus < 50) {
    insights.push({
      type: "warning",
      title: "Insufficient Emergency Fund",
      message: "Build your emergency fund to cover 3-6 months of expenses for financial security.",
      priority: "high",
    });
  }

  if (data.totalDebt > 0) {
    insights.push({
      type: "suggestion",
      title: "Debt Management",
      message: "Consider creating a debt payoff plan to reduce your total debt.",
      priority: "medium",
    });
  }

  const behindGoals = data.goalsProgress.filter((g) => {
    if (!g.dueDate) return false;
    const daysRemaining = (new Date(g.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    const monthsRemaining = daysRemaining / 30;
    const requiredMonthly = g.remaining / monthsRemaining;
    return requiredMonthly > 0 && monthsRemaining < 12;
  });

  if (behindGoals.length > 0) {
    insights.push({
      type: "warning",
      title: "Goals Behind Schedule",
      message: `${behindGoals.length} goal(s) may need attention to stay on track.`,
      priority: "medium",
    });
  }

  return insights;
}

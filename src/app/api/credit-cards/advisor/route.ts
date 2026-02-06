import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get credit card recommendations and insights
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

    const creditCards = await prisma.creditCard.findMany({
      where: { userId: dbUser.id },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: dbUser.id,
        category: "spending",
      },
      take: 100,
      orderBy: { date: "desc" },
    });

    // Calculate total spending by category
    const spendingByCategory: Record<string, number> = {};
    transactions.forEach((tx) => {
      const category = tx.description.toLowerCase();
      spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(Number(tx.amount));
    });

    // Analyze credit card usage
    const totalCreditLimit = creditCards.reduce((sum, card) => sum + Number(card.limit), 0);
    const totalBalance = creditCards.reduce((sum, card) => sum + Number(card.balance), 0);
    const totalUtilization = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0;

    // Calculate average APR
    const cardsWithAPR = creditCards.filter((card) => card.apr && card.apr > 0);
    const avgAPR = cardsWithAPR.length > 0
      ? cardsWithAPR.reduce((sum, card) => sum + Number(card.apr!), 0) / cardsWithAPR.length
      : 0;

    // Find cards with high utilization
    const highUtilizationCards = creditCards
      .map((card) => ({
        ...card,
        utilization: Number(card.limit) > 0 ? (Number(card.balance) / Number(card.limit)) * 100 : 0,
      }))
      .filter((card) => card.utilization > 30)
      .sort((a, b) => b.utilization - a.utilization);

    // Find cards with upcoming bills
    const now = new Date();
    const upcomingBills = creditCards
      .filter((card) => card.billDueDate && new Date(card.billDueDate) >= now)
      .map((card) => ({
        ...card,
        daysUntilDue: Math.ceil(
          (new Date(card.billDueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    // Recommendations
    const recommendations = [];

    if (totalUtilization > 30) {
      recommendations.push({
        type: "warning",
        title: "High Credit Utilization",
        message: `Your overall credit utilization is ${totalUtilization.toFixed(1)}%. Try to keep it below 30% for better credit health.`,
        priority: "high",
      });
    }

    if (highUtilizationCards.length > 0) {
      recommendations.push({
        type: "warning",
        title: "High Balance on Cards",
        message: `${highUtilizationCards.length} card(s) have utilization above 30%. Consider paying them down.`,
        priority: "medium",
        cards: highUtilizationCards.map((c) => ({
          name: c.name,
          utilization: c.utilization.toFixed(1) + "%",
        })),
      });
    }

    if (upcomingBills.length > 0) {
      const totalBills = upcomingBills.reduce((sum, card) => sum + (Number(card.billAmount) || 0), 0);
      recommendations.push({
        type: "info",
        title: "Upcoming Bills",
        message: `You have ${upcomingBills.length} bill(s) due soon. Total amount: ${totalBills.toLocaleString()}`,
        priority: "high",
        bills: upcomingBills.map((c) => ({
          name: c.name,
          amount: Number(c.billAmount) || 0,
          dueDate: c.billDueDate,
          daysUntilDue: c.daysUntilDue,
        })),
      });
    }

    if (avgAPR > 20) {
      recommendations.push({
        type: "suggestion",
        title: "High Interest Rates",
        message: `Your average APR is ${avgAPR.toFixed(2)}%. Consider transferring balances to lower APR cards or paying down high-interest debt first.`,
        priority: "medium",
      });
    }

    // Best card recommendations based on spending
    const bestCardsForSpending = creditCards
      .filter((card) => card.rewardProgram)
      .map((card) => ({
        card,
        score: calculateCardScore(card, spendingByCategory),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return NextResponse.json({
      summary: {
        totalCards: creditCards.length,
        totalCreditLimit,
        totalBalance,
        totalUtilization: totalUtilization.toFixed(2) + "%",
        avgAPR: avgAPR.toFixed(2) + "%",
        availableCredit: totalCreditLimit - totalBalance,
      },
      recommendations,
      highUtilizationCards: highUtilizationCards.map((c) => ({
        id: c.id,
        name: c.name,
        balance: Number(c.balance),
        limit: Number(c.limit),
        utilization: c.utilization.toFixed(1) + "%",
      })),
      upcomingBills: upcomingBills.map((c) => ({
        id: c.id,
        name: c.name,
        amount: Number(c.billAmount) || 0,
        dueDate: c.billDueDate,
        daysUntilDue: c.daysUntilDue,
      })),
      bestCardsForSpending: bestCardsForSpending.map((item) => ({
        id: item.card.id,
        name: item.card.name,
        rewardProgram: item.card.rewardProgram,
        score: item.score,
      })),
    });
  } catch (error) {
    console.error("Error getting credit card advisor:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function calculateCardScore(card: any, spendingByCategory: Record<string, number>): number {
  let score = 0;
  
  // Base score from reward program
  if (card.rewardProgram) {
    score += 10;
  }
  
  // Points balance adds to score
  if (card.pointsBalance) {
    score += Number(card.pointsBalance) / 1000;
  }
  
  // Lower APR is better
  if (card.apr) {
    score += (30 - Number(card.apr)) * 0.5;
  }
  
  // Lower utilization is better
  const utilization = Number(card.limit) > 0 
    ? (Number(card.balance) / Number(card.limit)) * 100 
    : 0;
  score += (100 - utilization) * 0.1;
  
  return score;
}

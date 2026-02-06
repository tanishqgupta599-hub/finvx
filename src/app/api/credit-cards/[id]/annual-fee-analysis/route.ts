import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { formatCurrency, CountryCode } from "@/lib/countries";

export const dynamic = "force-dynamic";

// GET - Analyze annual fee vs benefits
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const creditCard = await prisma.creditCard.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!creditCard) {
      return NextResponse.json({ error: "Credit card not found" }, { status: 404 });
    }

    // Get transaction history to calculate actual benefits
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: dbUser.id,
        category: "spending",
        account: {
          contains: creditCard.name || creditCard.last4,
        },
      },
      take: 100,
    });

    const annualFee = Number(creditCard.annualFee) || 0;
    const pointsBalance = Number(creditCard.pointsBalance) || 0;
    const rewardProgram = creditCard.rewardProgram || "";

    // Calculate estimated annual spending (from last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentTransactions = transactions.filter(
      (tx) => new Date(tx.date) >= threeMonthsAgo
    );
    const threeMonthSpending = recentTransactions.reduce(
      (sum, tx) => sum + Math.abs(Number(tx.amount)),
      0
    );
    const estimatedAnnualSpending = threeMonthSpending * 4;

    // Estimate rewards value (assuming 1% cashback or 1 point = ₹0.01)
    const estimatedRewardsValue = estimatedAnnualSpending * 0.01;
    const currentPointsValue = pointsBalance * 0.01;

    // Calculate net benefit
    const totalBenefits = estimatedRewardsValue + currentPointsValue;
    const netBenefit = totalBenefits - annualFee;
    const roi = annualFee > 0 ? ((netBenefit / annualFee) * 100) : 0;

    // Calculate break-even spending
    const breakEvenSpending = annualFee / 0.01; // Assuming 1% rewards

    // Recommendations
    const recommendations = [];
    if (annualFee > 0) {
      if (netBenefit < 0) {
        recommendations.push({
          type: "warning",
          message: `This card costs ${formatCurrency(annualFee, dbUser.countryCode as CountryCode)} annually but you're only getting ${formatCurrency(totalBenefits, dbUser.countryCode as CountryCode)} in benefits. Consider downgrading or closing.`,
          priority: "high",
        });
      } else if (roi < 50) {
        recommendations.push({
          type: "info",
          message: `You need to spend ${formatCurrency(breakEvenSpending, dbUser.countryCode as CountryCode)} annually to justify the fee. Current estimated: ${formatCurrency(estimatedAnnualSpending, dbUser.countryCode as CountryCode)}`,
          priority: "medium",
        });
      } else {
        recommendations.push({
          type: "success",
          message: `Great value! You're getting ${formatCurrency(netBenefit, dbUser.countryCode as CountryCode)} net benefit annually.`,
          priority: "low",
        });
      }
    } else {
      recommendations.push({
        type: "info",
        message: "No annual fee - great for everyday use!",
        priority: "low",
      });
    }

    return NextResponse.json({
      card: {
        name: creditCard.name,
        annualFee,
        rewardProgram,
        pointsBalance,
      },
      analysis: {
        estimatedAnnualSpending: estimatedAnnualSpending.toFixed(2),
        estimatedRewardsValue: estimatedRewardsValue.toFixed(2),
        currentPointsValue: currentPointsValue.toFixed(2),
        totalBenefits: totalBenefits.toFixed(2),
        netBenefit: netBenefit.toFixed(2),
        roi: roi.toFixed(2) + "%",
        breakEvenSpending: breakEvenSpending.toFixed(2),
      },
      recommendations,
      verdict: {
        worthIt: netBenefit > 0,
        score: annualFee > 0 
          ? Math.min(100, Math.max(0, 50 + (roi / 2)))
          : 100,
      },
    });
  } catch (error) {
    console.error("Error analyzing annual fee:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

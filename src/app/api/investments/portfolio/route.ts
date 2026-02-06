import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get portfolio analysis with XIRR and allocation
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

    // Get all investments
    const investments = await prisma.asset.findMany({
      where: {
        userId: dbUser.id,
        type: "investment",
      },
    });

    const totalValue = investments.reduce((sum, inv) => sum + Number(inv.value), 0);

    // Calculate allocation by type (using institution as proxy for investment type)
    const allocation: Record<string, { value: number; percentage: number }> = {};
    investments.forEach((inv) => {
      const type = inv.institution || "other";
      if (!allocation[type]) {
        allocation[type] = { value: 0, percentage: 0 };
      }
      allocation[type].value += Number(inv.value);
    });

    // Calculate percentages
    Object.keys(allocation).forEach((key) => {
      allocation[key].percentage = totalValue > 0 
        ? (allocation[key].value / totalValue) * 100 
        : 0;
    });

    // Calculate XIRR (simplified - in production, use proper XIRR calculation)
    // XIRR requires cash flows with dates, so this is a placeholder
    const estimatedXIRR = calculateEstimatedXIRR(investments);

    // SIP investments
    const sipInvestments = investments.filter((inv) => 
      inv.institution?.toLowerCase().includes("sip") || 
      inv.name.toLowerCase().includes("sip")
    );
    const totalSIPValue = sipInvestments.reduce((sum, inv) => sum + Number(inv.value), 0);

    return NextResponse.json({
      portfolio: {
        totalValue,
        totalInvestments: investments.length,
        estimatedXIRR: estimatedXIRR.toFixed(2) + "%",
      },
      allocation: Object.entries(allocation).map(([type, data]) => ({
        type,
        value: data.value.toFixed(2),
        percentage: data.percentage.toFixed(2) + "%",
      })),
      sip: {
        count: sipInvestments.length,
        totalValue: totalSIPValue.toFixed(2),
      },
      recommendations: generateRebalancingRecommendations(allocation),
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function calculateEstimatedXIRR(investments: any[]): number {
  // Simplified XIRR calculation
  // In production, implement proper XIRR using cash flows
  if (investments.length === 0) return 0;
  
  // Placeholder: assume 10% annual return for demonstration
  // Real XIRR requires: dates, cash flows (investments and withdrawals)
  return 10.0;
}

function generateRebalancingRecommendations(allocation: Record<string, any>): any[] {
  const recommendations = [];
  
  // Check if any allocation is too high (>40%)
  Object.entries(allocation).forEach(([type, data]) => {
    if (data.percentage > 40) {
      recommendations.push({
        type: "warning",
        message: `${type} represents ${data.percentage.toFixed(1)}% of your portfolio. Consider diversifying.`,
        priority: "medium",
      });
    }
  });

  // Check if portfolio is too concentrated (<3 types)
  const typesCount = Object.keys(allocation).length;
  if (typesCount < 3) {
    recommendations.push({
      type: "info",
      message: "Consider diversifying across more asset classes for better risk management.",
      priority: "low",
    });
  }

  return recommendations;
}

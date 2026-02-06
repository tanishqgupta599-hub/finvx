import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { formatCurrency, CountryCode } from "@/lib/countries";

export const dynamic = "force-dynamic";

// GET - Calculate capital gains
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get tax profile
    const taxProfile = await prisma.taxProfile.findUnique({
      where: { userId: dbUser.id },
    });

    // Get investment assets (stocks, MFs, etc.)
    const investments = await prisma.asset.findMany({
      where: {
        userId: dbUser.id,
        type: "investment",
      },
    });

    // Calculate capital gains (simplified - in production, track buy/sell transactions)
    const capitalGains: any[] = [];
    investments.forEach((inv) => {
      const purchasePrice = Number(inv.value) * 0.8; // Assume 20% gain for demo
      const currentValue = Number(inv.value);
      const gain = currentValue - purchasePrice;
      
      if (gain > 0) {
        capitalGains.push({
          asset: inv.name,
          purchasePrice: purchasePrice.toFixed(2),
          currentValue: currentValue.toFixed(2),
          gain: gain.toFixed(2),
          gainPercentage: ((gain / purchasePrice) * 100).toFixed(2) + "%",
        });
      }
    });

    const totalGains = capitalGains.reduce((sum, cg) => sum + parseFloat(cg.gain), 0);
    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.value) * 0.8, 0);

    // Tax calculation (India - simplified)
    const taxExemption = 100000; // ₹1L exemption for LTCG
    const taxableGains = Math.max(0, totalGains - taxExemption);
    const taxRate = taxProfile?.regime === "old" ? 0.20 : 0.10; // 20% old, 10% new
    const taxAmount = taxableGains * taxRate;

    return NextResponse.json({
      year: parseInt(year),
      summary: {
        totalInvested: totalInvested.toFixed(2),
        totalGains: totalGains.toFixed(2),
        taxableGains: taxableGains.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        taxRate: (taxRate * 100).toFixed(0) + "%",
      },
      capitalGains,
      exemptions: {
        longTermExemption: taxExemption,
        applied: Math.min(taxExemption, totalGains).toFixed(2),
      },
      recommendations: generateTaxRecommendations(taxableGains, taxProfile, dbUser.countryCode as CountryCode),
    });
  } catch (error) {
    console.error("Error calculating capital gains:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function generateTaxRecommendations(taxableGains: number, taxProfile: any, countryCode: CountryCode): any[] {
  const recommendations = [];

  if (taxableGains > 0) {
    recommendations.push({
      type: "info",
      message: `You have ${formatCurrency(taxableGains, countryCode)} in taxable capital gains. Consider tax-loss harvesting to offset gains.`,
      priority: "medium",
    });
  }

  if (taxProfile?.regime === "new") {
    recommendations.push({
      type: "suggestion",
      message: "You're on the new tax regime. Consider switching to old regime if you have significant deductions.",
      priority: "low",
    });
  }

  return recommendations;
}

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { formatCurrency, CountryCode } from "@/lib/countries";

export const dynamic = "force-dynamic";

// POST - Compare EMI vs full payment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { purchaseAmount, emiMonths, interestRate } = body;

    if (!purchaseAmount || !emiMonths) {
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

    const creditCard = await prisma.creditCard.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!creditCard) {
      return NextResponse.json({ error: "Credit card not found" }, { status: 404 });
    }

    const amount = Number(purchaseAmount);
    const months = Number(emiMonths);
    const rate = interestRate ? Number(interestRate) : (creditCard.apr ? Number(creditCard.apr) / 12 / 100 : 0.015); // Default 18% APR = 1.5% monthly

    // Calculate EMI using standard formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    const monthlyRate = rate;
    const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalEMIAmount = emi * months;
    const totalInterest = totalEMIAmount - amount;

    // Full payment (no interest if paid within grace period, otherwise minimum interest)
    const fullPaymentAmount = amount;
    const savingsWithFullPayment = totalEMIAmount - fullPaymentAmount;

    // Calculate interest breakdown
    let remainingPrincipal = amount;
    const emiBreakdown = [];
    for (let i = 1; i <= months; i++) {
      const interestComponent = remainingPrincipal * monthlyRate;
      const principalComponent = emi - interestComponent;
      remainingPrincipal -= principalComponent;
      
      emiBreakdown.push({
        month: i,
        emi: emi.toFixed(2),
        principal: principalComponent.toFixed(2),
        interest: interestComponent.toFixed(2),
        remainingBalance: remainingPrincipal.toFixed(2),
      });
    }

    return NextResponse.json({
      purchaseAmount: amount,
      comparison: {
        emi: {
          monthlyPayment: emi.toFixed(2),
          totalAmount: totalEMIAmount.toFixed(2),
          totalInterest: totalInterest.toFixed(2),
          months,
          breakdown: emiBreakdown,
        },
        fullPayment: {
          amount: fullPaymentAmount.toFixed(2),
          savings: savingsWithFullPayment.toFixed(2),
          interestSaved: totalInterest.toFixed(2),
        },
      },
      recommendation: {
        betterOption: savingsWithFullPayment > 0 ? "fullPayment" : "emi",
        message: savingsWithFullPayment > 0
          ? `You'll save ${formatCurrency(savingsWithFullPayment, dbUser.countryCode as CountryCode)} by paying in full`
          : `EMI is more affordable with ${formatCurrency(emi, dbUser.countryCode as CountryCode)} per month`,
        savingsPercentage: ((savingsWithFullPayment / totalEMIAmount) * 100).toFixed(2) + "%",
      },
    });
  } catch (error) {
    console.error("Error calculating EMI:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

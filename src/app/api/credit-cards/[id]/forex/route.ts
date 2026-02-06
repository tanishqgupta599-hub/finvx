import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Calculate forex markup for a credit card transaction
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
    const { amount, fromCurrency, toCurrency, exchangeRate } = body;

    if (!amount || !fromCurrency || !toCurrency) {
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

    // Standard forex markup is typically 2-3.5% for credit cards
    // This can vary by card, but we'll use 3% as default
    const defaultMarkup = 0.03;
    const markup = body.markup || defaultMarkup;

    // Use provided exchange rate or fetch from API (in production, use real API)
    const rate = exchangeRate || 1; // In production, fetch from currency API
    const baseAmount = Number(amount);
    const convertedAmount = baseAmount * rate;
    const markupAmount = convertedAmount * markup;
    const totalAmount = convertedAmount + markupAmount;

    // Calculate savings if using a card with lower/no forex markup
    const savingsWithNoMarkup = markupAmount;
    const savingsWithLowMarkup = markupAmount - (convertedAmount * 0.01); // Assuming 1% markup card

    return NextResponse.json({
      transaction: {
        originalAmount: baseAmount,
        originalCurrency: fromCurrency,
        convertedAmount,
        targetCurrency: toCurrency,
        exchangeRate: rate,
      },
      forex: {
        markupPercentage: (markup * 100).toFixed(2) + "%",
        markupAmount,
        totalAmount,
        effectiveRate: (rate * (1 + markup)).toFixed(4),
      },
      recommendations: {
        savingsWithNoMarkup,
        savingsWithLowMarkup,
        message: markup > 0.02 
          ? "Consider using a card with lower forex markup for international transactions"
          : "Your card has competitive forex rates",
      },
    });
  } catch (error) {
    console.error("Error calculating forex markup:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

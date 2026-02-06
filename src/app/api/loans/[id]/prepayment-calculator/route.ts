import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { formatCurrency, CountryCode } from "@/lib/countries";

export const dynamic = "force-dynamic";

// POST - Calculate prepayment savings
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
    const { prepaymentAmount, prepaymentDate } = body;

    if (!prepaymentAmount) {
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

    const loan = await prisma.loan.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const principal = Number(loan.principal);
    const balance = Number(loan.balance);
    const apr = Number(loan.apr) / 100; // Convert to decimal
    const monthlyRate = apr / 12;
    const monthlyPayment = Number(loan.monthlyPayment);
    const prepayment = Number(prepaymentAmount);

    // Calculate remaining months with current payment
    let remainingBalance = balance;
    let monthsRemaining = 0;
    while (remainingBalance > 0.01) {
      const interest = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      remainingBalance -= principalPayment;
      monthsRemaining++;
      if (monthsRemaining > 600) break; // Safety limit
    }

    // Calculate with prepayment
    let newBalance = balance - prepayment;
    let newMonthsRemaining = 0;
    const newMonthlyPayment = monthlyPayment; // Keep same payment
    while (newBalance > 0.01) {
      const interest = newBalance * monthlyRate;
      const principalPayment = newMonthlyPayment - interest;
      newBalance -= principalPayment;
      newMonthsRemaining++;
      if (newMonthsRemaining > 600) break;
    }

    // Calculate total interest with and without prepayment
    const totalInterestWithout = (monthlyPayment * monthsRemaining) - balance;
    const totalInterestWith = (monthlyPayment * newMonthsRemaining) - (balance - prepayment);
    const interestSaved = totalInterestWithout - totalInterestWith;

    // Calculate time saved
    const monthsSaved = monthsRemaining - newMonthsRemaining;

    // Calculate new EMI if reducing tenure
    const newEMI = calculateNewEMI(balance - prepayment, apr, newMonthsRemaining);

    return NextResponse.json({
      loan: {
        currentBalance: balance,
        monthlyPayment,
        apr: (apr * 100).toFixed(2) + "%",
      },
      prepayment: {
        amount: prepayment,
        newBalance: (balance - prepayment).toFixed(2),
      },
      comparison: {
        withoutPrepayment: {
          monthsRemaining,
          totalInterest: totalInterestWithout.toFixed(2),
          totalAmount: (balance + totalInterestWithout).toFixed(2),
        },
        withPrepayment: {
          monthsRemaining: newMonthsRemaining,
          totalInterest: totalInterestWith.toFixed(2),
          totalAmount: ((balance - prepayment) + totalInterestWith).toFixed(2),
        },
      },
      savings: {
        interestSaved: interestSaved.toFixed(2),
        monthsSaved,
        totalSavings: (interestSaved + prepayment).toFixed(2),
      },
      options: {
        reduceTenure: {
          newMonths: newMonthsRemaining,
          monthlyPayment: monthlyPayment.toFixed(2),
        },
        reduceEMI: {
          newEMI: newEMI.toFixed(2),
          monthsRemaining: monthsRemaining,
          emiReduction: (monthlyPayment - newEMI).toFixed(2),
        },
      },
      recommendation: {
        betterOption: monthsSaved > 12 ? "reduceTenure" : "reduceEMI",
        message: monthsSaved > 12
          ? `Prepaying will save you ${monthsSaved} months and ${formatCurrency(interestSaved, dbUser.countryCode as CountryCode)} in interest`
          : `Consider reducing EMI by ${formatCurrency(monthlyPayment - newEMI, dbUser.countryCode as CountryCode)} per month`,
      },
    });
  } catch (error) {
    console.error("Error calculating prepayment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function calculateNewEMI(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / months;
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
    (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
}

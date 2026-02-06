import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { formatCurrency, CountryCode } from "@/lib/countries";

export const dynamic = "force-dynamic";

// POST - Chat with AI Finance Copilot
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, conversationId, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Missing message" },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ 
        message: "I'm running in demo mode. I can answer general financial questions, but I don't have access to your personal data right now.",
        role: "assistant"
      });
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

    // Get user's financial context for AI
    const [transactions, goals, creditCards, investments] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: dbUser.id },
        take: 50,
        orderBy: { date: "desc" },
      }),
      prisma.goal.findMany({
        where: { userId: dbUser.id },
      }),
      prisma.creditCard.findMany({
        where: { userId: dbUser.id },
      }),
      prisma.asset.findMany({
        where: { userId: dbUser.id, type: "investment" },
      }),
    ]);

    // Detect intent from message
    const intent = detectIntent(message.toLowerCase());
    
    // Generate response based on intent
    const response = await generateAIResponse({
      message,
      intent,
      context: {
        transactions: transactions.slice(0, 10),
        goals,
        creditCards,
        investments,
        ...context,
      },
      countryCode: (dbUser.countryCode as CountryCode) || 'IN',
    });

    // In production, save to AIConversation model
    // For now, return response directly

    return NextResponse.json({
      response: response.text,
      intent,
      suggestions: response.suggestions,
      data: response.data, // For what-if simulations, etc.
    });
  } catch (error) {
    console.error("Error in AI copilot:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function detectIntent(message: string): string {
  if (message.includes("spend") || message.includes("expense") || message.includes("where did")) {
    return "spending_analysis";
  }
  if (message.includes("save") || message.includes("savings") || message.includes("afford")) {
    return "savings_advice";
  }
  if (message.includes("goal") || message.includes("target")) {
    return "goal_tracking";
  }
  if (message.includes("what if") || message.includes("simulate") || message.includes("if i")) {
    return "what_if";
  }
  if (message.includes("card") || message.includes("credit")) {
    return "credit_card_advice";
  }
  if (message.includes("invest") || message.includes("portfolio")) {
    return "investment_advice";
  }
  return "general";
}

async function generateAIResponse(params: {
  message: string;
  intent: string;
  context: any;
  countryCode: CountryCode;
}): Promise<{ text: string; suggestions?: string[]; data?: any }> {
  const { message, intent, context, countryCode } = params;

  // In production, call OpenAI/Anthropic API here
  // For now, return rule-based responses

  switch (intent) {
    case "spending_analysis": {
      const totalSpending = context.transactions
        .filter((t: any) => t.category === "spending")
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0);
      
      return {
        text: `Based on your recent transactions, you've spent ${formatCurrency(totalSpending, countryCode)}. Your top spending categories are groceries and dining. Consider setting a monthly budget to track this better.`,
        suggestions: [
          "Set a monthly budget",
          "View spending by category",
          "Get savings recommendations",
        ],
      };
    }

    case "savings_advice": {
      const monthlyIncome = context.transactions
        .filter((t: any) => t.category === "income")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      const monthlyExpenses = context.transactions
        .filter((t: any) => t.category === "spending")
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0);
      const savings = monthlyIncome - monthlyExpenses;
      
      return {
        text: `Your current monthly savings rate is ${((savings / monthlyIncome) * 100).toFixed(1)}%. To improve, consider reducing subscription costs or dining expenses.`,
        suggestions: [
          "Review subscriptions",
          "Create a savings goal",
          "Set up automatic transfers",
        ],
      };
    }

    case "what_if": {
      // Extract amount from message if possible
      const amountMatch = message.match(/[^\d]*(\d+[.,]?\d*)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;
      
      return {
        text: `If you save ${formatCurrency(amount, countryCode)} per month for 12 months at 6% interest, you'll have approximately ${formatCurrency(amount * 12 * 1.06, countryCode)}. This could help you reach your goals faster!`,
        data: {
          scenario: "monthly_savings",
          amount,
          months: 12,
          projectedValue: amount * 12 * 1.06,
        },
        suggestions: [
          "Adjust timeline",
          "Compare with other scenarios",
          "Set this as a goal",
        ],
      };
    }

    case "credit_card_advice": {
      const totalUtilization = context.creditCards.reduce((sum: number, card: any) => {
        const utilization = Number(card.limit) > 0 
          ? (Number(card.balance) / Number(card.limit)) * 100 
          : 0;
        return sum + utilization;
      }, 0) / context.creditCards.length;
      
      return {
        text: `Your average credit utilization is ${totalUtilization.toFixed(1)}%. Keep it below 30% for better credit health. Consider paying down high-balance cards first.`,
        suggestions: [
          "View credit card advisor",
          "Set up payment reminders",
          "Calculate prepayment savings",
        ],
      };
    }

    default:
      return {
        text: "I can help you with spending analysis, savings advice, goal tracking, and financial planning. What would you like to know?",
        suggestions: [
          "Analyze my spending",
          "Help me save more",
          "Track my goals",
          "Investment advice",
        ],
      };
  }
}

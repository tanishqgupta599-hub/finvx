import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { SubscriptionCadence } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Fetch all subscriptions
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

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: dbUser.id },
      orderBy: { nextChargeDate: "asc" },
    });

    // Calculate monthly cost for each subscription
    const subscriptionsWithMonthlyCost = subscriptions.map((sub) => {
      let monthlyCost = Number(sub.amount);
      if (sub.cadence === "yearly") {
        monthlyCost = Number(sub.amount) / 12;
      } else if (sub.cadence === "weekly") {
        monthlyCost = Number(sub.amount) * 4.33;
      }

      return {
        ...sub,
        monthlyCost,
      };
    });

    const totalMonthly = subscriptionsWithMonthlyCost.reduce(
      (sum, sub) => sum + sub.monthlyCost,
      0
    );

    return NextResponse.json({
      subscriptions: subscriptionsWithMonthlyCost,
      totalMonthly,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, amount, cadence, nextChargeDate } = body;

    if (!name || amount === undefined || !cadence || !nextChargeDate) {
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

    const subscription = await prisma.subscription.create({
      data: {
        userId: dbUser.id,
        name,
        amount: Number(amount),
        cadence: cadence as SubscriptionCadence,
        nextChargeDate: new Date(nextChargeDate),
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { PolicyType } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Fetch all insurance policies
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

    const policies = await prisma.insurancePolicy.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching insurance policies:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create a new insurance policy
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, provider, premium, coverageAmount, renewalDate } = body;

    if (!type || !provider || premium === undefined) {
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

    const policy = await prisma.insurancePolicy.create({
      data: {
        userId: dbUser.id,
        type: type as PolicyType,
        provider,
        premium: Number(premium),
        coverageAmount: coverageAmount ? Number(coverageAmount) : undefined,
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
      },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error("Error creating insurance policy:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

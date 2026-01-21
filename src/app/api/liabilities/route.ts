import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { LiabilityType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, balance, apr } = body;

    if (!name || balance === undefined || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const liability = await prisma.liability.create({
      data: {
        userId: dbUser.id,
        name,
        type: type as LiabilityType,
        balance: Number(balance),
        apr: apr ? Number(apr) : null,
      },
    });

    return NextResponse.json(liability);
  } catch (error) {
    console.error("Error creating liability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

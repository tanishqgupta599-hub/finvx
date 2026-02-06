import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function PATCH(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jurisdiction, regime, pan, fiscalYearStart, filingStatus } = body;

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const taxProfile = await prisma.taxProfile.upsert({
      where: { userId: dbUser.id },
      update: {
        jurisdiction,
        regime,
        pan,
        fiscalYearStart,
        filingStatus,
      },
      create: {
        userId: dbUser.id,
        jurisdiction: jurisdiction || "IN",
        regime: regime || "new",
        pan,
        fiscalYearStart: fiscalYearStart || "2024-04-01",
        filingStatus: filingStatus || "individual",
      },
    });

    return NextResponse.json(taxProfile);
  } catch (error) {
    console.error("Error updating tax profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { totalPotentialSavings, steps } = body;

    // Upsert the plan
    const plan = await prisma.taxActionPlan.upsert({
      where: { userId: dbUser.id },
      update: {
        totalPotentialSavings,
        generatedAt: new Date(),
        // Delete existing steps and recreate them is easiest for full update
        steps: {
          deleteMany: {},
          create: steps.map((s: any) => ({
            title: s.title,
            description: s.description,
            potentialSaving: s.potentialSaving,
            type: s.type,
            impactLevel: s.impactLevel,
            actionUrl: s.actionUrl,
            isCompleted: s.isCompleted || false,
            status: s.status || "pending",
            deadline: s.deadline
          }))
        }
      },
      create: {
        userId: dbUser.id,
        totalPotentialSavings,
        steps: {
          create: steps.map((s: any) => ({
            title: s.title,
            description: s.description,
            potentialSaving: s.potentialSaving,
            type: s.type,
            impactLevel: s.impactLevel,
            actionUrl: s.actionUrl,
            isCompleted: s.isCompleted || false,
            status: s.status || "pending",
            deadline: s.deadline
          }))
        }
      },
      include: { steps: true }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Failed to save tax plan:", error);
    return NextResponse.json({ error: "Database Error" }, { status: 500 });
  }
}

export async function GET() {
   const user = await currentUser();
   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   try {
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = await prisma.taxActionPlan.findUnique({
        where: { userId: dbUser.id },
        include: { steps: true }
    });

    return NextResponse.json(plan || null);
   } catch (error) {
     console.error("Failed to fetch tax plan:", error);
     return NextResponse.json({ error: "Database Error" }, { status: 500 });
   }
}

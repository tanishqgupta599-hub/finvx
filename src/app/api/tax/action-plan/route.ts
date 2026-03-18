import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { totalPotentialSavings, steps } = body;

    if (isMongoAvailable()) {
      const col = await getCollection<any>("taxActionPlans");
      if (!col) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      await col.updateOne(
        { clerkId: user.id },
        {
          $set: {
            clerkId: user.id,
            totalPotentialSavings,
            generatedAt: new Date().toISOString(),
            steps: Array.isArray(steps)
              ? steps.map((s: any) => ({
                  title: s.title,
                  description: s.description,
                  potentialSaving: s.potentialSaving,
                  type: s.type,
                  impactLevel: s.impactLevel,
                  actionUrl: s.actionUrl,
                  isCompleted: !!s.isCompleted,
                  status: s.status || "pending",
                  deadline: s.deadline || null,
                }))
              : [],
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: { createdAt: new Date().toISOString() },
        },
        { upsert: true }
      );
      const plan = await col.findOne({ clerkId: user.id });
      return NextResponse.json(plan);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const plan = await prisma.taxActionPlan.upsert({
      where: { userId: dbUser.id },
      update: {
        totalPotentialSavings,
        generatedAt: new Date(),
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
            deadline: s.deadline,
          })),
        },
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
            deadline: s.deadline,
          })),
        },
      },
      include: { steps: true },
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
    if (isMongoAvailable()) {
      const col = await getCollection<any>("taxActionPlans");
      if (!col) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const plan = await col.findOne({ clerkId: user.id });
      return NextResponse.json(plan || null);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const plan = await prisma.taxActionPlan.findUnique({ where: { userId: dbUser.id }, include: { steps: true } });

    return NextResponse.json(plan || null);
   } catch (error) {
     console.error("Failed to fetch tax plan:", error);
     return NextResponse.json({ error: "Database Error" }, { status: 500 });
   }
}

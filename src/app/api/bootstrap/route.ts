import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        incomeStreams: true,
        assets: true,
        liabilities: true,
        loans: true,
        transactions: true,
        subscriptions: true,
        creditCards: true,
        insurancePolicies: true,
        goals: true,
        calendarEvents: true,
        scamChecks: true,
        autopsyReports: true,
        actionItems: {
          include: {
            steps: true,
          },
        },
        emergencyContacts: true,
        vaultDocuments: true,
        friends: true,
        circles: {
          include: {
            expenses: true,
            members: true,
          }
        },
        ownedCircles: {
           include: {
            expenses: true,
            members: true,
          }
        }
      },
    });

    if (!dbUser) {
      // If user not found in DB but authenticated, return empty state instead of 404
      // This allows the frontend to initialize with clean state while waiting for sync
      return NextResponse.json({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        assets: [],
        loans: [],
        liabilities: [],
        transactions: [],
        subscriptions: [],
        creditCards: [],
        insurancePolicies: [],
        goals: [],
        calendarEvents: [],
        friends: [],
        circles: [],
        actionItems: [],
        scamChecks: [],
        autopsyReports: [],
        emergencyContacts: [],
        vaultDocuments: [],
      });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error fetching bootstrap data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma, { isDatabaseAvailable } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user-helper";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Debug info for Vercel diagnosis
  const dbStatus = {
    available: isDatabaseAvailable(),
    env_db_url_exists: !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL),
    node_env: process.env.NODE_ENV
  };

  try {
    // Ensure user exists in DB before fetching data
    await getOrCreateUser(user);

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
        },
        taxProfile: true,
        taxActionPlan: {
          include: {
            steps: true,
          }
        },
      },
    });

    if (!dbUser) {
      const clerkName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const fallbackName = user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
      const displayName = clerkName || fallbackName;
      
      return NextResponse.json({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: displayName,
        avatarUrl: user.imageUrl,
        isDemo: true, 
        debug: dbStatus,
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
        taxProfile: {
          jurisdiction: "IN",
          regime: "new",
          fiscalYearStart: "2024-04-01",
          filingStatus: "individual"
        }
      });
    }

    const responseData = {
      ...dbUser,
      taxProfile: dbUser.taxProfile || {
        jurisdiction: "IN",
        regime: "new",
        fiscalYearStart: "2024-04-01",
        filingStatus: "individual"
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching bootstrap data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

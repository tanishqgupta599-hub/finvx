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
      // If user not found in DB but authenticated, return empty state instead of 404
      // This allows the frontend to initialize with clean state while waiting for sync
      // Get name from Clerk - use firstName + lastName, or email username as fallback
      const clerkName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const fallbackName = user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
      const displayName = clerkName || fallbackName;
      
      return NextResponse.json({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: displayName,
        avatarUrl: user.imageUrl,
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
        // Default tax profile for new users so the page renders
        taxProfile: {
          jurisdiction: "IN",
          regime: "new",
          fiscalYearStart: "2024-04-01",
          filingStatus: "individual"
        }
      });
    }

    // Ensure taxProfile exists in the response even if null in DB (though we should probably upsert it elsewhere)
    // For now, let's just return what we have. If null, the UI might still hide it.
    // Better strategy: If dbUser.taxProfile is null, inject a default structure in the response
    // so the UI doesn't break/hide.
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

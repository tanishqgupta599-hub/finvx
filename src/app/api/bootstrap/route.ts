import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma, { isDatabaseAvailable } from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";
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

  // If using MongoDB, handle bootstrap via Mongo (with Prisma fallback merge)
  if (isMongoAvailable()) {
    const clerkName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const fallbackName = user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
    const displayName = clerkName || fallbackName;
    const users = await getCollection<any>("users");
    const assets = await getCollection<any>("assets");
    const loans = await getCollection<any>("loans");
    const subscriptions = await getCollection<any>("subscriptions");
    const transactions = await getCollection<any>("transactions");
    const creditCards = await getCollection<any>("creditCards");
    const liabilities = await getCollection<any>("liabilities");
    const friends = await getCollection<any>("friends");
    const circles = await getCollection<any>("circles");
    const sharedExpenses = await getCollection<any>("sharedExpenses");
    const emergencyContacts = await getCollection<any>("emergencyContacts");
    const vaultDocuments = await getCollection<any>("vaultDocuments");

    const userDoc = users ? await users.findOne({ clerkId: user.id }) : null;
    const responseData: any = {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: userDoc?.name || displayName,
      avatarUrl: user.imageUrl,
      isDemo: false,
      onboardingCompleted: true,
      debug: dbStatus,
      assets: assets ? await assets.find({ clerkId: user.id }).toArray() : [],
      loans: loans ? await loans.find({ clerkId: user.id }).toArray() : [],
      liabilities: liabilities ? await liabilities.find({ clerkId: user.id }).toArray() : [],
      transactions: transactions ? await transactions.find({ clerkId: user.id }).toArray() : [],
      subscriptions: subscriptions ? await subscriptions.find({ clerkId: user.id }).toArray() : [],
      creditCards: creditCards
        ? (await creditCards.find({ clerkId: user.id }).toArray()).map((card: any) => {
            const id = (card.id ?? card._id)?.toString();
            if (!id) return card;
            const { _id, ...rest } = card;
            return { id, ...rest };
          })
        : [],
      insurancePolicies: [],
      goals: [],
      calendarEvents: [],
      friends: friends ? await friends.find({ clerkId: user.id }).toArray() : [],
      circles: circles ? await circles.find({ clerkId: user.id }).toArray() : [],
      actionItems: [],
      scamChecks: [],
      autopsyReports: [],
      emergencyContacts: emergencyContacts ? await emergencyContacts.find({ clerkId: user.id }).toArray() : [],
      vaultDocuments: vaultDocuments ? await vaultDocuments.find({ clerkId: user.id }).toArray() : [],
      taxProfile: {
        jurisdiction: "IN",
        regime: "new",
        fiscalYearStart: "2024-04-01",
        filingStatus: "individual"
      }
    };

    if (userDoc) {
      const profileFields = [
        "mode",
        "riskProfile",
        "financialArchetype",
        "profession",
        "ageRange",
        "country",
        "countryCode",
        "currency",
        "hasDependents",
        "employment",
        "monthlyIncomeRange",
        "monthlyFixedCostRange",
        "insuranceHealth",
        "insuranceTerm",
        "emergencyContactName",
        "emergencyContactPhone",
        "onboardingCompleted"
      ];
      for (const key of profileFields) {
        if (userDoc[key] !== undefined) {
          responseData[key] = userDoc[key];
        }
      }
    }
    // If Mongo returns empty/unavailable but Prisma is available, merge Prisma data
    if (isDatabaseAvailable() && prisma) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { clerkId: user.id },
          include: {
            assets: true,
            liabilities: true,
            loans: true,
            transactions: true,
            subscriptions: true,
            creditCards: true,
            emergencyContacts: true,
            friends: true,
            circles: { include: { expenses: true, members: true } },
            taxProfile: true,
          },
        });
        if (dbUser) {
          responseData.assets = responseData.assets?.length ? responseData.assets : dbUser.assets;
          responseData.liabilities = responseData.liabilities?.length ? responseData.liabilities : dbUser.liabilities;
          responseData.loans = responseData.loans?.length ? responseData.loans : dbUser.loans;
          responseData.creditCards = responseData.creditCards?.length ? responseData.creditCards : dbUser.creditCards;
          responseData.transactions = responseData.transactions?.length ? responseData.transactions : dbUser.transactions;
          responseData.subscriptions = responseData.subscriptions?.length ? responseData.subscriptions : dbUser.subscriptions;
          responseData.emergencyContacts = responseData.emergencyContacts?.length ? responseData.emergencyContacts : dbUser.emergencyContacts;
          responseData.friends = responseData.friends?.length ? responseData.friends : dbUser.friends;
          responseData.circles = responseData.circles?.length ? responseData.circles : dbUser.circles;
          responseData.taxProfile = dbUser.taxProfile || responseData.taxProfile;
        }
      } catch (e) {
        // ignore and return Mongo-only payload
      }
    }
    return NextResponse.json(responseData);
  }

  // If Prisma database is unavailable, return safe demo payload
  if (!isDatabaseAvailable() || !prisma) {
    const clerkName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const fallbackName = user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
    const displayName = clerkName || fallbackName;
    return NextResponse.json({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: displayName,
      avatarUrl: user.imageUrl,
      isDemo: true,
      onboardingCompleted: true,
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
        onboardingCompleted: true, // Bypass onboarding in demo mode
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

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Check if database is available
async function checkDatabaseAvailable() {
  try {
    const { default: prisma, isDatabaseAvailable } = await import("@/lib/db");
    const { isMongoAvailable, getCollection } = await import("@/lib/mongo");
    // Prefer Mongo availability
    if (isMongoAvailable()) {
      const col = await getCollection<any>("loans");
      if (col) return { available: true, prisma: null, mongo: true };
    }
    if (!isDatabaseAvailable() || !prisma) {
      return { available: false, prisma: null };
    }
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    return { available: true, prisma, mongo: false };
  } catch (error) {
    return { available: false, prisma: null };
  }
}

// Check if Clerk is configured
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here';

// GET - Fetch all loans
export async function GET(request: Request) {
  const dbCheck = await checkDatabaseAvailable();

  if (!dbCheck.available) {
    // Demo mode
    return NextResponse.json({
      loans: [],
      summary: { total: 0, totalBalance: 0, totalMonthlyPayment: 0 }
    });
  }

  if (hasClerkKeys) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (dbCheck.mongo) {
        const { getCollection } = await import("@/lib/mongo");
        const loansCol = await getCollection<any>("loans");
        const loans = loansCol ? await loansCol.find({ clerkId: user.id }).sort({ balance: -1 }).toArray() : [];
        const totalBalance = loans.reduce((sum: number, loan: any) => sum + Number(loan.balance || 0), 0);
        const totalMonthlyPayment = loans.reduce((sum: number, loan: any) => sum + Number(loan.monthlyPayment || 0), 0);
        return NextResponse.json({
          loans,
          summary: { total: loans.length, totalBalance, totalMonthlyPayment }
        });
      }

      const dbUser = await dbCheck.prisma!.user.findUnique({ where: { clerkId: user.id } });
      if (!dbUser) {
        return NextResponse.json({ loans: [], summary: { total: 0, totalBalance: 0, totalMonthlyPayment: 0 } });
      }
      const loans = await dbCheck.prisma!.loan.findMany({ where: { userId: dbUser.id }, orderBy: { balance: "desc" } });

      const totalBalance = loans.reduce((sum, loan) => sum + Number(loan.balance), 0);
      const totalMonthlyPayment = loans.reduce((sum, loan) => sum + Number(loan.monthlyPayment), 0);

      return NextResponse.json({
        loans,
        summary: {
          total: loans.length,
          totalBalance,
          totalMonthlyPayment,
        },
      });
    } catch (error) {
      console.error("Error fetching loans:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    loans: [],
    summary: { total: 0, totalBalance: 0, totalMonthlyPayment: 0 }
  });
}

// POST - Create a new loan
export async function POST(request: Request) {
  const dbCheck = await checkDatabaseAvailable();
  const body = await request.json();
  const { name, principal, balance, apr, monthlyPayment, id } = body;

  if (!name || principal === undefined || balance === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Demo mode (no DB)
  if (!dbCheck.available) {
    return NextResponse.json({
      id: id || `loan-${Date.now()}`,
      userId: 'demo-user',
      name,
      principal: Number(principal),
      balance: Number(balance),
      apr: Number(apr || 0),
      monthlyPayment: Number(monthlyPayment || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // DB available
  if (hasClerkKeys) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (dbCheck.mongo) {
        const { getCollection } = await import("@/lib/mongo");
        const loansCol = await getCollection<any>("loans");
        if (!loansCol) {
          return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const doc = {
          clerkId: user.id,
          name,
          principal: Number(principal),
          balance: Number(balance),
          apr: Number(apr || 0),
          monthlyPayment: Number(monthlyPayment || 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const res = await loansCol.insertOne(doc);
        const loan = await loansCol.findOne({ _id: res.insertedId });
        return NextResponse.json(loan);
      }

      const dbUser = await dbCheck.prisma!.user.findUnique({ where: { clerkId: user.id } });
      if (!dbUser) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
      }
      const loan = await dbCheck.prisma!.loan.create({
        data: {
          userId: dbUser.id,
          name,
          principal: Number(principal),
          balance: Number(balance),
          apr: Number(apr || 0),
          monthlyPayment: Number(monthlyPayment || 0),
        },
      });

      return NextResponse.json(loan);
    } catch (error) {
      console.error("Error creating loan:", error);
      // Fallback to demo mode
      return NextResponse.json({
        id: id || `loan-${Date.now()}`,
        userId: 'demo-user',
        name,
        principal: Number(principal),
        balance: Number(balance),
        apr: Number(apr || 0),
        monthlyPayment: Number(monthlyPayment || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Fallback (no auth keys)
  return NextResponse.json({
    id: id || `loan-${Date.now()}`,
    userId: 'demo-user',
    name,
    principal: Number(principal),
    balance: Number(balance),
    apr: Number(apr || 0),
    monthlyPayment: Number(monthlyPayment || 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

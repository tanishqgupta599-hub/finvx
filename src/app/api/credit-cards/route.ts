import { NextResponse } from "next/server";
import { CardBrand } from "@prisma/client";

export const dynamic = "force-dynamic";

// Check if database is available
async function checkDatabaseAvailable() {
  try {
    const { default: prisma, isDatabaseAvailable } = await import("@/lib/db");
    if (!isDatabaseAvailable() || !prisma) {
      return { available: false, prisma: null };
    }
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    return { available: true, prisma };
  } catch (error) {
    return { available: false, prisma: null };
  }
}

// Check if Clerk is configured
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here';

// GET - Fetch all credit cards
export async function GET(request: Request) {
  // Check database availability
  const dbCheck = await checkDatabaseAvailable();
  
  // If no database, return empty array (demo mode)
  if (!dbCheck.available) {
    return NextResponse.json([]);
  }

  // If database available, check for Clerk
  if (hasClerkKeys) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const dbUser = await dbCheck.prisma!.user.findUnique({
        where: { clerkId: user.id },
      });

      if (!dbUser) {
        return NextResponse.json([]);
      }

      const creditCards = await dbCheck.prisma!.creditCard.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(creditCards);
    } catch (error) {
      console.error("Error fetching credit cards:", error);
      return NextResponse.json([]); // Return empty in demo mode
    }
  }

  // No Clerk configured - demo mode
  return NextResponse.json([]);
}

// POST - Create a new credit card
export async function POST(request: Request) {
  // Check database availability
  const dbCheck = await checkDatabaseAvailable();
  
  const body = await request.json();
  const { brand, last4, limit, balance, apr, name, billDueDate, billAmount, pointsBalance, rewardProgram, annualFee, id } = body;

  if (!brand || !last4 || limit === undefined || balance === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // If no database, return the card data as-is (demo mode - frontend handles storage)
  if (!dbCheck.available) {
    const validBrands = Object.values(CardBrand);
    const cardBrand = validBrands.includes(brand) ? brand : CardBrand.other;
    
    return NextResponse.json({
      id: id || `card-${Date.now()}`,
      brand: cardBrand,
      last4,
      limit: Number(limit),
      balance: Number(balance),
      apr: apr ? Number(apr) : null,
      name: name || `${brand} ${last4}`,
      billDueDate: billDueDate ? new Date(billDueDate).toISOString() : null,
      billAmount: billAmount ? Number(billAmount) : null,
      pointsBalance: pointsBalance ? Number(pointsBalance) : null,
      rewardProgram: rewardProgram || null,
      annualFee: annualFee ? Number(annualFee) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Database available - try to save
  try {
    // Check for Clerk if configured
    if (hasClerkKeys) {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const dbUser = await dbCheck.prisma!.user.findUnique({
        where: { clerkId: user.id },
      });

      if (!dbUser) {
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 404 }
        );
      }

      // Validate brand
      const validBrands = Object.values(CardBrand);
      const cardBrand = validBrands.includes(brand) ? brand : CardBrand.other;

      const creditCard = await dbCheck.prisma!.creditCard.create({
        data: {
          userId: dbUser.id,
          brand: cardBrand,
          last4,
          limit: Number(limit),
          balance: Number(balance),
          apr: apr ? Number(apr) : null,
          name: name || `${brand} ${last4}`,
          billDueDate: billDueDate ? new Date(billDueDate) : null,
          billAmount: billAmount ? Number(billAmount) : null,
          pointsBalance: pointsBalance ? Number(pointsBalance) : null,
          rewardProgram: rewardProgram || null,
          annualFee: annualFee ? Number(annualFee) : null,
        },
      });

      return NextResponse.json(creditCard);
    } else {
      // No Clerk but database available - return demo response
      const validBrands = Object.values(CardBrand);
      const cardBrand = validBrands.includes(brand) ? brand : CardBrand.other;
      
      return NextResponse.json({
        id: id || `card-${Date.now()}`,
        brand: cardBrand,
        last4,
        limit: Number(limit),
        balance: Number(balance),
        apr: apr ? Number(apr) : null,
        name: name || `${brand} ${last4}`,
        billDueDate: billDueDate ? new Date(billDueDate).toISOString() : null,
        billAmount: billAmount ? Number(billAmount) : null,
        pointsBalance: pointsBalance ? Number(pointsBalance) : null,
        rewardProgram: rewardProgram || null,
        annualFee: annualFee ? Number(annualFee) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error creating credit card:", error);
    // In demo mode, still return success so frontend can use local state
    const validBrands = Object.values(CardBrand);
    const cardBrand = validBrands.includes(brand) ? brand : CardBrand.other;
    
    return NextResponse.json({
      id: id || `card-${Date.now()}`,
      brand: cardBrand,
      last4,
      limit: Number(limit),
      balance: Number(balance),
      apr: apr ? Number(apr) : null,
      name: name || `${brand} ${last4}`,
      billDueDate: billDueDate ? new Date(billDueDate).toISOString() : null,
      billAmount: billAmount ? Number(billAmount) : null,
      pointsBalance: pointsBalance ? Number(pointsBalance) : null,
      rewardProgram: rewardProgram || null,
      annualFee: annualFee ? Number(annualFee) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

import { NextResponse } from "next/server";
import { TransactionCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

// Check if database is available
async function checkDatabaseAvailable() {
  try {
    const { default: prisma, isDatabaseAvailable } = await import("@/lib/db");
    if (!isDatabaseAvailable() || !prisma) {
      return { available: false, prisma: null };
    }
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

// GET - Fetch all transactions with filters
export async function GET(request: Request) {
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

      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const category = searchParams.get("category");
      const limit = searchParams.get("limit");
      const offset = searchParams.get("offset");

      const dbUser = await dbCheck.prisma!.user.findUnique({
        where: { clerkId: user.id },
      });

      if (!dbUser) {
        return NextResponse.json([]);
      }

      const where: any = { userId: dbUser.id };
      
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }
      
      if (category) {
        where.category = category as TransactionCategory;
      }

      const transactions = await dbCheck.prisma!.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit ? parseInt(limit) : undefined,
        skip: offset ? parseInt(offset) : undefined,
      });

      return NextResponse.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json([]); // Return empty in demo mode
    }
  }

  // No Clerk configured - demo mode
  return NextResponse.json([]);
}

// POST - Create a new transaction
export async function POST(request: Request) {
  const dbCheck = await checkDatabaseAvailable();
  
  const body = await request.json();
  const { date, amount, description, category, account, merchant, status, paymentSource, id } = body;

  if (amount === undefined || !description || !category || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // If no database, return the transaction data as-is (demo mode)
  if (!dbCheck.available) {
    return NextResponse.json({
      id: id || `txn-${Date.now()}`,
      date: new Date(date).toISOString(),
      amount: Number(amount),
      description,
      category,
      account: account || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Database available - try to save
  try {
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
        // Return demo response if user not found
        return NextResponse.json({
          id: id || `txn-${Date.now()}`,
          date: new Date(date).toISOString(),
          amount: Number(amount),
          description,
          category,
          account: account || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Use a transaction to ensure data consistency
      const result = await dbCheck.prisma!.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            userId: dbUser.id,
            date: new Date(date),
            amount: Number(amount),
            description,
            category: category as TransactionCategory,
            account,
          },
        });

        // Handle Balance Updates
        // Priority: paymentSource ID > account name match
        
        const absAmount = Math.abs(Number(amount));

        if (paymentSource?.id && paymentSource?.type) {
          if (paymentSource.type === 'asset') {
            // Asset Logic: Income adds, Spending removes
            const change = category === 'income' ? absAmount : -absAmount;
            
            await tx.asset.update({
              where: { id: paymentSource.id },
              data: { value: { increment: change } }
            });
          } else if (paymentSource.type === 'creditCard') {
            // Credit Card Logic: Spending adds to debt (balance), Income/Payment reduces debt
            const change = category === 'spending' ? absAmount : -absAmount;
            
            // 1. Update Credit Card
            const card = await tx.creditCard.update({
              where: { id: paymentSource.id },
              data: { balance: { increment: change } }
            });

            // 2. Sync with Liability (Best effort match by name)
            // Construct potential liability names based on card details
            const liabilityName1 = `${card.brand} ${card.last4}`; // e.g. "VISA 1234" (Case sensitive match might be tricky, let's try to be consistent)
            const liabilityName2 = `${card.brand.toUpperCase()} ${card.last4}`;
            
            // Find a liability that matches
            const liability = await tx.liability.findFirst({
              where: {
                userId: dbUser.id,
                OR: [
                  { name: liabilityName1 },
                  { name: liabilityName2 },
                  { name: card.name || "" } // If card has a custom name
                ]
              }
            });

            if (liability) {
               await tx.liability.update({
                 where: { id: liability.id },
                 data: { balance: { increment: change } }
               });
            } else {
              // Optionally create a new liability if it doesn't exist?
              // The frontend does this. Let's do it here too for consistency.
              await tx.liability.create({
                data: {
                  userId: dbUser.id,
                  name: liabilityName2, // Default to uppercase brand + last4
                  type: 'credit',
                  balance: card.balance, // Use the NEW balance from the card update (which we just did? No, Prisma returns updated record)
                  apr: card.apr
                }
              });
            }
          }
        } else if (account) {
          // Fallback to name matching if no paymentSource provided
          const asset = await tx.asset.findFirst({
            where: { userId: dbUser.id, name: account },
          });

          if (asset) {
            const change = category === 'income' ? absAmount : -absAmount;
            await tx.asset.update({
              where: { id: asset.id },
              data: { value: { increment: change } }
            });
          } else {
            // Try Credit Card (fuzzy match brand+last4 or just match name if stored)
            // Since we don't have exact ID, this is best effort.
            const cards = await tx.creditCard.findMany({ where: { userId: dbUser.id } });
            const matchedCard = cards.find(c => 
              c.name === account || 
              `${c.brand.toUpperCase()} ${c.last4}` === account
            );

            if (matchedCard) {
               const change = category === 'spending' ? absAmount : -absAmount;
               await tx.creditCard.update({
                 where: { id: matchedCard.id },
                 data: { balance: { increment: change } }
               });
            }
          }
        }

        return transaction;
      });

      return NextResponse.json(result);
    } else {
      // No Clerk but database available - return demo response
      return NextResponse.json({
        id: id || `txn-${Date.now()}`,
        date: new Date(date).toISOString(),
        amount: Number(amount),
        description,
        category,
        account: account || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error creating transaction:", error);
    // In demo mode, still return success so frontend can use local state
    return NextResponse.json({
      id: id || `txn-${Date.now()}`,
      date: new Date(date).toISOString(),
      amount: Number(amount),
      description,
      category,
      account: account || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

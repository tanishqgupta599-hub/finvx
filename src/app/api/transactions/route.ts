import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { TransactionCategory } from "@prisma/client";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, amount, description, category, account, merchant, status, paymentSource } = body;

    if (amount === undefined || !description || !category || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
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
          
          await tx.creditCard.update({
            where: { id: paymentSource.id },
            data: { balance: { increment: change } }
          });
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
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

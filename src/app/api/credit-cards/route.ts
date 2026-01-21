import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { CardBrand } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { brand, last4, limit, balance, apr, name } = body;

    if (!brand || !last4 || limit === undefined || balance === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
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

    const creditCard = await prisma.creditCard.create({
      data: {
        userId: dbUser.id,
        brand: cardBrand,
        last4,
        limit: Number(limit),
        balance: Number(balance),
        apr: Number(apr || 0),
        name: name || `${brand} ${last4}`,
      },
    });

    return NextResponse.json(creditCard);
  } catch (error) {
    console.error("Error creating credit card:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
